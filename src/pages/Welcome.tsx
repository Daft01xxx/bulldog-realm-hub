import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
        description: `Код: ${referralCode}`
      });
    }
    
    // Check if user has "remember me" enabled
    const timer = setTimeout(() => {
      const rememberMe = localStorage.getItem('bdog-remember-me');
      
      if (rememberMe === 'true') {
        navigate('/menu');
      } else {
        navigate('/language-select');
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [toast, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, hsl(240 10% 5%), hsl(240 10% 8%))' }}></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => {
          const positions = [
            { left: '10%', top: '20%' }, { left: '80%', top: '15%' },
            { left: '15%', top: '80%' }, { left: '90%', top: '70%' },
            { left: '5%', top: '50%' }, { left: '75%', top: '85%' },
            { left: '50%', top: '10%' }, { left: '25%', top: '90%' },
            { left: '85%', top: '40%' }, { left: '30%', top: '25%' },
            { left: '70%', top: '60%' }, { left: '45%', top: '75%' },
            { left: '20%', top: '40%' }, { left: '95%', top: '25%' },
            { left: '60%', top: '5%' }, { left: '35%', top: '95%' },
            { left: '55%', top: '30%' }, { left: '65%', top: '45%' },
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
                animationDuration: '4s'
              }}
            />
          );
        })}
      </div>

      {/* Main content */}
      <div className="relative z-20 text-center px-4">
        <div className="animate-bounce-in min-h-[300px] flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6" style={{ 
            background: 'linear-gradient(135deg, hsl(45 100% 55%), hsl(50 100% 65%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            BDOG APP
          </h1>
          <p className="text-lg opacity-80" style={{ color: 'hsl(0 0% 98%)' }}>
            Добро пожаловать в экосистему Bulldog
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
