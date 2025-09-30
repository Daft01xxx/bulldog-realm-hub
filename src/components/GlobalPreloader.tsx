import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Import all images that need to be preloaded
import bdogBackground from "@/assets/bdog-background.png";
import bdogLogo from "@/assets/bdog-logo.jpeg";
import bdogMainLogo from "@/assets/bdog-main-logo.jpeg";
import bdogLogoTransparent from "@/assets/bulldog-logo-transparent.png";
import bdogSilverCoin from "@/assets/bdog-silver-coin-ref.jpeg";
import bulldogCoin from "@/assets/bulldog-coin.png";
import defaultMiner from "@/assets/default-miner.png";
import silverMiner from "@/assets/silver-miner.png";
import goldMiner from "@/assets/gold-miner.png";
import diamondMiner from "@/assets/diamond-miner.png";
import premiumMiner from "@/assets/premium-miner.png";
import plusMiner from "@/assets/plus-miner.png";

// Critical assets that must load first
const CRITICAL_ASSETS = [
  bdogMainLogo,
  bdogLogoTransparent,
  bulldogCoin
];

// Secondary assets loaded after critical ones
const SECONDARY_ASSETS = [
  bdogBackground,
  bdogLogo,
  bdogSilverCoin,
  defaultMiner,
  silverMiner,
  goldMiner,
  diamondMiner,
  premiumMiner,
  plusMiner
];

interface GlobalPreloaderProps {
  children: React.ReactNode;
}

export const GlobalPreloader: React.FC<GlobalPreloaderProps> = ({ children }) => {
  const [criticalLoaded, setCriticalLoaded] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Don't block on errors
        img.src = src;
      });
    };

    const preloadCritical = async () => {
      await Promise.all(CRITICAL_ASSETS.map(preloadImage));
      setCriticalLoaded(true);
    };

    const preloadAll = async () => {
      await Promise.all([
        ...CRITICAL_ASSETS.map(preloadImage),
        ...SECONDARY_ASSETS.map(preloadImage)
      ]);
      setAllLoaded(true);
    };

    // Start preloading
    preloadCritical();
    preloadAll();
  }, []);

  // Show minimal loader only for first critical assets
  if (!criticalLoaded) {
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
