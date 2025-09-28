import { useEffect, useState, memo } from 'react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

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

const FloatingCosmicCoins = memo(function FloatingCosmicCoins({ count = 12 }: { count?: number }) {
  const { disableAllAnimations, isVeryLowEnd, isMobile } = useDevicePerformance();
  const [coins, setCoins] = useState<CosmicCoin[]>([]);

  useEffect(() => {
    // Don't render on very low-end devices or if animations are disabled
    if (disableAllAnimations || isVeryLowEnd) {
      setCoins([]);
      return;
    }

    const generateCoins = () => {
      // Drastically reduce coin count and complexity on low-end devices
      let coinCount = count;
      if (isVeryLowEnd) coinCount = Math.min(count, 3);
      else if (isMobile) coinCount = Math.min(count, 6);

      return Array.from({ length: coinCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: isVeryLowEnd ? 8 + Math.random() * 4 : 12 + Math.random() * 8, // Smaller on very low-end
        rotation: Math.random() * 360,
        rotationSpeed: isVeryLowEnd ? 0.2 + Math.random() * 0.3 : 0.5 + Math.random() * 1, // Slower on very low-end
        moveSpeed: isVeryLowEnd ? 0.01 + Math.random() * 0.015 : 0.02 + Math.random() * 0.03, // Slower on very low-end
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

    // Much slower frame rate on very low-end devices
    const frameRate = isVeryLowEnd ? 200 : isMobile ? 100 : 50; // 5fps, 10fps, 20fps
    const interval = setInterval(animateCoins, frameRate);
    return () => clearInterval(interval);
  }, [count, disableAllAnimations, isVeryLowEnd, isMobile]);

  // Don't render if animations are disabled
  if (disableAllAnimations || isVeryLowEnd) {
    return null;
  }

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
              // Remove expensive shadows and effects on very low-end devices
              boxShadow: isVeryLowEnd ? 'none' : `
                0 0 ${coin.size * 0.5}px hsl(var(--gold) / 0.3),
                inset 2px 2px ${coin.size * 0.2}px rgba(255, 255, 255, 0.3),
                inset -2px -2px ${coin.size * 0.2}px rgba(0, 0, 0, 0.2)
              `,
              background: isVeryLowEnd 
                ? 'hsl(var(--gold))' // Simple solid color on very low-end
                : `
                  radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
                  linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-light)) 50%, hsl(var(--gold)) 100%)
                `,
            }}
          >
            {/* Only show text on higher-end devices */}
            {!isVeryLowEnd && (
              <div 
                className="w-full h-full flex items-center justify-center text-black font-bold"
                style={{
                  fontSize: `${coin.size * 0.15}px`,
                  textShadow: isMobile ? 'none' : '0 0 2px rgba(0,0,0,0.5)',
                }}
              >
                B
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default FloatingCosmicCoins;