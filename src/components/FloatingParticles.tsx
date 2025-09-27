import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  direction: 'up' | 'down' | 'left' | 'right';
}

export default function FloatingParticles({ count = 8 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2, // 1-3px size
        duration: 20 + Math.random() * 20, // 20-40 seconds
        delay: Math.random() * 10, // 0-10 seconds delay
        direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Particle['direction'],
      }));
    };

    setParticles(generateParticles());
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white/20 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            filter: 'blur(0.5px)',
            boxShadow: '0 0 6px hsl(var(--primary) / 0.3)',
          }}
        />
      ))}
    </div>
  );
}