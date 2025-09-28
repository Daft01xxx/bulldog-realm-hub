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
  const { reduceAnimations, isMobile } = useDevicePerformance();
  const [coins, setCoins] = useState<CoinProps[]>([]);

  useEffect(() => {
    // Skip coins on devices with reduced animations preference
    if (reduceAnimations) {
      setCoins([]);
      return;
    }

    const generateCoins = () => {
      // Reduce coin count on mobile for better performance
      const coinCount = isMobile ? Math.min(count, 4) : count;
      
      return Array.from({ length: coinCount }, (_, i) => ({
        id: i,
        delay: Math.random() * 8, // Random delay up to 8 seconds
        duration: 10 + Math.random() * 8, // Slower on mobile for smoother animation
        leftPosition: Math.random() * 100, // Random horizontal position
        size: 30 + Math.random() * 20, // 30-50px size
      }));
    };

    setCoins(generateCoins());
  }, [count, reduceAnimations, isMobile]);

  // Don't render if animations should be reduced
  if (reduceAnimations) {
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