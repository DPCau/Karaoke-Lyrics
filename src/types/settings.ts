export interface AppSettings {
  version: string;
  general: {
    language: 'zh-CN' | 'zh-TW' | 'ja-JP' | 'en';
    theme: 'dark' | 'light' | 'system';
    restoreLastProject: boolean;
    autoSaveIntervalSec: number;
    maxRecentProjects: number;
  };
  timing: {
    markKey: string;
    leadInMs: number;
    snapMode: 'none' | 'waveform_peak' | 'beat';
    snapStrengthMs: number;
    preRollMs: number;
    metronomeVolume: number;
  };
  playback: {
    defaultSpeed: number;
    defaultVolume: number;
    loopMode: 'none' | 'line' | 'char' | 'selection';
  };
  export: {
    defaultFormat: 'mp4_h264' | 'lrc' | 'json' | 'ass';
    ffmpegPath: string;
    encoderPreset: string;
    openFolderAfterExport: boolean;
  };
  shortcuts: Record<string, string>;
  window: {
    width: number;
    height: number;
    maximized: boolean;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  version: '1.0.0',
  general: {
    language: 'zh-CN',
    theme: 'dark',
    restoreLastProject: false,
    autoSaveIntervalSec: 30,
    maxRecentProjects: 10,
  },
  timing: {
    markKey: 'Space',
    leadInMs: -100,
    snapMode: 'none',
    snapStrengthMs: 50,
    preRollMs: 1000,
    metronomeVolume: 0.5,
  },
  playback: {
    defaultSpeed: 1.0,
    defaultVolume: 0.8,
    loopMode: 'none',
  },
  export: {
    defaultFormat: 'lrc',
    ffmpegPath: '',
    encoderPreset: 'medium',
    openFolderAfterExport: true,
  },
  shortcuts: {},
  window: {
    width: 1280,
    height: 720,
    maximized: false,
  },
};
