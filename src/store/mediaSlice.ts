import type { StateCreator } from "zustand";
import type { AppStore } from "./store";

export interface MediaSlice {
  videoPath: string | null;
  audioPath: string | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  waveformData: number[];
  waveformSampleRate: number;
  seekTarget: number | null;
  playbackSpeed: number;

  setVideoPath: (path: string | null) => void;
  setAudioPath: (path: string | null) => void;
  setDuration: (ms: number) => void;
  setCurrentTime: (ms: number) => void;
  setPlaying: (playing: boolean) => void;
  setWaveformData: (data: number[], sampleRate: number) => void;
  setSeekTarget: (ms: number | null) => void;
  clearSeekTarget: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const createMediaSlice: StateCreator<AppStore, [], [], MediaSlice> = (
  set
) => ({
  videoPath: null,
  audioPath: null,
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  waveformData: [],
  waveformSampleRate: 100,
  seekTarget: null,
  playbackSpeed: 1.0,

  setVideoPath: (path) => set({ videoPath: path }),
  setAudioPath: (path) => set({ audioPath: path }),
  setDuration: (ms) => set({ duration: ms }),
  setCurrentTime: (ms) => set({ currentTime: ms }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setWaveformData: (data, sampleRate) =>
    set({ waveformData: data, waveformSampleRate: sampleRate }),
  setSeekTarget: (ms) => set({ seekTarget: ms }),
  clearSeekTarget: () => set({ seekTarget: null }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
});
