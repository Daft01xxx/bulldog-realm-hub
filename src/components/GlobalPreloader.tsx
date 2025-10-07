import { useEffect, useState } from 'react';

// Import critical images
import bdogMainLogo from "@/assets/bdog-main-logo.jpeg";
import bdogLogoTransparent from "@/assets/bulldog-logo-transparent.png";

const CRITICAL_ASSETS = [
  bdogMainLogo,
  bdogLogoTransparent
];

interface GlobalPreloaderProps {
  children: React.ReactNode;
}

export const GlobalPreloader: React.FC<GlobalPreloaderProps> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Non-blocking preload - set timeout to prevent blocking
    const timer = setTimeout(() => setLoaded(true), 100);
    
    const preloadImage = (src: string): void => {
      const img = new Image();
      img.src = src;
    };

    // Preload in background without blocking
    CRITICAL_ASSETS.forEach(preloadImage);
    
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto animate-spin rounded-full border-4 border-gold/20 border-t-gold"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
