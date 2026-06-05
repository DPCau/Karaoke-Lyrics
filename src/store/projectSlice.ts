import type { StateCreator } from "zustand";
import type { AppStore } from "./store";

export interface ProjectSlice {
  filePath: string | null;
  isDirty: boolean;
  recentProjects: string[];

  setFilePath: (path: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
  addRecentProject: (path: string) => void;
}

export const createProjectSlice: StateCreator<
  AppStore,
  [],
  [],
  ProjectSlice
> = (set) => ({
  filePath: null,
  isDirty: false,
  recentProjects: [],

  setFilePath: (path) => set({ filePath: path }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  addRecentProject: (path) =>
    set((s) => {
      const filtered = s.recentProjects.filter((p) => p !== path);
      return { recentProjects: [path, ...filtered].slice(0, 15) };
    }),
});
