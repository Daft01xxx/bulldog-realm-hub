import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { playButtonSound } from "@/utils/sounds";
import bulldogCoinLarge from "@/assets/bulldog-coin-large.jpeg";

const Welcome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for referral code in URL and store it
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode) {
      localStorage.setItem("bdog-referral-code", referralCode);
      toast({
        title: "Реферальный код получен!",
        description: `Код: ${referralCode}`,
      });
    }
  }, [toast]);

  const handleLogin = async () => {
    try {
      playButtonSound();
      // Always redirect to menu
      navigate("/menu");
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при входе",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-dark"></div>
      
      {/* Floating particles effect - fixed positions to prevent layout shift */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const positions = [
            { left: '10%', top: '20%' }, { left: '80%', top: '15%' }, { left: '15%', top: '80%' },
            { left: '90%', top: '70%' }, { left: '5%', top: '50%' }, { left: '75%', top: '85%' },
            { left: '50%', top: '10%' }, { left: '25%', top: '90%' }, { left: '85%', top: '40%' },
            { left: '30%', top: '25%' }, { left: '70%', top: '60%' }, { left: '45%', top: '75%' },
            { left: '20%', top: '40%' }, { left: '95%', top: '25%' }, { left: '60%', top: '5%' },
            { left: '35%', top: '95%' }, { left: '55%', top: '30%' }, { left: '65%', top: '45%' },
            { left: '40%', top: '65%' }, { left: '12%', top: '35%' }
          ];
          return (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gold rounded-full animate-float opacity-30"
              style={{
                left: positions[i]?.left || '50%',
                top: positions[i]?.top || '50%',
                animationDelay: `${i * 0.15}s`,
                animationDuration: '4s',
              }}
            />
          );
        })}
      </div>

      {/* Background coin */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 z-5">
        <img 
          src={bulldogCoinLarge} 
          alt="BDOG Coin" 
          className="w-96 h-96 object-contain animate-slow-spin"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        <div className="animate-bounce-in min-h-[300px] flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient animate-glow-text animate-pulse mb-6">
            BDOG APP
          </h1>
          <div className="mb-4 h-[36px] flex items-center justify-center">
            <Button 
              className="bg-gradient-gold text-black hover:bg-gold-light font-bold px-6 py-2 rounded-full shadow-gold animate-pulse-gold min-w-[140px] text-sm"
              onClick={handleLogin}
            >
              Вход в аккаунт
            </Button>
          </div>
          <p className="text-lg md:text-xl text-white animate-fade-in-up animate-pulse opacity-90">
            Добро пожаловать в экосистему Bulldog
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;