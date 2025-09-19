import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading, updateProfile } = useProfile();

  const handleLogin = async () => {
    if (loading) return;
    
    // Generate unique user IP simulation
    const userIP = localStorage.getItem("bdog-user-ip") || `ip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("bdog-user-ip", userIP);
    
    // Check if user exists
    const hasAccount = localStorage.getItem("bdog-visited") && profile;
    
    if (hasAccount) {
      // Existing user login
      toast({
        title: "Успешный вход!",
        description: "Добро пожаловать обратно в BDOG APP",
      });
    } else {
      // New user - create account
      localStorage.setItem("bdog-visited", "true");
      localStorage.setItem("bdog-reg", `user_${Date.now()}`);
      localStorage.setItem("bdog-balance", "0");
      localStorage.setItem("bdog-balance2", "0");
      localStorage.setItem("bdog-grow", "0");
      localStorage.setItem("bdog-grow1", "1");
      localStorage.setItem("bdog-bone", "1000");
      
      // Check for referral code and process it
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      
      if (referralCode) {
        localStorage.setItem("bdog-referral-code", referralCode);
      }
      
      toast({
        title: "Аккаунт создан!",
        description: "Добро пожаловать в экосистему BDOG",
      });
    }
    
    // Always redirect to menu after 1 second
    setTimeout(() => navigate("/menu"), 1000);
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
          <div>
            <Button 
              className="bg-gradient-gold text-black hover:bg-gold-light font-bold px-8 py-3 rounded-full shadow-gold animate-pulse-gold"
              onClick={() => navigate("/menu")}
            >
              Вход в аккаунт
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
