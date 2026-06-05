use crate::engine::export::types::{ExportLine, ExportOptions};
use encoding_rs::Encoding;
use std::io::Write;

// ---------------------------------------------------------------------------
// LRC exporter — standard lyrics format with optional word-level tags
// ---------------------------------------------------------------------------

/// Format a time in milliseconds to LRC timestamp `[mm:ss.xx]`
fn format_time_lrc(ms: f64) -> String {
    let total_secs = (ms / 1000.0).max(0.0);
    let mins = (total_secs / 60.0).floor() as u64;
    let secs = total_secs % 60.0;
    format!("{:02}:{:05.2}", mins, secs)
}

/// Format a time in milliseconds to enhanced LRC word tag `<mm:ss.xx>`
fn format_time_word(ms: f64) -> String {
    let total_secs = (ms / 1000.0).max(0.0);
    let mins = (total_secs / 60.0).floor() as u64;
    let secs = total_secs % 60.0;
    format!("{:02}:{:05.2}", mins, secs)
}

/// Generate a standard LRC line: `[mm:ss.xx]text`
fn format_line_standard(line: &ExportLine) -> String {
    if line.start_time == f64::NEG_INFINITY || line.end_time == f64::NEG_INFINITY {
        return String::new();
    }
    let timestamp = format_time_lrc(line.start_time);
    let text = line.text.trim();
    format!("[{}]{}", timestamp, text)
}

/// Generate an enhanced LRC line with word-level `<mm:ss.xx>` tags
fn format_line_enhanced(line: &ExportLine) -> String {
    if line.start_time == f64::NEG_INFINITY || line.characters.is_empty() {
        return format_line_standard(line);
    }

    let timestamp = format_time_lrc(line.start_time);

    // Build word-level tags: for each character with timing, emit <timestamp>text
    let mut tagged = String::new();
    for ch in &line.characters {
        if ch.start_time >= 0.0 {
            tagged.push_str(&format!(
                "<{}>{}",
                format_time_word(ch.start_time),
                ch.text
            ));
        } else {
            tagged.push_str(&ch.text);
        }
    }

    // If no character had timing, fall back to standard line format
    if tagged.is_empty() {
        return format_line_standard(line);
    }

    format!("[{}]{}", timestamp, tagged)
}

/// Generate metadata tags (comments in LRC)
fn format_metadata(options: &ExportOptions) -> Vec<String> {
    let mut lines = Vec::new();

    if let Some(ref artist) = options.artist {
        lines.push(format!("[ar:{}]", artist));
    }
    if let Some(ref title) = options.title {
        lines.push(format!("[ti:{}]", title));
    }
    if let Some(ref album) = options.album {
        lines.push(format!("[al:{}]", album));
    }
    if let Some(ref author) = options.author {
        lines.push(format!("[by:{}]", author));
    }
    if !options.offset.is_nan() && options.offset != 0.0 {
        lines.push(format!("[offset:{}]", options.offset as i64));
    }

    lines
}

/// Export lyrics to LRC format
///
/// `path` — output file path
/// `lines` — lyrics lines with timing
/// `options` — export options (encoding, metadata, enhanced word tags)
pub fn export_lrc(
    path: &str,
    lines: &[ExportLine],
    options: &ExportOptions,
) -> Result<(), String> {
    let encoding = Encoding::for_label(options.encoding.as_bytes())
        .unwrap_or(encoding_rs::UTF_8);

    let mut lines_out: Vec<String> = Vec::new();

    // Metadata header
    let metadata = format_metadata(options);
    lines_out.extend(metadata);

    // LRC line format: standard or enhanced (word-level)
    if options.enhanced_word_tags {
        for line in lines {
            let l = format_line_enhanced(line);
            if !l.is_empty() {
                lines_out.push(l);
            }
        }
    } else {
        for line in lines {
            let l = format_line_standard(line);
            if !l.is_empty() {
                lines_out.push(l);
            }
        }
    }

    let content = lines_out.join("\n");

    // Encode with selected encoding
    let (encoded, _, _) = encoding.encode(&content);

    let mut file = std::fs::File::create(path)
        .map_err(|e| format!("Failed to create LRC file: {}", e))?;

    file.write_all(&encoded)
        .map_err(|e| format!("Failed to write LRC file: {}", e))?;

    // Write UTF-8 BOM if UTF-8 with BOM is requested
    // (encoding_rs doesn't auto-add BOM for UTF-8, handle explicitly)
    if options.encoding == "utf-8" && options.bom {
        // Actually we need to prepend BOM — re-open and write
        let mut with_bom = Vec::new();
        with_bom.extend_from_slice(&[0xEF, 0xBB, 0xBF]); // UTF-8 BOM
        with_bom.extend_from_slice(&encoded);
        std::fs::write(path, &with_bom)
            .map_err(|e| format!("Failed to write LRC file with BOM: {}", e))?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::export::types::{ExportChar, ExportLine, ExportOptions};

    fn make_char(text: &str, start: f64, end: f64) -> ExportChar {
        ExportChar {
            text: text.to_string(),
            start_time: start,
            end_time: end,
        }
    }

    fn make_line(text: &str, start: f64, chars: Vec<ExportChar>) -> ExportLine {
        ExportLine {
            text: text.to_string(),
            start_time: start,
            end_time: start + 2000.0,
            characters: chars,
            pronunciation: None,
        }
    }

    #[test]
    fn test_format_time_lrc() {
        assert_eq!(format_time_lrc(0.0), "00:00.00");
        assert_eq!(format_time_lrc(1000.0), "00:01.00");
        assert_eq!(format_time_lrc(61500.0), "01:01.50");
        assert_eq!(format_time_lrc(3600000.0), "60:00.00");
    }

    #[test]
    fn test_format_line_standard() {
        let line = make_line("Hello world", 123450.0, vec![]);
        let result = format_line_standard(&line);
        assert_eq!(result, "[02:03.45]Hello world");
    }

    #[test]
    fn test_format_line_enhanced() {
        let chars = vec![
            make_char("H", 1000.0, 1200.0),
            make_char("e", 1200.0, 1400.0),
            make_char("y", 0.0, 0.0), // no timing
        ];
        let line = make_line("Hey", 1000.0, chars);
        let result = format_line_enhanced(&line);
        assert_eq!(result, "[00:01.00]<00:01.00>H<00:01.20>e<00:00.00>y");
    }

    #[test]
    fn test_metadata() {
        let opts = ExportOptions {
            format: "lrc".to_string(),
            encoding: "utf-8".to_string(),
            bom: false,
            enhanced_word_tags: true,
            compact_json: false,
            title: Some("Test Song".to_string()),
            artist: Some("Test Artist".to_string()),
            album: Some("Test Album".to_string()),
            author: Some("Me".to_string()),
            offset: 0.0,
            video_input: None,
            video_output: None,
            video_preset: None,
            video_bitrate: None,
            ass_font_name: None,
            ass_font_size: None,
            ass_resolution: None,
        };

        let meta = format_metadata(&opts);
        assert!(meta.contains(&"[ar:Test Artist]".to_string()));
        assert!(meta.contains(&"[ti:Test Song]".to_string()));
        assert!(meta.contains(&"[al:Test Album]".to_string()));
        assert!(meta.contains(&"[by:Me]".to_string()));
    }
}
