use crate::engine::export::types::{ExportLine, ExportOptions};
use serde::Serialize;

// ---------------------------------------------------------------------------
// JSON exporter — full and compact formats
// ---------------------------------------------------------------------------

/// Full format: includes metadata, pronunciation, line-level + word-level timing
#[derive(Serialize)]
struct FullExport {
    #[serde(skip_serializing_if = "Option::is_none")]
    title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    artist: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    album: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    author: Option<String>,
    format: String,
    lines: Vec<FullLine>,
}

#[derive(Serialize)]
struct FullLine {
    text: String,
    start_time: f64,
    end_time: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pronunciation: Option<String>,
    characters: Vec<FullChar>,
}

#[derive(Serialize)]
struct FullChar {
    text: String,
    start_time: f64,
    end_time: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pronunciation: Option<String>,
}

/// Compact format: only word-level timing and pronunciation
#[derive(Serialize)]
struct CompactExport {
    format: String,
    lines: Vec<CompactLine>,
}

#[derive(Serialize)]
struct CompactLine {
    #[serde(skip_serializing_if = "Option::is_none")]
    pronunciation: Option<String>,
    words: Vec<CompactWord>,
}

#[derive(Serialize)]
struct CompactWord {
    text: String,
    start_time: f64,
    end_time: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pronunciation: Option<String>,
}

/// Export lyrics to JSON format
///
/// `path` — output file path
/// `lines` — lyrics lines with timing
/// `options` — export options (compact vs full)
pub fn export_json(
    path: &str,
    lines: &[ExportLine],
    options: &ExportOptions,
) -> Result<(), String> {
    let json_str = if options.compact_json {
        export_compact(lines, options)
    } else {
        export_full(lines, options)
    };

    std::fs::write(path, &json_str)
        .map_err(|e| format!("Failed to write JSON file: {}", e))?;

    Ok(())
}

fn export_full(lines: &[ExportLine], options: &ExportOptions) -> String {
    let full_lines: Vec<FullLine> = lines
        .iter()
        .map(|l| {
            let chars: Vec<FullChar> = l
                .characters
                .iter()
                .map(|c| {
                    let pron = if options.compact_json {
                        None
                    } else {
                        l.pronunciation.clone().or_else(|| {
                            // Check if character has embedded pronunciation info
                            None
                        })
                    };
                    FullChar {
                        text: c.text.clone(),
                        start_time: c.start_time,
                        end_time: c.end_time,
                        pronunciation: pron,
                    }
                })
                .collect();

            FullLine {
                text: l.text.clone(),
                start_time: l.start_time,
                end_time: l.end_time,
                pronunciation: l.pronunciation.clone(),
                characters: chars,
            }
        })
        .collect();

    let export = FullExport {
        title: options.title.clone(),
        artist: options.artist.clone(),
        album: options.album.clone(),
        author: options.author.clone(),
        format: "karaoke-json-full".to_string(),
        lines: full_lines,
    };

    serde_json::to_string_pretty(&export)
        .unwrap_or_else(|_| "{}".to_string())
}

fn export_compact(lines: &[ExportLine], _options: &ExportOptions) -> String {
    let compact_lines: Vec<CompactLine> = lines
        .iter()
        .map(|l| {
            let words: Vec<CompactWord> = l
                .characters
                .iter()
                .map(|c| CompactWord {
                    text: c.text.clone(),
                    start_time: c.start_time,
                    end_time: c.end_time,
                    pronunciation: l.pronunciation.clone(),
                })
                .collect();

            CompactLine {
                pronunciation: l.pronunciation.clone(),
                words,
            }
        })
        .collect();

    let export = CompactExport {
        format: "karaoke-json-compact".to_string(),
        lines: compact_lines,
    };

    serde_json::to_string_pretty(&export)
        .unwrap_or_else(|_| "{}".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::export::types::ExportChar;

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
    fn test_export_full_json_contains_format_field() {
        let chars = vec![make_char("A", 0.0, 500.0)];
        let line = make_line("A", 0.0, chars);
        let opts = ExportOptions {
            format: "json".to_string(),
            encoding: "utf-8".to_string(),
            bom: false,
            enhanced_word_tags: false,
            compact_json: false,
            title: Some("Test".to_string()),
            artist: None,
            album: None,
            author: None,
            offset: 0.0,
            video_input: None,
            video_output: None,
            video_preset: None,
            video_bitrate: None,
            ass_font_name: None,
            ass_font_size: None,
            ass_resolution: None,
        };

        let json_str = export_full(&[line], &opts);
        assert!(json_str.contains("\"format\": \"karaoke-json-full\""));
        assert!(json_str.contains("\"title\": \"Test\""));
    }

    #[test]
    fn test_export_compact_json() {
        let chars = vec![make_char("A", 0.0, 500.0)];
        let line = make_line("A", 0.0, chars);
        let opts = ExportOptions {
            format: "json".to_string(),
            encoding: "utf-8".to_string(),
            bom: false,
            enhanced_word_tags: false,
            compact_json: true,
            title: None,
            artist: None,
            album: None,
            author: None,
            offset: 0.0,
            video_input: None,
            video_output: None,
            video_preset: None,
            video_bitrate: None,
            ass_font_name: None,
            ass_font_size: None,
            ass_resolution: None,
        };

        let json_str = export_compact(&[line], &opts);
        assert!(json_str.contains("\"format\": \"karaoke-json-compact\""));
    }
}
