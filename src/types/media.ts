export interface MediaFileInfo {
  path: string;
  name: string;
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
}

export interface WaveformData {
  samples: Float32Array;
  peaks: number[];
  sampleRate: number;
  bitsPerSample: number;
}
