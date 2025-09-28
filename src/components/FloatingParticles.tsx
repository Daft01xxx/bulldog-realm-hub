import { useEffect, useState, memo } from 'react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  direction: 'up' | 'down' | 'left' | 'right';
}

const FloatingParticles = memo(function FloatingParticles({ count = 8 }: { count?: number }) {
  const { reduceAnimations, isMobile } = useDevicePerformance();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Skip particles on low-end devices or if user prefers reduced motion
    if (reduceAnimations) {
      setParticles([]);
      return;
    }

    const generateParticles = () => {
      // Reduce particle count on mobile
      const particleCount = isMobile ? Math.min(count, 4) : count;
      
      return Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2, // 1-3px size
        duration: 30 + Math.random() * 30, // Slower on mobile for better performance
        delay: Math.random() * 10, // 0-10 seconds delay
        direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Particle['direction'],
      }));
    };

    setParticles(generateParticles());
  }, [count, reduceAnimations, isMobile]);

  // Don't render anything if animations should be reduced
  if (reduceAnimations) {
    return null;
  }

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
            filter: isMobile ? 'none' : 'blur(0.5px)', // Remove blur on mobile
            boxShadow: isMobile ? 'none' : '0 0 6px hsl(var(--primary) / 0.3)', // Remove shadows on mobile
          }}
        />
      ))}
    </div>
  );
});

export default FloatingParticles;