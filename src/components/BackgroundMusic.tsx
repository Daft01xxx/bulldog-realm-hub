import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const location = useLocation();

  const tracks = [
    "/sounds/background-music-1.mp3",
    "/sounds/background-music-2.mp3", 
    "/sounds/background-music-3.mp3"
  ];

  const fadeOut = (audio: HTMLAudioElement, duration: number = 1000) => {
    return new Promise<void>((resolve) => {
      const startVolume = audio.volume;
      const fadeStep = startVolume / (duration / 50);
      
      const fade = () => {
        if (audio.volume > fadeStep) {
          audio.volume -= fadeStep;
          setTimeout(fade, 50);
        } else {
          audio.volume = 0;
          resolve();
        }
      };
      fade();
    });
  };

  const fadeIn = (audio: HTMLAudioElement, targetVolume: number = 0.3, duration: number = 1000) => {
    return new Promise<void>((resolve) => {
      audio.volume = 0;
      const fadeStep = targetVolume / (duration / 50);
      
      const fade = () => {
        if (audio.volume < targetVolume - fadeStep) {
          audio.volume += fadeStep;
          setTimeout(fade, 50);
        } else {
          audio.volume = targetVolume;
          resolve();
        }
      };
      fade();
    });
  };

  const switchTrack = async () => {
    if (audioRef.current && isPlaying) {
      await fadeOut(audioRef.current, 800);
      audioRef.current.pause();
      
      setCurrentTrack((prev) => (prev + 1) % tracks.length);
    }
  };

  const startMusic = async () => {
    if (audioRef.current && !isPlaying) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        await fadeIn(audioRef.current, 0.3, 800);
        setIsPlaying(true);
      } catch (error) {
        console.log('Could not play audio:', error);
      }
    }
  };

  const stopMusic = async () => {
    if (audioRef.current && isPlaying) {
      await fadeOut(audioRef.current, 500);
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    // Stop music on ban page
    if (location.pathname === '/ban') {
      stopMusic();
      return;
    }

    // Start music on other pages
    if (!isPlaying) {
      startMusic();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.src = tracks[currentTrack];
      audioRef.current.load();
      startMusic();
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    
    if (audio) {
      const handleEnded = () => {
        switchTrack();
      };

      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      loop={false}
    />
  );
};

export default BackgroundMusic;