import { useEffect, useRef } from 'react';

interface BackgroundMusicProps {
  enabled?: boolean;
  volume?: number;
}

// Музыкальные ноты в герцах
const NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77
};

// Спокойные прогрессии аккордов
const CHORD_PROGRESSIONS = [
  // C Major - Am - F - G
  [[NOTES.C4, NOTES.E4, NOTES.G4], [NOTES.A4, NOTES.C5, NOTES.E5], [NOTES.F4, NOTES.A4, NOTES.C5], [NOTES.G4, NOTES.B4, NOTES.D5]],
  // F Major - Dm - Bb - C
  [[NOTES.F4, NOTES.A4, NOTES.C5], [NOTES.D4, NOTES.F4, NOTES.A4], [NOTES.B4, NOTES.D5, NOTES.F5], [NOTES.C5, NOTES.E5, NOTES.G5]],
  // G Major - Em - C - D
  [[NOTES.G4, NOTES.B4, NOTES.D5], [NOTES.E4, NOTES.G4, NOTES.B4], [NOTES.C4, NOTES.E4, NOTES.G4], [NOTES.D4, NOTES.F4, NOTES.A4]]
];

// Спокойные мелодии
const MELODIES = [
  [NOTES.C5, NOTES.D5, NOTES.E5, NOTES.F5, NOTES.E5, NOTES.D5, NOTES.C5],
  [NOTES.G4, NOTES.A4, NOTES.B4, NOTES.C5, NOTES.B4, NOTES.A4, NOTES.G4],
  [NOTES.F4, NOTES.G4, NOTES.A4, NOTES.C5, NOTES.A4, NOTES.G4, NOTES.F4]
];

class AmbientMusicGenerator {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentProgression = 0;
  private currentMelody = 0;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private volume = 0.1) {}

  async init() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      
      console.log('Background music system initialized');
      return true;
    } catch (error) {
      console.log('Failed to initialize audio context:', error);
      return false;
    }
  }

  private createOscillator(frequency: number, type: OscillatorType = 'sine'): OscillatorNode {
    if (!this.audioContext || !this.masterGain) throw new Error('Audio context not initialized');
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;
    
    return oscillator;
  }

  private playChord(chord: number[], duration: number) {
    if (!this.audioContext || !this.masterGain) return;
    
    const now = this.audioContext.currentTime;
    const chordGain = this.audioContext.createGain();
    chordGain.connect(this.masterGain);
    
    // Плавное появление и исчезновение
    chordGain.gain.setValueAtTime(0, now);
    chordGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    chordGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    chord.forEach(frequency => {
      const oscillator = this.audioContext!.createOscillator();
      oscillator.connect(chordGain);
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.type = 'triangle'; // Более мягкий звук
      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  }

  private playMelodyNote(frequency: number, startTime: number, duration: number) {
    if (!this.audioContext || !this.masterGain) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = 'sine';
    
    // Плавная атака и затухание для мелодии
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playSequence() {
    if (!this.isPlaying || !this.audioContext) return;
    
    const progression = CHORD_PROGRESSIONS[this.currentProgression];
    const melody = MELODIES[this.currentMelody];
    
    // Играем аккорды
    progression.forEach((chord, index) => {
      setTimeout(() => {
        if (this.isPlaying) {
          this.playChord(chord, 4000); // 4 секунды на аккорд
        }
      }, index * 4000);
    });
    
    // Играем мелодию поверх аккордов
    melody.forEach((note, index) => {
      setTimeout(() => {
        if (this.isPlaying && this.audioContext) {
          this.playMelodyNote(note, this.audioContext.currentTime, 1.5);
        }
      }, index * 2000 + 1000); // Мелодия начинается через секунду
    });
    
    // Следующая последовательность
    this.intervalId = setTimeout(() => {
      if (this.isPlaying) {
        this.currentProgression = (this.currentProgression + 1) % CHORD_PROGRESSIONS.length;
        this.currentMelody = (this.currentMelody + 1) % MELODIES.length;
        this.playSequence();
      }
    }, 16000); // 16 секунд на полную последовательность
  }

  async start() {
    if (this.isPlaying) return;
    
    if (!this.audioContext) {
      const initialized = await this.init();
      if (!initialized) return;
    }

    if (this.audioContext!.state === 'suspended') {
      await this.audioContext!.resume();
    }

    this.isPlaying = true;
    console.log('Starting ambient background music');
    this.playSequence();
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    console.log('Stopped background music');
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }
}

let globalMusicGenerator: AmbientMusicGenerator | null = null;

export const BackgroundMusic = ({ enabled = true, volume = 0.1 }: BackgroundMusicProps) => {
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Создаём генератор музыки
    if (!globalMusicGenerator) {
      globalMusicGenerator = new AmbientMusicGenerator(volume);
    }

    const startMusic = async () => {
      if (!hasStarted.current && globalMusicGenerator) {
        hasStarted.current = true;
        console.log('User interaction detected, starting background music');
        await globalMusicGenerator.start();
      }
    };

    // Ждём первого взаимодействия пользователя
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, startMusic, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, startMusic);
      });
      if (globalMusicGenerator) {
        globalMusicGenerator.destroy();
        globalMusicGenerator = null;
      }
      hasStarted.current = false;
    };
  }, [enabled, volume]);

  return null;
};

// Экспортируемые функции управления
export const startBackgroundMusic = async () => {
  if (!globalMusicGenerator) {
    globalMusicGenerator = new AmbientMusicGenerator(0.1);
  }
  await globalMusicGenerator.start();
};

export const stopBackgroundMusic = () => {
  if (globalMusicGenerator) {
    globalMusicGenerator.stop();
  }
};

export const setBackgroundMusicVolume = (volume: number) => {
  if (globalMusicGenerator) {
    globalMusicGenerator.setVolume(volume);
  }
};

export default BackgroundMusic;