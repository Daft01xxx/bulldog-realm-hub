import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

const Welcome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (loading) return;
    
    // Check if user has visited before using IP simulation (localStorage for demo)
    const hasVisited = localStorage.getItem("bdog-visited");
    const userIP = localStorage.getItem("bdog-user-ip") || "demo-ip";
    
    if (hasVisited && localStorage.getItem("bdog-user-ip") === userIP && profile) {
      // Existing user
      toast({
        title: "Успешный вход!",
        description: "Добро пожаловать обратно в BDOG APP",
      });
      setTimeout(() => navigate("/menu"), 2000);
    } else {
      // New user
      localStorage.setItem("bdog-visited", "true");
      localStorage.setItem("bdog-user-ip", userIP);
      localStorage.setItem("bdog-reg", `user_${Date.now()}`);
      localStorage.setItem("bdog-balance", "0");
      localStorage.setItem("bdog-balance2", "0");
      localStorage.setItem("bdog-grow", "0");
      localStorage.setItem("bdog-grow1", "1");
      localStorage.setItem("bdog-bone", "1000");
      
      setTimeout(() => navigate("/menu"), 3000);
    }
  }, [navigate, toast, profile, loading]);

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
          <div className="animate-pulse-gold">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
              <span className="text-2xl">🐕</span>
            </div>
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
