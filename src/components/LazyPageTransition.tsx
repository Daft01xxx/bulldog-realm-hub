import { useEffect, useState, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

interface LazyPageTransitionProps {
  children: React.ReactNode;
}

const LazyPageTransition = memo(function LazyPageTransition({ children }: LazyPageTransitionProps) {
  const location = useLocation();
  const { reduceAnimations, disableAllAnimations, isVeryLowEnd } = useDevicePerformance();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      
      // Much faster transitions on very low-end devices, no transition on extreme cases
      let transitionTime = 200;
      if (disableAllAnimations || isVeryLowEnd) transitionTime = 50;
      else if (reduceAnimations) transitionTime = 100;
      
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, transitionTime);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation, reduceAnimations, disableAllAnimations, isVeryLowEnd]);

  // Skip animations entirely on very low-end devices
  if (disableAllAnimations || isVeryLowEnd) {
    return <>{children}</>;
  }

  return (
    <div 
      className={`transition-all ${
        reduceAnimations ? 'duration-100' : 'duration-300'
      } ${
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