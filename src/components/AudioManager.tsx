import { useEffect, useRef, useState } from 'react';

interface AudioManagerProps {
  backgroundMusic?: boolean;
  volume?: number;
}

export const AudioManager = ({ backgroundMusic = true, volume = 0.1 }: AudioManagerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (backgroundMusic && audioRef.current) {
      // Create a subtle ambient background music using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillators for ambient sound
      const createAmbientSound = () => {
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(80, audioContext.currentTime);
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(82, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator1.start();
        oscillator2.start();
        
        // Create gentle fade in/out
        const duration = 8000; // 8 seconds
        setTimeout(() => {
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
          setTimeout(() => {
            oscillator1.stop();
            oscillator2.stop();
            if (backgroundMusic) createAmbientSound(); // Loop
          }, 2000);
        }, duration);
      };

      // Start ambient sound with user interaction
      const startAudio = () => {
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        createAmbientSound();
        setIsPlaying(true);
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
      };

      document.addEventListener('click', startAudio);
      document.addEventListener('touchstart', startAudio);

      return () => {
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
        if (audioContext.state !== 'closed') {
          audioContext.close();
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
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
  
  gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
};