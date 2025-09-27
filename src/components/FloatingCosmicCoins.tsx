import { useEffect, useState } from 'react';

interface CosmicCoin {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  moveSpeed: number;
  direction: number;
}

export default function FloatingCosmicCoins({ count = 12 }: { count?: number }) {
  const [coins, setCoins] = useState<CosmicCoin[]>([]);

  useEffect(() => {
    const generateCoins = () => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 12 + Math.random() * 8, // 12-20px size
        rotation: Math.random() * 360,
        rotationSpeed: 0.5 + Math.random() * 1, // 0.5-1.5 deg/frame
        moveSpeed: 0.02 + Math.random() * 0.03, // 0.02-0.05 % per frame
        direction: Math.random() * Math.PI * 2, // Random direction
      }));
    };

    setCoins(generateCoins());

    const animateCoins = () => {
      setCoins(prevCoins => 
        prevCoins.map(coin => ({
          ...coin,
          x: (coin.x + Math.cos(coin.direction) * coin.moveSpeed + 100) % 100,
          y: (coin.y + Math.sin(coin.direction) * coin.moveSpeed + 100) % 100,
          rotation: (coin.rotation + coin.rotationSpeed) % 360,
        }))
      );
    };

    const interval = setInterval(animateCoins, 50); // 20 FPS
    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            width: `${coin.size}px`,
            height: `${coin.size}px`,
            transform: `rotate(${coin.rotation}deg)`,
            opacity: 0.15,
          }}
        >
          <div
            className="w-full h-full rounded-full bg-gradient-to-br from-gold via-yellow-400 to-gold-light"
            style={{
              boxShadow: `
                0 0 ${coin.size * 0.5}px hsl(var(--gold) / 0.3),
                inset 2px 2px ${coin.size * 0.2}px rgba(255, 255, 255, 0.3),
                inset -2px -2px ${coin.size * 0.2}px rgba(0, 0, 0, 0.2)
              `,
              background: `
                radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
                linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-light)) 50%, hsl(var(--gold)) 100%)
              `,
            }}
          >
            {/* Inner BDOG text */}
            <div 
              className="w-full h-full flex items-center justify-center text-black font-bold"
              style={{
                fontSize: `${coin.size * 0.15}px`,
                textShadow: '0 0 2px rgba(0,0,0,0.5)',
              }}
            >
              B
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}