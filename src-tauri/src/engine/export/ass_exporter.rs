use crate::engine::export::types::{ExportLine, ExportOptions};

// ---------------------------------------------------------------------------
// ASS exporter — Advanced SubStation Alpha with karaoke \K tags
// ---------------------------------------------------------------------------

/// ASS color as &HAABBGGRR
/// Alpha is inverted: 0 = fully opaque, 255 = fully transparent
/// In ASS, the alpha byte represents transparency, where 0 = fully opaque
/// and 255 = fully transparent (inverted from standard RGBA).
///
/// We take an RGBA hex string like "#RRGGBB" or "#RRGGBBAA" and convert.
fn ass_color(r: u8, g: u8, b: u8, alpha: f64) -> String {
    // Alpha in ASS is in the range 0-255 where 0 = fully opaque
    // We receive alpha as 0.0-1.0 where 0.0 = fully transparent
    // Inversion: ass_alpha = (1.0 - alpha) * 255
    let ass_a = ((1.0 - alpha.clamp(0.0, 1.0)) * 255.0).round() as u8;
    format!("&H{:02X}{:02X}{:02X}{:02X}", ass_a, b, g, r)
}

fn parse_hex_color(hex: &str) -> (u8, u8, u8) {
    let hex = hex.trim_start_matches('#');
    match hex.len() {
        6 => {
            let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(255);
            let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(255);
            let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(255);
            (r, g, b)
        }
        8 => {
            let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(255);
            let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(255);
            let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(255);
            (r, g, b)
        }
        _ => (255, 255, 255), // default white
    }
}

/// Escape ASS special characters
fn ass_escape(text: &str) -> String {
    text.replace('\\', "\\\\")
        .replace('{', "\\{")
        .replace('}', "\\}")
}

/// Format ASS time: h:mm:ss.cc (centiseconds)
fn format_ass_time(ms: f64) -> String {
    let total_secs = (ms / 1000.0).max(0.0);
    let hours = (total_secs / 3600.0).floor() as u64;
    let mins = ((total_secs % 3600.0) / 60.0).floor() as u64;
    let secs = total_secs % 60.0;
    let centiseconds = ((secs.fract()) * 100.0).round() as u64;
    let secs_int = secs.floor() as u64;
    format!("{}:{:02}:{:02}.{:02}", hours, mins, secs_int, centiseconds)
}

/// Build an ASS Dialogue line with \K karaoke tags for each character.
///
/// Format:
/// `Dialogue: layer,start,end,style,name,marginL,marginR,marginV,effect,{\\Kdur1}text1{\\Kdur2}text2...`
///
/// PrimaryColour is used for the karaoke highlight, SecondaryColour for the
/// un-sung portion. When a character has timing, its duration is encoded with
/// \K.  The text before the first \K is displayed until its time comes.
fn build_ass_dialogue(
    line: &ExportLine,
    style_name: &str,
) -> String {
    if line.start_time.is_infinite() || line.end_time.is_infinite() {
        return String::new();
    }

    let start = format_ass_time(line.start_time);
    let end = format_ass_time(line.end_time);

    // Build the karaoke text with \K tags
    let mut text = String::new();

    // Style overrides for karaoke: PrimaryColour is the highlight (sung) color,
    // SecondaryColour is the un-sung color.
    // We use \c (secondary) for the base text color and rely on \K to sweep
    // to PrimaryColour.
    text.push_str("{\\K100}"); // initial dummy to establish timing base

    for ch in &line.characters {
        let dur = (ch.end_time - ch.start_time).max(0.0);
        let dur_cs = (dur / 10.0).round() as u64; // \K uses centiseconds
        let escaped = ass_escape(&ch.text);
        if dur_cs > 0 {
            text.push_str(&format!("{{\\K{}}}{}", dur_cs, escaped));
        } else {
            // Character without timing — append directly
            text.push_str(&escaped);
        }
    }

    format!(
        "Dialogue: 0,{},{},{},,0,0,0,,{}",
        start, end, style_name, text
    )
}

/// Build the ASS file header with style definitions.
fn build_ass_header(options: &ExportOptions) -> String {
    let font_name = options
        .ass_font_name
        .clone()
        .unwrap_or_else(|| "Arial".to_string());
    let font_size = options.ass_font_size.unwrap_or(48.0);

    let (width, height) = match &options.ass_resolution {
        Some(r) => (r.width, r.height),
        None => (1920, 1080),
    };

    // Colors for karaoke style:
    // PrimaryColour = sung color (highlight) — cyan/white
    // SecondaryColour = un-sung (base) color — white/gray
    // We use \K tags which sweep from SecondaryColour to PrimaryColour.
    //
    // Alpha inversion: in ASS, 0 = fully opaque, 255 = fully transparent.
    // We want fully opaque colors.
    // ass_color returns &HAABBGGRR already with the &H prefix, so we use {}
    // (not {:X}) in the format string.
    let primary = ass_color(255, 255, 255, 1.0);   // white, fully opaque
    let secondary = ass_color(100, 200, 255, 1.0);  // light blue, fully opaque
    let outline = ass_color(0, 0, 0, 1.0);           // black, fully opaque
    let background = ass_color(0, 0, 0, 0.0);        // black, fully transparent

    format!(
        "[Script Info]
ScriptType: v4.00+
PlayResX: {}
PlayResY: {}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{},{},{},{},{},{},0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1
Style: Karaoke,{},{},{},{},{},{},0,0,0,0,100,100,0,0,1,2,1,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
",
        width, height,
        font_name, font_size, primary, secondary, outline, background,
        font_name, font_size, primary, secondary, outline, background,
    )
}

/// Export lyrics to ASS subtitle format with \K karaoke tags
///
/// `path` — output file path
/// `lines` — lyrics lines with timing
/// `options` — export options (ASS font, resolution)
pub fn export_ass(
    path: &str,
    lines: &[ExportLine],
    options: &ExportOptions,
) -> Result<(), String> {
    let mut out = String::new();

    // Header
    out.push_str(&build_ass_header(options));

    // Dialogue lines
    for line in lines {
        let dialogue = build_ass_dialogue(line, "Karaoke");
        if !dialogue.is_empty() {
            out.push_str(&dialogue);
            out.push('\n');
        }
    }

    std::fs::write(path, &out)
        .map_err(|e| format!("Failed to write ASS file: {}", e))?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ass_color_opaque() {
        // white, alpha=1.0 (fully opaque in our convention)
        // ASS alpha = (1.0 - 1.0) * 255 = 0
        // &HAABBGGRR -> &H00FFFFFF
        let c = ass_color(255, 255, 255, 1.0);
        assert_eq!(c, "&H00FFFFFF");
    }

    #[test]
    fn test_ass_color_transparent() {
        // alpha=0.0 (fully transparent in our convention)
        // ASS alpha = (1.0 - 0.0) * 255 = 255 = 0xFF
        let c = ass_color(255, 0, 0, 0.0);
        assert_eq!(c, "&HFF0000FF");
    }

    #[test]
    fn test_ass_color_half() {
        // alpha=0.5
        // ASS alpha = (1.0 - 0.5) * 255 = 127.5 = 128 = 0x80
        let c = ass_color(0, 255, 0, 0.5);
        // G=255 -> 0xFF, R=0 -> 0x00, B=0 -> 0x00
        // &HAABBGGRR -> &H8000FF00
        assert_eq!(c, "&H8000FF00");
    }

    #[test]
    fn test_format_ass_time() {
        assert_eq!(format_ass_time(0.0), "0:00:00.00");
        assert_eq!(format_ass_time(1000.0), "0:00:01.00");
        assert_eq!(format_ass_time(61500.0), "0:01:01.50");
        assert_eq!(format_ass_time(3723000.0), "1:02:03.00");
    }

    #[test]
    fn test_parse_hex_color() {
        assert_eq!(parse_hex_color("#FF0000"), (255, 0, 0));
        assert_eq!(parse_hex_color("#00FF00"), (0, 255, 0));
        assert_eq!(parse_hex_color("#0000FF"), (0, 0, 255));
    }
}
