import { useEffect, useState } from 'react';
import bulldogCoinImage from '@/assets/bulldog-coin.png';

interface CoinProps {
  id: number;
  delay: number;
  duration: number;
  leftPosition: number;
  size: number;
}

function FallingCoin({ id, delay, duration, leftPosition, size }: CoinProps) {
  return (
    <div
      className="fixed pointer-events-none z-10 opacity-70"
      style={{
        left: `${leftPosition}%`,
        top: '-60px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <img
        src={bulldogCoinImage}
        alt=""
        className="animate-fall-coin animate-slow-spin"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          filter: 'drop-shadow(0 0 8px hsl(var(--gold) / 0.3))',
        }}
      />
    </div>
  );
}

interface FallingCoins2DProps {
  count?: number;
}

export default function FallingCoins2D({ count = 12 }: FallingCoins2DProps) {
  const [coins, setCoins] = useState<CoinProps[]>([]);

  useEffect(() => {
    const generateCoins = () => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        delay: Math.random() * 8, // Random delay up to 8 seconds
        duration: 8 + Math.random() * 6, // 8-14 seconds fall time
        leftPosition: Math.random() * 100, // Random horizontal position
        size: 30 + Math.random() * 20, // 30-50px size
      }));
    };

    setCoins(generateCoins());
  }, [count]);

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
}