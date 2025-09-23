// Play audio file helper
const playAudioFile = (src: string, volume: number = 0.3) => {
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(error => console.log('Audio play failed:', error));
  } catch (error) {
    console.log('Sound not supported');
  }
};

// Button click sound using uploaded file
export const playButtonSound = () => {
  playAudioFile('/sounds/cartoon-button-click.mp3', 0.4);
};

// Click sound (same as button sound for consistency)
export const playClickSound = () => {
  playButtonSound();
};

// Booster purchase sound
export const playBoosterBuySound = () => {
  playAudioFile('/sounds/booster-buy.mp3', 0.5);
};

// Ban sound
export const playBanSound = () => {
  playAudioFile('/sounds/ban-sound.mp3', 0.6);
};

// Coins falling sound for bulldog click
export const playCoinsSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create multiple coin sounds with slight delays
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Random frequency for variation
        const freq = 800 + Math.random() * 400;
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }, i * 50);
    }
  } catch (error) {
    console.log('Sound not supported');
  }
};