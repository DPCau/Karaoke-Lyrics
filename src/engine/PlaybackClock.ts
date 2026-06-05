/**
 * PlaybackClock — Dual-anchor clock for synchronizing lyrics with audio/video playback.
 *
 * Uses the AudioContext's high-resolution timeline as the reference clock.
 * The effective playback position is computed via:
 *   effectiveTime = baseVideoTime + (audioCtx.currentTime * 1000 - baseAudioTime) * playbackRate
 *
 * When paused, the time is frozen. Seek, play, pause, and rate changes
 * re-anchor the clock to maintain accuracy without drift.
 */
export class PlaybackClock {
  private audioCtx: AudioContext;
  private baseVideoTime: number; // ms — the anchor video position
  private baseAudioTime: number; // AudioContext seconds — the anchor audio time
  private _playbackRate: number;
  private _pausedTime: number;   // ms — frozen time while paused
  private _isPaused: boolean;

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
    this.baseVideoTime = 0;
    this.baseAudioTime = audioCtx.currentTime;
    this._playbackRate = 1.0;
    this._pausedTime = 0;
    this._isPaused = false;
  }

  /**
   * Get the current effective playback position in milliseconds.
   */
  getCurrentTimeMs(): number {
    if (this._isPaused) {
      return this._pausedTime;
    }
    const elapsed = (this.audioCtx.currentTime - this.baseAudioTime) * 1000;
    return this.baseVideoTime + elapsed * this._playbackRate;
  }

  /**
   * Get current playback rate.
   */
  get playbackRate(): number {
    return this._playbackRate;
  }

  /**
   * Seek to an absolute video position (ms).
   * Re-anchors the clock at the new position without changing playback rate.
   */
  seekTo(videoTimeMs: number): void {
    const now = this.audioCtx.currentTime;
    this.baseAudioTime = now;
    this.baseVideoTime = videoTimeMs;
    if (this._isPaused) {
      this._pausedTime = videoTimeMs;
    }
  }

  /**
   * Start or resume playback. Re-anchors the clock so time begins counting
   * from the current position.
   */
  play(): void {
    const now = this.audioCtx.currentTime;
    if (this._isPaused) {
      // Resume from paused position
      this.baseAudioTime = now;
      this.baseVideoTime = this._pausedTime;
      this._isPaused = false;
    } else {
      // Re-anchor without changing position
      this.baseAudioTime = now;
      this.baseVideoTime = this.getCurrentTimeMs();
    }
  }

  /**
   * Pause playback. Freezes the effective time at the current position.
   */
  pause(): void {
    if (!this._isPaused) {
      this._pausedTime = this.getCurrentTimeMs();
      this._isPaused = true;
    }
  }

  /**
   * Set playback rate. Re-anchors to prevent discontinuities.
   */
  setPlaybackRate(rate: number): void {
    const effectiveTime = this.getCurrentTimeMs();
    const now = this.audioCtx.currentTime;
    this.baseVideoTime = effectiveTime;
    this.baseAudioTime = now;
    this._playbackRate = rate;
    if (this._isPaused) {
      this._pausedTime = effectiveTime;
    }
  }

  /**
   * Reset the clock to zero and resume counting from the anchor.
   */
  reset(): void {
    const now = this.audioCtx.currentTime;
    this.baseVideoTime = 0;
    this.baseAudioTime = now;
    this._playbackRate = 1.0;
    this._pausedTime = 0;
    this._isPaused = false;
  }
}
