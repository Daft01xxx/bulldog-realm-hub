import { useEffect, useState } from "react";
import bulldogCoin from "@/assets/bulldog-coin.png";

interface Coin {
  id: number;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  size: number;
}

interface FallingCoins2DProps {
  trigger: boolean;
}

const FallingCoins2D = ({ trigger }: FallingCoins2DProps) => {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    if (!trigger) return;

    // Create 5-8 coins
    const newCoins: Coin[] = Array.from({ length: Math.floor(Math.random() * 4) + 5 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 + 10, // 10-90% from left
      y: 40, // Start from bulldog area
      rotation: Math.random() * 360,
      speed: Math.random() * 2 + 2, // 2-4 speed
      size: Math.random() * 20 + 30, // 30-50px size
    }));

    setCoins(newCoins);

    // Remove coins after animation
    const timer = setTimeout(() => {
      setCoins([]);
    }, 2000);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute transition-all duration-2000 ease-out"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            width: `${coin.size}px`,
            height: `${coin.size}px`,
            transform: `translateY(100vh) rotate(${coin.rotation + 720}deg)`,
            animationDelay: `${Math.random() * 200}ms`,
          }}
        >
          <img 
            src={bulldogCoin} 
            alt="Coin" 
            className="w-full h-full object-contain drop-shadow-lg animate-spin"
          />
        </div>
      ))}
    </div>
  );
};

export default FallingCoins2D;