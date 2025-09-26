import { useEffect, useRef } from 'react';

interface AudioManagerProps {
  backgroundMusic?: boolean;
  volume?: number;
}

let globalAudioInstance: HTMLAudioElement | null = null;

export const AudioManager = ({ backgroundMusic = true, volume = 0.15 }: AudioManagerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (backgroundMusic) {
      // Create or use existing global audio instance
      if (!globalAudioInstance) {
        globalAudioInstance = new Audio('/cosmic-ambient.mp3');
        globalAudioInstance.loop = true;
        globalAudioInstance.volume = volume;
        globalAudioInstance.preload = 'auto';
      } else {
        globalAudioInstance.volume = volume;
      }

      // Start playing on user interaction
      const startAudio = () => {
        if (globalAudioInstance && globalAudioInstance.paused) {
          globalAudioInstance.play().catch(e => console.log('Audio play failed:', e));
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