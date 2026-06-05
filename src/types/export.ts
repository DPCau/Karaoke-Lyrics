export type ExportFormat = "ass" | "srt" | "lrc" | "json" | "xml";

export interface ExportConfig {
  format: ExportFormat;
  outputPath: string;
  includePronunciation: boolean;
  includeStyles: boolean;
  videoEmbed: boolean;
  resolution: {
    width: number;
    height: number;
  };
  framerate: number;
  quality: number;
}
