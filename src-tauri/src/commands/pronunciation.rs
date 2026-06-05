use serde::{Deserialize, Serialize};
use log::info;
use std::sync::OnceLock;

use crate::engine::pronunciation::dictionary::PronunciationDict;
use crate::engine::pronunciation::pinyin::builtin_dict;

/// Global singleton dictionary, lazily initialised.
static DICT: OnceLock<PronunciationDict> = OnceLock::new();

fn get_dict() -> &'static PronunciationDict {
    DICT.get_or_init(builtin_dict)
}

/// Result of looking up a single character.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PronunciationResult {
    pub text: String,
    pub pinyin: String,
    pub tone: u8,
    pub alternatives: Vec<String>,
}

/// Input for a single character lookup.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharLookup {
    pub text: String,
    pub context: Option<String>,
}

/// Annotated character with pronunciation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnnotatedChar {
    pub text: String,
    pub pronunciation: Option<PronunciationResult>,
}

#[tauri::command]
pub fn pronunciation_lookup(text: String, mode: String) -> Option<PronunciationResult> {
    info!("Pronunciation lookup: '{}' (mode: {})", text, mode);

    if text.is_empty() {
        return None;
    }

    let dict = get_dict();
    let entries = dict.lookup_char(&text, Some(&text));

    if entries.is_empty() {
        return None;
    }

    let primary = &entries[0];
    let alternatives: Vec<String> = entries[1..]
        .iter()
        .map(|e| format!("{}{}", e.pinyin, e.tone))
        .collect();

    Some(PronunciationResult {
        text,
        pinyin: primary.pinyin.clone(),
        tone: primary.tone,
        alternatives,
    })
}

#[tauri::command]
pub fn pronunciation_annotate_batch(
    chars: Vec<CharLookup>,
    mode: String,
) -> Vec<AnnotatedChar> {
    info!(
        "Batch annotating {} characters (mode: {})",
        chars.len(),
        mode
    );

    let dict = get_dict();

    chars
        .into_iter()
        .map(|ch| {
            let context = ch.context.as_deref();
            let entries = dict.lookup_char(&ch.text, context);

            let pronunciation = if entries.is_empty() {
                None
            } else {
                let primary = &entries[0];
                let alternatives: Vec<String> = entries[1..]
                    .iter()
                    .map(|e| format!("{}{}", e.pinyin, e.tone))
                    .collect();
                Some(PronunciationResult {
                    text: ch.text.clone(),
                    pinyin: primary.pinyin.clone(),
                    tone: primary.tone,
                    alternatives,
                })
            };

            AnnotatedChar {
                text: ch.text,
                pronunciation,
            }
        })
        .collect()
}
