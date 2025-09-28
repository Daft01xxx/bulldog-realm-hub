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
  const { reduceAnimations, disableAllAnimations, isMobile, isVeryLowEnd } = useDevicePerformance();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Skip particles on low-end devices or if user prefers reduced motion
    if (disableAllAnimations || isVeryLowEnd) {
      setParticles([]);
      return;
    }

    const generateParticles = () => {
      // Drastically reduce particle count on very low-end devices
      let particleCount = count;
      if (isVeryLowEnd) particleCount = Math.min(count, 2);
      else if (isMobile) particleCount = Math.min(count, 4);
      
      return Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: isVeryLowEnd ? 1 : 1 + Math.random() * 2, // Smaller particles on very low-end
        duration: isVeryLowEnd ? 60 + Math.random() * 60 : 30 + Math.random() * 30, // Much slower on very low-end
        delay: Math.random() * 10, // 0-10 seconds delay
        direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Particle['direction'],
      }));
    };

    setParticles(generateParticles());
  }, [count, reduceAnimations, disableAllAnimations, isMobile, isVeryLowEnd]);

  // Don't render anything if animations should be reduced
  if (disableAllAnimations || isVeryLowEnd) {
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