import { useEffect, useState, memo } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = memo(({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div 
      className={`transition-opacity duration-200 ${
        isTransitioning 
          ? 'opacity-0' 
          : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
});

PageTransition.displayName = 'PageTransition';

export default PageTransition;