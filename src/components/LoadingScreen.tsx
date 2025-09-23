import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Crown, Sword } from "lucide-react";
import bulldogCoin from "@/assets/bulldog-coin.png";
import bdogLogo from "@/assets/bdog-logo.jpeg";

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
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-blue-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }, (_, i) => (
          <Sparkles
            key={i}
            className="absolute text-yellow-300 opacity-60 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3000}ms`,
              animationDuration: `${2000 + Math.random() * 2000}ms`,
              fontSize: `${12 + Math.random() * 8}px`,
            }}
          />
        ))}
      </div>

      {/* Floating Coins */}
      {Array.from({ length: 8 }, (_, i) => (
        <img
          key={i}
          src={bulldogCoin}
          alt="Coin"
          className="absolute w-8 h-8 opacity-40 animate-bounce"
          style={{
            left: `${10 + (i * 10)}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + Math.random()}s`,
          }}
        />
      ))}

      {/* Main Logo */}
      <div className="relative mb-8 animate-bounce">
        <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-300">
          <img 
            src={bdogLogo} 
            alt="BDOG" 
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>
        
        {/* Crown on top */}
        <Crown className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 w-12 h-12 animate-pulse" />
        
        {/* Swords */}
        <Sword className="absolute top-8 -left-8 text-gray-300 w-8 h-8 rotate-45 animate-pulse" />
        <Sword className="absolute top-8 -right-8 text-gray-300 w-8 h-8 -rotate-45 animate-pulse" />
      </div>

      {/* Game Title */}
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center animate-pulse">
        <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
          BDOG
        </span>
        <br />
        <span className="text-2xl md:text-3xl text-blue-200">
          KINGDOM
        </span>
      </h1>

      {/* Loading Text */}
      <p className="text-white text-lg mb-8 animate-pulse text-center px-4">
        {loadingText}
      </p>

      {/* Progress Bar Container */}
      <div className="w-80 max-w-[90vw] mb-4">
        <div className="bg-blue-800 rounded-full p-1 shadow-inner">
          <Progress 
            value={progress} 
            className="h-6 bg-gradient-to-r from-blue-600 to-blue-700"
          />
        </div>
      </div>

      {/* Progress Text */}
      <p className="text-yellow-300 text-sm font-semibold">
        {Math.round(progress)}%
      </p>

      {/* Bottom Decorative Elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-10 w-16 h-16 bg-purple-500 rounded-full opacity-30 animate-pulse blur-xl"></div>
      <div className="absolute bottom-1/4 right-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-pulse blur-xl"></div>
    </div>
  );
};

export default LoadingScreen;