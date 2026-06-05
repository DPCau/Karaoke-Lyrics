export interface MediaReference {
  type: "video" | "audio";
  path: string;
  originalName: string;
  duration: number;
}

export interface ProjectMeta {
  name: string;
  version: string;
  created: string;
  modified: string;
}

export interface Project {
  meta: ProjectMeta;
  media: MediaReference[];
  lyrics: import("./lyrics").LyricLine[];
  style: import("./style").LyricStyle;
  timing: {
    leadIn: number;
    bpm: number | null;
  };
}
