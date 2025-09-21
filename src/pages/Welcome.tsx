import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading, updateProfile } = useProfile();

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

  // Check for BAN status when profile loads
  useEffect(() => {
    if (profile && profile.ban === 1) {
      // User is banned, redirect to ban page
      navigate('/ban');
    }
  }, [profile, navigate]);

  const handleLogin = async () => {
    if (loading) return;
    
    try {
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
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gold rounded-full animate-float opacity-30`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6">
        <div className="animate-bounce-in">
          <h1 className="text-6xl md:text-8xl font-bold text-gradient animate-glow-text mb-8">
            BDOG APP
          </h1>
          <div className="mb-6">
            <Button 
              className="bg-gradient-gold text-black hover:bg-gold-light font-bold px-8 py-3 rounded-full shadow-gold animate-pulse-gold"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Загрузка..." : "Вход в аккаунт"}
            </Button>
          </div>
          <p className="text-xl md:text-2xl text-white-glow animate-fade-in-up opacity-80">
            Добро пожаловать в экосистему Bulldog
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;