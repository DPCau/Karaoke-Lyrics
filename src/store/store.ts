import { create } from "zustand";
import { createMediaSlice, type MediaSlice } from "./mediaSlice";
import { createLyricsSlice, type LyricsSlice } from "./lyricsSlice";
import { createTimingSlice, type TimingSlice } from "./timingSlice";
import { createStyleSlice, type StyleSlice } from "./styleSlice";
import { createProjectSlice, type ProjectSlice } from "./projectSlice";
import { createUISlice, type UISlice } from "./uiSlice";

export type AppStore = MediaSlice &
  LyricsSlice &
  TimingSlice &
  StyleSlice &
  ProjectSlice &
  UISlice;

export const useStore = create<AppStore>()((...args) => ({
  ...createMediaSlice(...args),
  ...createLyricsSlice(...args),
  ...createTimingSlice(...args),
  ...createStyleSlice(...args),
  ...createProjectSlice(...args),
  ...createUISlice(...args),
}));
