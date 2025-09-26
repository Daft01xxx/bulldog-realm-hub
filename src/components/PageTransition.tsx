import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      
      // Start fade out
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

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
}