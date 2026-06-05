import type { MediaFileInfo } from "./media";
import type { Project } from "./project";
import type { ExportConfig } from "./export";

export interface TauriCommands {
  openMedia: (type: "video" | "audio") => Promise<MediaFileInfo | null>;
  getWaveform: (path: string) => Promise<number[]>;
  loadProject: (path: string) => Promise<Project>;
  saveProject: (path: string, project: Project) => Promise<void>;
  exportProject: (config: ExportConfig) => Promise<{ path: string }>;
  convertEncoding: (path: string, from: string, to: string) => Promise<string>;
}

export interface TauriEvents {
  "media-time-update": { currentTime: number; duration: number };
  "waveform-generated": { data: number[]; sampleRate: number };
  "export-progress": { percent: number; message: string };
  "project-saved": { path: string };
}
