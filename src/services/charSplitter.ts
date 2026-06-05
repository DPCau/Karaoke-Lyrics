export interface SplitToken {
  text: string;
  isPunctuation: boolean;
  isSpace: boolean;
}

/** Unicode ranges for CJK characters */
const CJK_RE = /[㐀-䶿一-鿿豈-﫿]/;

/** CJK punctuation range */
const CJK_PUNCTUATION_RE = /[　-〿＀-｠､-￯]/;

/** General punctuation (ASCII + Unicode) */
const PUNCTUATION_RE = /^[!-/:-@\[-`{-~]$/;

/** English letters and digits */
const ALPHANUM_RE = /^[a-zA-Z0-9]$/;

/** Whitespace (non-CJK spaces) */
const SPACE_RE = /^[\t ]$/;

function isCJK(char: string): boolean {
  return CJK_RE.test(char);
}

function isCJKPunctuation(char: string): boolean {
  return CJK_PUNCTUATION_RE.test(char);
}

function isASCIIPunctuation(char: string): boolean {
  return PUNCTUATION_RE.test(char);
}

function isAlphanumeric(char: string): boolean {
  return ALPHANUM_RE.test(char);
}

function isSpace(char: string): boolean {
  return SPACE_RE.test(char);
}

function isPunctuation(char: string): boolean {
  return isASCIIPunctuation(char) || isCJKPunctuation(char);
}

/**
 * CharSplitter: Split text into character/word tokens.
 */
export class CharSplitter {
  /**
   * Split Chinese text into tokens:
   * - Each CJK character is an independent token
   * - Consecutive alphanumeric characters form a single token
   * - Punctuation attaches to the preceding token (unless at start)
   * - Spaces are independent tokens
   */
  splitChinese(text: string): SplitToken[] {
    const tokens: SplitToken[] = [];
    let buffer = "";
    let mode: "cjk" | "alnum" | "space" | "other" | null = null;
    let bufferIsPunct = false;

    function flushBuffer() {
      if (buffer.length > 0) {
        // Check if entire buffer is punctuation
        const allPunct = [...buffer].every((c) => isPunctuation(c));
        tokens.push({
          text: buffer,
          isPunctuation: allPunct || bufferIsPunct,
          isSpace: false,
        });
        buffer = "";
        bufferIsPunct = false;
      }
    }

    for (const char of text) {
      if (isSpace(char)) {
        // Space is always standalone
        flushBuffer();
        tokens.push({ text: char, isPunctuation: false, isSpace: true });
        mode = null;
        continue;
      }

      if (isCJK(char)) {
        flushBuffer();
        // Check if next char is punctuation (lookahead)
        tokens.push({ text: char, isPunctuation: false, isSpace: false });
        mode = null;
        continue;
      }

      if (isAlphanumeric(char)) {
        if (mode !== "alnum") {
          flushBuffer();
          mode = "alnum";
        }
        buffer += char;
        continue;
      }

      if (isPunctuation(char)) {
        if (tokens.length > 0 && mode === null) {
          // Attach to last token
          const last = tokens[tokens.length - 1];
          if (!last.isSpace) {
            last.text += char;
            if (!last.isPunctuation) {
              last.isPunctuation = true;
            }
            continue;
          }
        }
        // If at start or after space, create standalone punctuation token
        flushBuffer();
        tokens.push({ text: char, isPunctuation: true, isSpace: false });
        mode = null;
        continue;
      }

      // Other characters (symbols, etc.)
      if (mode !== "other") {
        flushBuffer();
        mode = "other";
      }
      buffer += char;
    }

    flushBuffer();
    return tokens;
  }

  /**
   * Split English text by words:
   * - Split on spaces
   * - Detach trailing punctuation from each word
   */
  splitByWord(text: string): SplitToken[] {
    const tokens: SplitToken[] = [];
    const words = text.split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.length === 0) continue;

      // Add space between words (except for the first)
      if (i > 0) {
        tokens.push({ text: " ", isPunctuation: false, isSpace: true });
      }

      // Detach trailing punctuation
      let cleaned = word;
      let trailingPunct = "";

      while (cleaned.length > 0 && isPunctuation(cleaned[cleaned.length - 1])) {
        trailingPunct = cleaned[cleaned.length - 1] + trailingPunct;
        cleaned = cleaned.slice(0, -1);
      }

      if (cleaned.length > 0) {
        tokens.push({
          text: cleaned,
          isPunctuation: false,
          isSpace: false,
        });
      }

      if (trailingPunct.length > 0) {
        tokens.push({
          text: trailingPunct,
          isPunctuation: true,
          isSpace: false,
        });
      }
    }

    return tokens;
  }

  /**
   * Split text using automatic language detection.
   * Uses Chinese splitting if any CJK character is present, otherwise English splitting.
   */
  split(text: string, language?: string): SplitToken[] {
    if (language === "zh" || language === "ja" || language === "ko") {
      return this.splitChinese(text);
    }
    if (language === "en") {
      return this.splitByWord(text);
    }

    // Auto-detect: check for CJK characters
    const hasCJK = [...text].some((c) => isCJK(c));
    if (hasCJK) {
      return this.splitChinese(text);
    }
    return this.splitByWord(text);
  }
}
