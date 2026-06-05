use serde::{Deserialize, Serialize};

/// Waveform data generated from an audio file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WaveformData {
    pub peaks: Vec<f32>,
    pub duration_ms: u64,
    pub sample_rate: u32,
    pub channels: u16,
}

/// Generate waveform peak data from an audio file using the symphonia decoder.
///
/// `target_width` specifies the desired number of peak values (typically
/// corresponding to the display width in pixels). The returned `peaks` vector
/// contains normalized values in the range `[-1.0, 1.0]`.
///
/// Multi-channel audio is reduced to mono by taking the maximum absolute
/// value across all channels for each sample frame.
pub fn generate_waveform(file_path: &str, target_width: u32) -> Result<WaveformData, String> {
    use symphonia::core::audio::SampleBuffer;
    use symphonia::core::codecs::DecoderOptions;
    use symphonia::core::formats::FormatOptions;
    use symphonia::core::io::MediaSourceStream;
    use symphonia::core::meta::MetadataOptions;
    use symphonia::core::probe::Hint;

    let target_width = target_width.max(1) as usize;

    // Open the file.
    let file = std::fs::File::open(file_path)
        .map_err(|e| format!("Failed to open file: {}", e))?;

    let mss = MediaSourceStream::new(Box::new(file), Default::default());

    // Build a probe hint from the file extension.
    let mut hint = Hint::new();
    if let Some(ext) = std::path::Path::new(file_path)
        .extension()
        .and_then(|e| e.to_str())
    {
        hint.with_extension(ext);
    }

    let format_opts = FormatOptions::default();
    let metadata_opts = MetadataOptions::default();

    let probed = symphonia::default::get_probe()
        .format(&hint, mss, &format_opts, &metadata_opts)
        .map_err(|e| format!("Failed to probe audio: {}", e))?;

    let mut format = probed.format;

    // Find the first audio track by checking for channel info (unique to audio tracks).
    let track = format
        .tracks()
        .iter()
        .find(|t| t.codec_params.channels.is_some())
        .ok_or_else(|| "No audio track found in file".to_string())?;

    let codec_params = track.codec_params.clone();
    let track_id = track.id;
    let sample_rate = codec_params.sample_rate.unwrap_or(44100);
    let num_channels = codec_params
        .channels
        .map(|c| c.count())
        .unwrap_or(2) as usize;

    // Create decoder.
    let decoder_opts = DecoderOptions::default();
    let mut decoder = symphonia::default::get_codecs()
        .make(&codec_params, &decoder_opts)
        .map_err(|e| format!("Failed to create audio decoder: {}", e))?;

    // Estimate total audio frames to calculate samples_per_peak.
    let total_frames = estimate_total_frames(&codec_params).unwrap_or(0);

    // Calculate how many sample-frames map to one output peak.
    let samples_per_peak = if total_frames > 0 {
        (total_frames as usize / target_width).max(1)
    } else {
        512
    };

    // Decode the audio and compute peak values.
    let mut peaks: Vec<f32> = Vec::with_capacity(target_width);
    let mut current_peak_max: f32 = 0.0;
    let mut samples_in_current_peak: usize = 0;
    let mut decoded_frames: u64 = 0;

    loop {
        let packet = match format.next_packet() {
            Ok(pkt) => pkt,
            Err(symphonia::core::errors::Error::IoError(ref e))
                if e.kind() == std::io::ErrorKind::UnexpectedEof =>
            {
                break;
            }
            Err(_) => break,
        };

        if packet.track_id() != track_id {
            continue;
        }

        let decoded = match decoder.decode(&packet) {
            Ok(d) => d,
            Err(symphonia::core::errors::Error::DecodeError(_)) => continue,
            Err(_) => break,
        };

        let spec = *decoded.spec();
        let frames = decoded.frames() as usize;

        let mut sample_buf = SampleBuffer::<f32>::new(frames as u64, spec);
        sample_buf.copy_interleaved_ref(decoded);
        let samples = sample_buf.samples();

        for frame in 0..frames {
            let start = frame * spec.channels.count();

            // Multi-channel: take max absolute value across all channels.
            let mut frame_peak: f32 = 0.0;
            for ch in 0..spec.channels.count() {
                let val = samples[start + ch].abs();
                if val > frame_peak {
                    frame_peak = val;
                }
            }

            if frame_peak > current_peak_max {
                current_peak_max = frame_peak;
            }
            samples_in_current_peak += 1;
            decoded_frames += 1;

            // Push peak when we've accumulated enough samples.
            if samples_in_current_peak >= samples_per_peak {
                peaks.push(current_peak_max);
                current_peak_max = 0.0;
                samples_in_current_peak = 0;
            }
        }
    }

    // Flush remaining samples into a final peak.
    if samples_in_current_peak > 0 || peaks.is_empty() {
        peaks.push(current_peak_max);
    }

    // Resample to exactly target_width using linear interpolation.
    let peaks = if peaks.len() != target_width {
        resample_peaks(&peaks, target_width)
    } else {
        peaks
    };

    // Compute duration in milliseconds.
    let duration_ms = if sample_rate > 0 && total_frames > 0 {
        (total_frames * 1000) / sample_rate as u64
    } else if sample_rate > 0 && decoded_frames > 0 {
        (decoded_frames * 1000) / sample_rate as u64
    } else {
        0
    };

    Ok(WaveformData {
        peaks,
        duration_ms,
        sample_rate,
        channels: num_channels as u16,
    })
}

/// Attempt to estimate total audio frames from codec parameters.
fn estimate_total_frames(params: &symphonia::core::codecs::CodecParameters) -> Option<u64> {
    // Direct frame count from codec metadata.
    if let Some(n) = params.n_frames {
        return Some(n);
    }

    // Estimate from sample_rate and approximate duration.
    // If time_base and a reasonable duration are available, compute it.
    // Otherwise fall back to the caller.
    None
}

/// Linearly resample a slice of peaks to the target length.
fn resample_peaks(src: &[f32], target_len: usize) -> Vec<f32> {
    if src.is_empty() || target_len == 0 {
        return vec![0.0; target_len.max(1)];
    }
    if src.len() == 1 {
        return vec![src[0]; target_len];
    }

    let src_len = src.len();
    let mut out = Vec::with_capacity(target_len);

    for i in 0..target_len {
        // Map output index to floating-point position in source.
        let pos = (i as f64 * (src_len - 1) as f64) / (target_len - 1) as f64;
        let idx = pos as usize;
        let frac = pos - idx as f64;

        if idx >= src_len - 1 {
            out.push(src[src_len - 1]);
        } else {
            let val = src[idx] as f64 * (1.0 - frac) + src[idx + 1] as f64 * frac;
            out.push(val as f32);
        }
    }

    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resample_peaks_same_length() {
        let src = vec![0.1, 0.5, 0.9];
        let resampled = resample_peaks(&src, 3);
        assert_eq!(resampled.len(), 3);
        assert!((resampled[0] - 0.1).abs() < 1e-6);
        assert!((resampled[2] - 0.9).abs() < 1e-6);
    }

    #[test]
    fn test_resample_peaks_shorter() {
        let src = vec![0.0, 1.0];
        let resampled = resample_peaks(&src, 5);
        assert_eq!(resampled.len(), 5);
        assert!((resampled[0] - 0.0).abs() < 1e-6);
        assert!((resampled[4] - 1.0).abs() < 1e-6);
        // Midpoint should be around 0.5
        assert!((resampled[2] - 0.5).abs() < 0.01);
    }

    #[test]
    fn test_resample_peaks_empty() {
        let resampled = resample_peaks(&[], 10);
        assert_eq!(resampled.len(), 10);
        assert!(resampled.iter().all(|&v| v == 0.0));
    }

    #[test]
    fn test_resample_peaks_single() {
        let resampled = resample_peaks(&[0.8], 5);
        assert_eq!(resampled.len(), 5);
        assert!(resampled.iter().all(|&v| (v - 0.8).abs() < 1e-6));
    }
}
