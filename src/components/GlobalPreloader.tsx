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
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Don't block on errors
        img.src = src;
      });
    };

    const preloadCritical = async () => {
      try {
        await Promise.all(CRITICAL_ASSETS.map(preloadImage));
      } catch (error) {
        console.error('Preload error:', error);
      } finally {
        setLoaded(true);
      }
    };

    preloadCritical();
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto animate-spin rounded-full border-4 border-gold/20 border-t-gold"></div>
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
