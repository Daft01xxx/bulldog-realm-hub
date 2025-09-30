import { useEffect, useRef } from 'react';
import { BackgroundMusic } from './BackgroundMusic';

interface AudioManagerProps {
  backgroundMusic?: boolean;
  volume?: number;
}

// Audio pool for better performance
const audioPool = new Map<string, HTMLAudioElement[]>();

const getAudioFromPool = (src: string, volume: number = 0.3): HTMLAudioElement | null => {
  if (!audioPool.has(src)) {
    audioPool.set(src, []);
  }
  
  const pool = audioPool.get(src)!;
  const available = pool.find(audio => audio.paused);
  
  if (available) {
    available.volume = volume;
    available.currentTime = 0;
    return available;
  }
  
  if (pool.length < 5) {
    const audio = new Audio(src);
    audio.volume = volume;
    pool.push(audio);
    return audio;
  }
  
  return null;
};

export const AudioManager = ({ backgroundMusic = false, volume = 0.1 }: AudioManagerProps) => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Preload audio files
    ['/bulldog-click.mp3', '/button-click.mp3'].forEach(src => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      if (!audioPool.has(src)) {
        audioPool.set(src, [audio]);
      }
    });

    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        playButtonClickSound();
      }
    };

    document.addEventListener('click', handleButtonClick, { passive: true });

    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, []);

  return backgroundMusic ? <BackgroundMusic enabled={true} volume={volume} /> : null;
};

// Sound effect functions with pooling
export const playTapSound = () => {
  try {
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
  } catch (e) {
    console.log('Audio context not available');
  }
};

export const playLogoClickSound = () => {
  const audio = getAudioFromPool('/bulldog-click.mp3', 0.3);
  audio?.play().catch(() => {});
};

export const playButtonClickSound = () => {
  const audio = getAudioFromPool('/button-click.mp3', 0.2);
  audio?.play().catch(() => {});
};

export { startBackgroundMusic, stopBackgroundMusic, setBackgroundMusicVolume } from './BackgroundMusic';
