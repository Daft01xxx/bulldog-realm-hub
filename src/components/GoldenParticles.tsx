import { useEffect, useState } from 'react';

interface ParticleProps {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

function GoldenParticle({ particle }: { particle: ParticleProps }) {
  const [position, setPosition] = useState({ x: particle.x, y: particle.y });
  
  useEffect(() => {
    const moveParticle = () => {
      setPosition(prev => {
        let newX = prev.x + particle.speedX;
        let newY = prev.y + particle.speedY;
        
        // Bounce off walls
        if (newX <= 0 || newX >= window.innerWidth - particle.size) {
          particle.speedX *= -1;
          newX = Math.max(0, Math.min(window.innerWidth - particle.size, newX));
        }
        if (newY <= 0 || newY >= window.innerHeight - particle.size) {
          particle.speedY *= -1;
          newY = Math.max(0, Math.min(window.innerHeight - particle.size, newY));
        }
        
        return { x: newX, y: newY };
      });
    };
    
    const interval = setInterval(moveParticle, 50);
    return () => clearInterval(interval);
  }, [particle.speedX, particle.speedY, particle.size]);
  
  return (
    <div
      className="fixed pointer-events-none rounded-full"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        background: `radial-gradient(circle, hsl(var(--gold) / ${particle.opacity}) 0%, hsl(var(--gold) / 0.3) 70%, transparent 100%)`,
        boxShadow: `0 0 ${particle.size * 2}px hsl(var(--gold) / 0.6)`,
        zIndex: 1,
        animation: `pulse 3s ease-in-out infinite alternate`,
      }}
    />
  );
}

interface GoldenParticlesProps {
  count?: number;
}

export default function GoldenParticles({ count = 8 }: GoldenParticlesProps) {
  const [particles, setParticles] = useState<ParticleProps[]>([]);
  
  useEffect(() => {
    const generateParticles = () => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * (window.innerWidth - 20),
        y: Math.random() * (window.innerHeight - 20),
        size: 4 + Math.random() * 8, // 4-12px size
        speedX: (Math.random() - 0.5) * 0.8, // Slow horizontal movement
        speedY: (Math.random() - 0.5) * 0.8, // Slow vertical movement
        opacity: 0.4 + Math.random() * 0.4, // 0.4-0.8 opacity
      }));
    };
    
    setParticles(generateParticles());
    
    // Regenerate particles when window resizes
    const handleResize = () => {
      setParticles(generateParticles());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count]);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <GoldenParticle key={particle.id} particle={particle} />
      ))}
    </div>
  );
}