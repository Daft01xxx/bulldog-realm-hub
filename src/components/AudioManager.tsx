import { useEffect, useRef } from 'react';

interface AudioManagerProps {
  backgroundMusic?: boolean;
  volume?: number;
}

let globalAudioInstance: HTMLAudioElement | null = null;
let currentTrackIndex = 0;
let isBackgroundMusicEnabled = false;

// Background music tracks
const ambientTracks = [
  '/cosmic-ambient.mp3', // Используем существующий трек
  '/cosmic-music.mp3', // Используем существующий трек
  '/music/ambient-1.mp3',
  '/music/ambient-2.mp3', 
  '/music/ambient-3.mp3',
  '/music/ambient-4.mp3',
  '/music/ambient-5.mp3',
  '/music/ambient-6.mp3'
];

// Background music manager
const createBackgroundMusicManager = () => {
  let currentAudio: HTMLAudioElement | null = null;
  let isPlaying = false;

  const playNextTrack = () => {
    if (!isBackgroundMusicEnabled) {
      console.log('Background music disabled, stopping playback');
      return;
    }

    console.log('Playing next track, current index:', currentTrackIndex);

    // Stop current track
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      console.log('Stopped previous track');
    }

    // Get random track (avoid repeating the same track)
    const availableTracks = ambientTracks.filter((_, index) => index !== currentTrackIndex);
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const selectedTrack = availableTracks[randomIndex];
    
    // Update current track index
    currentTrackIndex = ambientTracks.indexOf(selectedTrack);
    console.log('Selected track:', selectedTrack, 'index:', currentTrackIndex);

    // Create new audio instance
    currentAudio = new Audio(selectedTrack);
    currentAudio.volume = 0.15; // Low volume for background
    currentAudio.loop = false;

    // When track ends, play next one
    currentAudio.addEventListener('ended', () => {
      console.log('Track ended, scheduling next track in 2 seconds');
      setTimeout(() => {
        playNextTrack();
      }, 2000); // 2 second gap between tracks
    });

    // Handle errors (if track doesn't exist, try next one)
    currentAudio.addEventListener('error', (e) => {
      console.log(`Failed to load track: ${selectedTrack}`, e);
      setTimeout(() => {
        playNextTrack();
      }, 1000);
    });

    // Add load event listener
    currentAudio.addEventListener('loadstart', () => {
      console.log('Started loading track:', selectedTrack);
    });

    currentAudio.addEventListener('canplaythrough', () => {
      console.log('Track can play through:', selectedTrack);
    });

    currentAudio.play().then(() => {
      console.log('Successfully started playing:', selectedTrack);
    }).catch(e => {
      console.log('Background music play failed:', e);
      // Try next track after a delay
      setTimeout(() => {
        playNextTrack();
      }, 1000);
    });
  };

  const startBackgroundMusic = () => {
    if (!isPlaying) {
      isPlaying = true;
      isBackgroundMusicEnabled = true;
      playNextTrack();
    }
  };

  const stopBackgroundMusic = () => {
    isPlaying = false;
    isBackgroundMusicEnabled = false;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  };

  const setVolume = (volume: number) => {
    if (currentAudio) {
      currentAudio.volume = volume;
    }
  };

  return { startBackgroundMusic, stopBackgroundMusic, setVolume };
};

let backgroundMusicManager: ReturnType<typeof createBackgroundMusicManager> | null = null;

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

export const AudioManager = ({ backgroundMusic = true, volume = 0.15 }: AudioManagerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (backgroundMusic) {
      // Create background music manager
      if (!backgroundMusicManager) {
        backgroundMusicManager = createBackgroundMusicManager();
      }

      // Start playing on user interaction
      const startAudio = () => {
        console.log('Starting background music...');
        if (backgroundMusicManager) {
          backgroundMusicManager.startBackgroundMusic();
          backgroundMusicManager.setVolume(volume);
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
        if (backgroundMusicManager) {
          backgroundMusicManager.stopBackgroundMusic();
        }
      };
    }
  }, [backgroundMusic, volume]);

  return null; // This component doesn't render anything
};

// Export background music control functions
export const startBackgroundMusic = () => {
  if (!backgroundMusicManager) {
    backgroundMusicManager = createBackgroundMusicManager();
  }
  backgroundMusicManager.startBackgroundMusic();
};

export const stopBackgroundMusic = () => {
  if (backgroundMusicManager) {
    backgroundMusicManager.stopBackgroundMusic();
  }
};

export const setBackgroundMusicVolume = (volume: number) => {
  if (backgroundMusicManager) {
    backgroundMusicManager.setVolume(volume);
  }
};