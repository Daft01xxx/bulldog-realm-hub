import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogIn } from "lucide-react";

const BdogId = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canLogin = agreedToTerms && agreedToPrivacy;

  const handleLogin = async () => {
    if (!canLogin) return;
    
    setIsLoading(true);
    
    // Save remember me preference
    if (rememberMe) {
      localStorage.setItem('bdog-remember-me', 'true');
    }
    
    // Simulate loading while data preloads
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    navigate("/menu");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-dark"></div>
      
      {/* Main content */}
      <div className="relative z-10 text-center px-4 w-full max-w-md">
        <div className="animate-bounce-in space-y-8">
          {/* Login Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
              <LogIn className="w-12 h-12 text-black" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold text-gradient animate-glow-text mb-8">
            {t('bdog.id')}
          </h1>
          
          {/* Checkboxes */}
          <div className="space-y-6 text-left">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1 border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <label 
                htmlFor="terms" 
                className="text-white-glow text-sm leading-relaxed cursor-pointer"
              >
                {t('agree.terms')}
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="privacy" 
                checked={agreedToPrivacy}
                onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                className="mt-1 border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <label 
                htmlFor="privacy" 
                className="text-white-glow text-sm leading-relaxed cursor-pointer"
              >
                {t('agree.privacy')}
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="mt-1 border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <label 
                htmlFor="remember" 
                className="text-white-glow text-sm leading-relaxed cursor-pointer"
              >
                {t('remember.me')}
              </label>
            </div>
          </div>
          
          {/* Login Button */}
          {canLogin && (
            <div className="pt-4 animate-fade-in">
              <Button 
                className="w-full bg-gradient-gold text-black hover:bg-gold-light font-bold py-6 rounded-full shadow-gold text-lg disabled:opacity-50"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? t('loading') : t('login')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BdogId;
