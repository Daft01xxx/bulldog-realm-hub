import { useEffect, useState, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

interface LazyPageTransitionProps {
  children: React.ReactNode;
}

const LazyPageTransition = memo(function LazyPageTransition({ children }: LazyPageTransitionProps) {
  const location = useLocation();
  const { reduceAnimations } = useDevicePerformance();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      
      // Faster transition on low-end devices
      const transitionTime = reduceAnimations ? 100 : 200;
      
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, transitionTime);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation, reduceAnimations]);

  // Skip animations entirely on low-end devices
  if (reduceAnimations) {
    return <>{children}</>;
  }

  return (
    <div 
      className={`transition-all duration-300 ${
        isTransitioning 
          ? 'opacity-0 scale-105 blur-sm' 
          : 'opacity-100 scale-100 blur-none animate-page-transition-in'
      }`}
    >
      {children}
    </div>
  );
});

export default LazyPageTransition;