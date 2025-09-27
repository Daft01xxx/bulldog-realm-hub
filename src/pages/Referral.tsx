import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Copy, Users, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

const Referral = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useProfile();
  const [referralLink, setReferralLink] = useState("");
  const [referredCount, setReferredCount] = useState(0);
  const [earnedVBDOG, setEarnedVBDOG] = useState(0);


  useEffect(() => {
    // Generate unique referral link and load data from profile
    if (profile) {
      // Generate new referral code if current one was used
      let currentCode = profile.reg;
      if (profile.referral_code_used) {
        currentCode = `${profile.reg}-${Date.now().toString(36)}`;
        // Update profile with new code
        updateProfile({ 
          reg: currentCode, 
          referral_code_used: false,
          last_referral_code: null 
        });
      }
      
      const link = `https://preview--bulldog-realm-hub.lovable.app/menu?ref=${currentCode}`;
      setReferralLink(link);
      setReferredCount(profile.referrals || 0);
      setEarnedVBDOG(profile.v_bdog_earned || 0);
    } else {
      const userId = localStorage.getItem("bdog-reg") || "user";
      const link = `https://preview--bulldog-realm-hub.lovable.app/menu?ref=${userId}`;
      setReferralLink(link);
      setReferredCount(Number(localStorage.getItem("bdog-referrals")) || 0);
      setEarnedVBDOG(Number(localStorage.getItem("bdog-v-earned")) || 0);
    }
  }, [profile, updateProfile]);

  const copyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast({
        title: "Скопировано!",
        description: "Реферальная ссылка скопирована в буфер обмена",
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-background px-4 py-12">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8 pt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="button-outline-gold"
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-gold" />
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
          className="button-outline-gold"
        >
          <Home className="w-4 h-4 mr-2 text-gold" />
          Меню
        </Button>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gradient animate-glow-text mb-4">
          Реферальная программа
        </h1>
        <p className="text-muted-foreground">
          Приглашайте друзей и получайте V-BDOG токены
        </p>
      </div>

      {/* Reward Info */}
      <Card className="card-glow max-w-md mx-auto p-6 mb-6 text-center animate-fade-in-up">
        <Gift className="w-10 h-10 text-gold mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Награда за реферала</h3>
        <p className="text-3xl font-bold text-gradient mb-1">100,000 V-BDOG</p>
        <p className="text-sm text-muted-foreground">за каждого приглашенного друга</p>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
        <Card className="card-glow p-6 text-center animate-fade-in-up">
          <Users className="w-8 h-8 text-gold mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">Приглашено</p>
          <p className="text-2xl font-bold text-foreground">{referredCount}</p>
        </Card>
        
        <Card className="card-glow p-6 text-center animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <Gift className="w-8 h-8 text-gold mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">Заработано</p>
          <p className="text-2xl font-bold text-gradient">{earnedVBDOG.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">V-BDOG</p>
        </Card>
      </div>

      {/* Referral link */}
      <Card className="card-glow max-w-md mx-auto p-6 mb-8 animate-bounce-in">
        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
          Ваша реферальная ссылка
        </h3>
        
        <div className="flex gap-2">
          <div className="flex-1 p-3 bg-secondary rounded-lg text-sm text-foreground font-mono break-all">
            {referralLink}
          </div>
          <Button 
            onClick={copyLink}
            variant="outline"
            size="sm"
            className="button-outline-gold px-3"
          >
            <Copy className="w-4 h-4 text-gold" />
          </Button>
        </div>
      </Card>

    </div>
  );
};

export default Referral;