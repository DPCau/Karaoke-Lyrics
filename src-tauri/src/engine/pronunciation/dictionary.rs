use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// A pinyin-syllable entry from the dictionary.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PinyinEntry {
    pub pinyin: String,
    pub tone: u8,       // 1-5 (5 = neutral)
    pub frequency: u32, // higher = more common
}

/// Dictionary of Chinese character / word pronunciations.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PronunciationDict {
    /// Character-level dictionary: char → possible readings
    pub char_dict: HashMap<String, Vec<PinyinEntry>>,
    /// Word-level dictionary: multi-char word → possible readings
    pub word_dict: HashMap<String, Vec<PinyinEntry>>,
}

impl PronunciationDict {
    /// Load dictionary from bincode-encoded bytes.
    pub fn load_from_bytes(bytes: &[u8]) -> Result<Self, String> {
        bincode::deserialize(bytes).map_err(|e| format!("Failed to deserialize dictionary: {}", e))
    }

    /// Look up a single character's pronunciation, considering context.
    ///
    /// * `text` - The character to look up
    /// * `context` - Surrounding text (used for disambiguation in future versions)
    ///
    /// Returns the best-matching pronunciation sorted by frequency (highest first).
    pub fn lookup_char(&self, text: &str, _context: Option<&str>) -> Vec<PinyinEntry> {
        // First try word-level dictionary for multi-char context matches
        if let Some(context) = _context {
            let context_chars: Vec<char> = context.chars().collect();
            let char_count = context_chars.len();
            if char_count > 1 {
                // Check if this character is part of a known multi-character word in context
                for word_len in (2..=char_count.min(4)).rev() {
                    for start in 0..=(char_count - word_len) {
                        // Build a &str slice for the word using byte positions
                        let word: String = context_chars[start..start + word_len].iter().collect();
                        if let Some(entries) = self.word_dict.get(word.as_str()) {
                            // If the matched word contains our character, use the word's pronunciation
                            if let Some(byte_pos) = word.find(text) {
                                // Convert byte index to character index
                                let char_pos = word[..byte_pos].chars().count();
                                if let Some(entry) = entries.get(char_pos) {
                                    return vec![entry.clone()];
                                }
                            }
                        }
                    }
                }
            }
        }

        // Fall back to character dictionary
        self.char_dict
            .get(text)
            .map(|entries| {
                let mut sorted = entries.clone();
                sorted.sort_by(|a, b| b.frequency.cmp(&a.frequency));
                sorted
            })
            .unwrap_or_default()
    }

    /// Batch lookup of multiple texts.
    pub fn lookup_batch(&self, texts: &[String]) -> Vec<Vec<PinyinEntry>> {
        let full_context = texts.join("");
        texts
            .iter()
            .map(|t| {
                let context = self.build_char_context(t, &full_context);
                self.lookup_char(t, context.as_deref())
            })
            .collect()
    }

    /// Build context string around a character from the full text.
    fn build_char_context(&self, text: &str, full_context: &str) -> Option<String> {
        let byte_pos = full_context.find(text)?;

        // Convert byte position to char index
        let char_pos = full_context[..byte_pos].chars().count();
        let total_chars = full_context.chars().count();

        // Work in character indices, then convert back to byte offsets
        let start_char = char_pos.saturating_sub(3);
        let end_char = (char_pos + text.chars().count() + 3).min(total_chars);

        // Convert char indices back to byte offsets for slicing
        let start_byte = full_context
            .char_indices()
            .nth(start_char)
            .map(|(i, _)| i)
            .unwrap_or(0);
        let end_byte = full_context
            .char_indices()
            .nth(end_char)
            .map(|(i, _)| i)
            .unwrap_or(full_context.len());

        Some(full_context[start_byte..end_byte].to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lookup_char_returns_sorted_by_frequency() {
        let mut char_dict = HashMap::new();
        char_dict.insert(
            "好".to_string(),
            vec![
                PinyinEntry {
                    pinyin: "hao3".to_string(),
                    tone: 3,
                    frequency: 100,
                },
                PinyinEntry {
                    pinyin: "hao4".to_string(),
                    tone: 4,
                    frequency: 50,
                },
            ],
        );

        let dict = PronunciationDict {
            char_dict,
            word_dict: HashMap::new(),
        };

        let result = dict.lookup_char("好", None);
        assert_eq!(result.len(), 2);
        assert_eq!(result[0].pinyin, "hao3");
        assert_eq!(result[0].tone, 3);
        assert_eq!(result[1].pinyin, "hao4");
    }

    #[test]
    fn test_lookup_char_empty() {
        let dict = PronunciationDict {
            char_dict: HashMap::new(),
            word_dict: HashMap::new(),
        };

        let result = dict.lookup_char("无", None);
        assert!(result.is_empty());
    }

    #[test]
    fn test_lookup_batch() {
        let mut char_dict = HashMap::new();
        char_dict.insert(
            "你".to_string(),
            vec![PinyinEntry {
                pinyin: "ni3".to_string(),
                tone: 3,
                frequency: 100,
            }],
        );
        char_dict.insert(
            "好".to_string(),
            vec![PinyinEntry {
                pinyin: "hao3".to_string(),
                tone: 3,
                frequency: 100,
            }],
        );

        let dict = PronunciationDict {
            char_dict,
            word_dict: HashMap::new(),
        };

        let texts = vec!["你".to_string(), "好".to_string()];
        let results = dict.lookup_batch(&texts);
        assert_eq!(results.len(), 2);
        assert_eq!(results[0][0].pinyin, "ni3");
        assert_eq!(results[1][0].pinyin, "hao3");
    }

    #[test]
    fn test_word_dict_priority() {
        let mut char_dict = HashMap::new();
        char_dict.insert(
            "行".to_string(),
            vec![PinyinEntry {
                pinyin: "xing2".to_string(),
                tone: 2,
                frequency: 80,
            }],
        );

        let mut word_dict = HashMap::new();
        word_dict.insert(
            "银行".to_string(),
            vec![
                PinyinEntry {
                    pinyin: "yin2".to_string(),
                    tone: 2,
                    frequency: 100,
                },
                PinyinEntry {
                    pinyin: "hang2".to_string(),
                    tone: 2,
                    frequency: 100,
                },
            ],
        );

        let dict = PronunciationDict {
            char_dict,
            word_dict,
        };

        // When "行" is in context "银行", it should match the word entry
        let result = dict.lookup_char("行", Some("银行"));
        assert!(!result.is_empty());
        // The second entry in "银行" is for "行" -> "hang2"
        assert_eq!(result[0].pinyin, "hang2");
    }
}
