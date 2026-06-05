use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Shared types for the export engine
// ---------------------------------------------------------------------------

/// A single character with timing information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportChar {
    pub text: String,
    pub start_time: f64,
    pub end_time: f64,
}

/// A single line with characters and optional pronunciation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportLine {
    pub text: String,
    pub start_time: f64,
    pub end_time: f64,
    pub characters: Vec<ExportChar>,
    pub pronunciation: Option<String>,
}

/// Export format options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportOptions {
    pub format: String,
    pub encoding: String,
    pub bom: bool,
    pub enhanced_word_tags: bool,
    pub compact_json: bool,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub author: Option<String>,
    pub offset: f64,

    // Video-specific
    pub video_input: Option<String>,
    pub video_output: Option<String>,
    pub video_preset: Option<String>,
    pub video_bitrate: Option<String>,

    // ASS-specific
    pub ass_font_name: Option<String>,
    pub ass_font_size: Option<f64>,
    pub ass_resolution: Option<Resolution>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Resolution {
    pub width: u32,
    pub height: u32,
}
