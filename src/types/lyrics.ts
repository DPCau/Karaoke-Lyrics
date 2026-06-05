export interface LyricChar {
  text: string;
  startTime: number;
  duration: number;
}

export interface Pronunciation {
  phonetic: string;
  romanized: string;
}

export type PronunciationMode = "disabled" | "romaji" | "phonetic";

export interface LyricLine {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  chars: LyricChar[];
  pronunciation?: Pronunciation;
}
