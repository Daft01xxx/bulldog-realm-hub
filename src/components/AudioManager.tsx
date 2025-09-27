import { useEffect, useRef } from 'react';

interface AudioManagerProps {
  backgroundMusic?: boolean;
  volume?: number;
}

let globalAudioInstance: HTMLAudioElement | null = null;

// Simple classical music generator using Web Audio API
const createClassicalMusic = () => {
  let audioContext: AudioContext | null = null;
  let masterGainNode: GainNode | null = null;
  let isPlaying = false;

  const playClassicalSequence = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainNode = audioContext.createGain();
      masterGainNode.connect(audioContext.destination);
      masterGainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    }

    if (isPlaying) return;
    isPlaying = true;

    // Classical chord progression (C-Am-F-G)
    const chords = [
      [261.63, 329.63, 392.0], // C major
      [220.0, 261.63, 329.63], // A minor  
      [174.61, 220.0, 261.63], // F major
      [196.0, 246.94, 293.66]  // G major
    ];

    let chordIndex = 0;
    const playChord = () => {
      if (!audioContext || !masterGainNode) return;

      const chord = chords[chordIndex % chords.length];
      const chordGain = audioContext.createGain();
      chordGain.connect(masterGainNode);
      chordGain.gain.setValueAtTime(0, audioContext.currentTime);
      chordGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      chordGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);

      chord.forEach(frequency => {
        const oscillator = audioContext!.createOscillator();
        oscillator.connect(chordGain);
        oscillator.frequency.setValueAtTime(frequency, audioContext!.currentTime);
        oscillator.type = 'sine';
        oscillator.start(audioContext!.currentTime);
        oscillator.stop(audioContext!.currentTime + 3);
      });

      chordIndex++;
      if (isPlaying) {
        setTimeout(playChord, 3000);
      }
    };

    playChord();
  };

  const stopClassicalMusic = () => {
    isPlaying = false;
    if (audioContext) {
      audioContext.close();
      audioContext = null;
      masterGainNode = null;
    }
  };

  return { playClassicalSequence, stopClassicalMusic };
};

let classicalMusicInstance: ReturnType<typeof createClassicalMusic> | null = null;

export const AudioManager = ({ backgroundMusic = true, volume = 0.15 }: AudioManagerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (backgroundMusic) {
      // Create classical music instance
      if (!classicalMusicInstance) {
        classicalMusicInstance = createClassicalMusic();
      }

      // Start playing on user interaction
      const startAudio = () => {
        console.log('Starting classical music...');
        if (classicalMusicInstance) {
          classicalMusicInstance.playClassicalSequence();
        }
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
        document.removeEventListener('keydown', startAudio);
      };

      // Add multiple event listeners for different types of user interaction
      document.addEventListener('click', startAudio);
      document.addEventListener('touchstart', startAudio);
      document.addEventListener('keydown', startAudio);

      return () => {
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
        document.removeEventListener('keydown', startAudio);
        if (classicalMusicInstance) {
          classicalMusicInstance.stopClassicalMusic();
          classicalMusicInstance = null;
        }
      };
    }
  }, [backgroundMusic, volume]);

  return null; // This component doesn't render anything
};

// Sound effect functions
export const playTapSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

export const playLogoClickSound = () => {
  const audio = new Audio('/bulldog-click.mp3');
  audio.volume = 0.3;
  audio.play().catch(e => console.log('Audio play failed:', e));
};

export const playButtonClickSound = () => {
  const audio = new Audio('/button-click.mp3');
  audio.volume = 0.2;
  audio.play().catch(e => console.log('Audio play failed:', e));
};

// Add global button click listener
if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      playButtonClickSound();
    }
  });
}