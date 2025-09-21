// Audio Manager for retro gaming sounds and BGM
export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private bgmGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private currentBgm: AudioBufferSourceNode | null = null;
  private isBgmMuted = false;
  private isSfxMuted = false;
  private bgmVolume = 0.3;
  private sfxVolume = 0.5;

  private constructor() {
    this.initializeAudio();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create gain nodes for volume control
      this.bgmGainNode = this.audioContext.createGain();
      this.sfxGainNode = this.audioContext.createGain();

      this.bgmGainNode.connect(this.audioContext.destination);
      this.sfxGainNode.connect(this.audioContext.destination);

      this.bgmGainNode.gain.value = this.bgmVolume;
      this.sfxGainNode.gain.value = this.sfxVolume;
    } catch (error) {
      console.warn("Audio initialization failed:", error);
    }
  }

  // Generate chiptune-style tones
  private createTone(
    frequency: number,
    duration: number,
    waveType: OscillatorType = "square"
  ): AudioBufferSourceNode | null {
    if (!this.audioContext) return null;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = waveType;
      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );

      // Create retro-style envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.3,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.1,
        this.audioContext.currentTime + duration * 0.3
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode!);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      return oscillator as any;
    } catch (error) {
      console.warn("Failed to create tone:", error);
      return null;
    }
  }

  // Sound effects for different UI actions
  public playButtonClick() {
    if (this.isSfxMuted) return;
    this.createTone(800, 0.1, "square");
  }

  public playButtonHover() {
    if (this.isSfxMuted) return;
    this.createTone(600, 0.05, "square");
  }

  public playTodoAdd() {
    if (this.isSfxMuted) return;
    // Ascending chime for adding todo
    setTimeout(() => this.createTone(523, 0.15, "square"), 0); // C5
    setTimeout(() => this.createTone(659, 0.15, "square"), 100); // E5
    setTimeout(() => this.createTone(784, 0.2, "square"), 200); // G5
  }

  public playTodoComplete() {
    if (this.isSfxMuted) return;
    // Success jingle
    setTimeout(() => this.createTone(659, 0.1, "square"), 0); // E5
    setTimeout(() => this.createTone(784, 0.1, "square"), 100); // G5
    setTimeout(() => this.createTone(1047, 0.2, "square"), 200); // C6
  }

  public playTodoDelete() {
    if (this.isSfxMuted) return;
    // Descending tone for delete
    this.createTone(400, 0.2, "sawtooth");
  }

  public playWindowOpen() {
    if (this.isSfxMuted) return;
    // Rising sweep for window open
    setTimeout(() => this.createTone(200, 0.1, "sine"), 0);
    setTimeout(() => this.createTone(300, 0.1, "sine"), 50);
    setTimeout(() => this.createTone(400, 0.15, "sine"), 100);
  }

  public playWindowClose() {
    if (this.isSfxMuted) return;
    // Falling sweep for window close
    setTimeout(() => this.createTone(400, 0.1, "sine"), 0);
    setTimeout(() => this.createTone(300, 0.1, "sine"), 50);
    setTimeout(() => this.createTone(200, 0.15, "sine"), 100);
  }

  // Background music using generated chiptune melodies
  public async playBackgroundMusic() {
    if (this.isBgmMuted || !this.audioContext || !this.bgmGainNode) return;

    this.stopBackgroundMusic();

    // Create a simple looping chiptune melody
    const playMelodyLoop = () => {
      if (!this.audioContext || this.isBgmMuted) return;

      const melody = [
        { freq: 523, duration: 0.5 }, // C5
        { freq: 659, duration: 0.5 }, // E5
        { freq: 784, duration: 0.5 }, // G5
        { freq: 659, duration: 0.5 }, // E5
        { freq: 698, duration: 0.5 }, // F5
        { freq: 784, duration: 0.5 }, // G5
        { freq: 880, duration: 0.5 }, // A5
        { freq: 784, duration: 0.5 }, // G5
      ];

      let totalTime = 0;
      melody.forEach((note) => {
        setTimeout(() => {
          if (this.audioContext && !this.isBgmMuted) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = "square";
            oscillator.frequency.setValueAtTime(
              note.freq,
              this.audioContext.currentTime
            );

            // Softer envelope for background music
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
              0.08,
              this.audioContext.currentTime + 0.05
            );
            gainNode.gain.linearRampToValueAtTime(
              0.05,
              this.audioContext.currentTime + note.duration * 0.8
            );
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              this.audioContext.currentTime + note.duration
            );

            oscillator.connect(gainNode);
            gainNode.connect(this.bgmGainNode!);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + note.duration);
          }
        }, totalTime * 1000);

        totalTime += note.duration;
      });

      // Loop the melody
      setTimeout(() => {
        if (!this.isBgmMuted) playMelodyLoop();
      }, totalTime * 1000 + 1000); // Add 1 second pause between loops
    };

    playMelodyLoop();
  }

  public stopBackgroundMusic() {
    if (this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm = null;
    }
  }

  public toggleMute() {
    // Legacy method - toggles both BGM and SFX
    const shouldMute = !this.isBgmMuted && !this.isSfxMuted;
    this.isBgmMuted = shouldMute;
    this.isSfxMuted = shouldMute;

    if (this.isBgmMuted) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    return shouldMute;
  }

  public toggleBgmMute() {
    this.isBgmMuted = !this.isBgmMuted;
    if (this.isBgmMuted) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    return this.isBgmMuted;
  }

  public toggleSfxMute() {
    this.isSfxMuted = !this.isSfxMuted;
    return this.isSfxMuted;
  }

  public setBgmVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = this.bgmVolume;
    }
  }

  public setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.sfxVolume;
    }
  }

  public isMutedState(): boolean {
    return this.isBgmMuted && this.isSfxMuted;
  }

  public isBgmMutedState(): boolean {
    return this.isBgmMuted;
  }

  public isSfxMutedState(): boolean {
    return this.isSfxMuted;
  }

  // Method to load external audio files if you want to add custom sounds later
  public async loadAudioFile(url: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn("Failed to load audio file:", url, error);
      return null;
    }
  }

  public async playAudioBuffer(buffer: AudioBuffer, volume: number = 1) {
    if (!this.audioContext || !buffer || this.isSfxMuted) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.sfxGainNode!);

    source.start();
  }

  // Easy method to load and play custom background music
  public async loadAndPlayCustomBgm(audioFile: File | string) {
    if (this.isBgmMuted) return;

    this.stopBackgroundMusic();

    try {
      let audioBuffer: AudioBuffer | null = null;

      if (typeof audioFile === "string") {
        // Load from URL
        audioBuffer = await this.loadAudioFile(audioFile);
      } else {
        // Load from File object
        if (!this.audioContext) return;
        const arrayBuffer = await audioFile.arrayBuffer();
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      }

      if (audioBuffer && this.audioContext && this.bgmGainNode) {
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true; // Loop the background music
        source.connect(this.bgmGainNode);
        source.start(0);
        this.currentBgm = source;
      }
    } catch (error) {
      console.warn("Failed to load custom BGM:", error);
    }
  }
}

export const audioManager = AudioManager.getInstance();
