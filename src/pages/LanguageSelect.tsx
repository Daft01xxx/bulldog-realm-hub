import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { setLanguage, t } = useLanguage();

  const handleLanguageSelect = (lang: 'ru' | 'en') => {
    setLanguage(lang);
    navigate("/bdog-id");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-dark"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
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
      <div className="relative z-10 text-center px-4 w-full max-w-md">
        <div className="animate-bounce-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient animate-glow-text mb-12">
            BDOG APP
          </h1>
          
          <div className="space-y-4">
            <Button 
              className="w-full bg-gradient-gold text-black hover:bg-gold-light font-bold py-6 rounded-full shadow-gold text-lg"
              onClick={() => handleLanguageSelect('ru')}
            >
              {t('continue.russian')}
            </Button>
            
            <Button 
              className="w-full bg-gradient-gold text-black hover:bg-gold-light font-bold py-6 rounded-full shadow-gold text-lg"
              onClick={() => handleLanguageSelect('en')}
            >
              {t('continue.english')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelect;
