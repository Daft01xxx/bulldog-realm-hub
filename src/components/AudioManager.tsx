import { useEffect, useRef } from 'react';
import { BackgroundMusic } from './BackgroundMusic';

interface AudioManagerProps {
  backgroundMusic?: boolean;
  volume?: number;
}

export const AudioManager = ({ backgroundMusic = false, volume = 0.1 }: AudioManagerProps) => {
  return backgroundMusic ? <BackgroundMusic enabled={true} volume={volume} /> : null;
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

// Re-export background music controls
export { startBackgroundMusic, stopBackgroundMusic, setBackgroundMusicVolume } from './BackgroundMusic';

// Add global button click listener
if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      playButtonClickSound();
    }
  });
}