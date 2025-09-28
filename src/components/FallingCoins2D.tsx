import { useEffect, useState, memo } from 'react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';
import bulldogCoinImage from '@/assets/bulldog-coin.png';

interface CoinProps {
  id: number;
  delay: number;
  duration: number;
  leftPosition: number;
  size: number;
}

const FallingCoin = memo(function FallingCoin({ id, delay, duration, leftPosition, size }: CoinProps) {
  const { isMobile } = useDevicePerformance();
  
  return (
    <div
      className="fixed pointer-events-none z-10 opacity-70"
      style={{
        left: `${leftPosition}%`,
        top: '-80px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        willChange: 'transform',
      }}
    >
      <img
        src={bulldogCoinImage}
        alt=""
        className="animate-fall-coin animate-slow-spin"
        style={{
          width: `${Math.max(size * 0.8, 24)}px`, // Minimum size on mobile
          height: `${Math.max(size * 0.8, 24)}px`,
          filter: isMobile ? 'none' : 'drop-shadow(0 0 8px hsl(var(--gold) / 0.3))', // Remove filter on mobile
        }}
      />
    </div>
  );
});

interface FallingCoins2DProps {
  count?: number;
}

const FallingCoins2D = memo(function FallingCoins2D({ count = 8 }: FallingCoins2DProps) {
  const { reduceAnimations, disableAllAnimations, isMobile, isVeryLowEnd } = useDevicePerformance();
  const [coins, setCoins] = useState<CoinProps[]>([]);

  useEffect(() => {
    // Skip coins on devices with reduced animations preference or very low-end devices
    if (disableAllAnimations || isVeryLowEnd) {
      setCoins([]);
      return;
    }

    const generateCoins = () => {
      // Drastically reduce coin count on very low-end devices
      let coinCount = count;
      if (isVeryLowEnd) coinCount = Math.min(count, 2);
      else if (isMobile) coinCount = Math.min(count, 4);
      
      return Array.from({ length: coinCount }, (_, i) => ({
        id: i,
        delay: Math.random() * 8, // Random delay up to 8 seconds
        duration: isVeryLowEnd ? 15 + Math.random() * 10 : 10 + Math.random() * 8, // Much slower on very low-end
        leftPosition: Math.random() * 100, // Random horizontal position
        size: isVeryLowEnd ? 24 : 30 + Math.random() * 20, // Smaller coins on very low-end
      }));
    };

    setCoins(generateCoins());
  }, [count, reduceAnimations, disableAllAnimations, isMobile, isVeryLowEnd]);

  // Don't render if animations should be reduced or very low-end device
  if (disableAllAnimations || isVeryLowEnd) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {coins.map((coin) => (
        <FallingCoin
          key={coin.id}
          id={coin.id}
          delay={coin.delay}
          duration={coin.duration}
          leftPosition={coin.leftPosition}
          size={coin.size}
        />
      ))}
    </div>
  );
});

export default FallingCoins2D;