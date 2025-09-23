import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";
import bulldogGoldCoin from "@/assets/bulldog-gold-coin-clean.jpeg";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Загрузка...");

  const loadingTexts = [
    "Подготовка королевства...",
    "Загрузка BDOG монет...",
    "Настройка боевых навыков...",
    "Активация магических карт...",
    "Почти готово..."
  ];

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const intervalTime = 50; // Update every 50ms
    const totalSteps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / totalSteps) * 100, 100);
      setProgress(newProgress);
      
      // Change loading text based on progress
      if (newProgress < 20) {
        setLoadingText(loadingTexts[0]);
      } else if (newProgress < 40) {
        setLoadingText(loadingTexts[1]);
      } else if (newProgress < 60) {
        setLoadingText(loadingTexts[2]);
      } else if (newProgress < 80) {
        setLoadingText(loadingTexts[3]);
      } else {
        setLoadingText(loadingTexts[4]);
      }

      if (newProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          onLoadingComplete();
        }, 500);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Main Logo - Golden Bulldog Coin */}
      <div className="relative mb-8 animate-pulse">
        <div className="w-48 h-48 flex items-center justify-center">
          <img 
            src={bulldogGoldCoin} 
            alt="BDOG" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Loading Text */}
      <p className="text-gold text-lg mb-8 animate-pulse text-center px-4">
        {loadingText}
      </p>

      {/* Progress Bar Container */}
      <div className="w-80 max-w-[90vw] mb-4">
        <div className="bg-gray-800 rounded-full p-1 shadow-inner">
          <Progress 
            value={progress} 
            className="h-6"
          />
        </div>
      </div>

      {/* Progress Text */}
      <p className="text-gold text-sm font-semibold">
        {Math.round(progress)}%
      </p>
    </div>
  );
};

export default LoadingScreen;