import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Copy, Users, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Referral = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState("");
  const [referredCount, setReferredCount] = useState(0);
  const [earnedVBDOG, setEarnedVBDOG] = useState(0);

  const rewards = [
    { count: 1, reward: 5000, completed: false },
    { count: 2, reward: 6000, completed: false },
    { count: 3, reward: 7000, completed: false },
    { count: 10, reward: 10000, completed: false },
    { count: 20, reward: 30000, completed: false },
    { count: 50, reward: 100000, completed: false },
    { count: 100, reward: 300000, completed: false },
  ];

  useEffect(() => {
    // Generate unique referral link
    const userId = localStorage.getItem("bdog-reg") || "user";
    const link = `${window.location.origin}?ref=${userId}`;
    setReferralLink(link);

    // Load referral data
    setReferredCount(Number(localStorage.getItem("bdog-referrals")) || 0);
    setEarnedVBDOG(Number(localStorage.getItem("bdog-vbdog-earned")) || 0);
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
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

  const getNextReward = () => {
    return rewards.find(reward => referredCount < reward.count);
  };

  const getProgress = () => {
    const nextReward = getNextReward();
    if (!nextReward) return 100;
    return Math.min((referredCount / nextReward.count) * 100, 100);
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
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
          className="button-outline-gold"
        >
          <Home className="w-4 h-4 mr-2" />
          Меню
        </Button>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient animate-glow-text mb-4">
          Реферальная программа
        </h1>
        <p className="text-muted-foreground">
          Приглашайте друзей и получайте V-BDOG токены
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
        <Card className="card-glow p-6 text-center animate-fade-in-up">
          <Users className="w-8 h-8 text-gold mx-auto mb-2" />
          <p className="text-sm text-muted-eferground mb-1">Приглашено</p>
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
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Progress */}
      <Card className="card-glow max-w-md mx-auto p-6 mb-8 animate-slide-in-right" style={{animationDelay: '0.2s'}}>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Прогресс до следующей награды
        </h3>
        
        {getNextReward() ? (
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Приглашено: {referredCount}</span>
              <span>Цель: {getNextReward()?.count}</span>
            </div>
            
            <div className="w-full bg-secondary rounded-full h-3 mb-3">
              <div 
                className="bg-gradient-gold rounded-full h-3 transition-all duration-500"
                style={{width: `${getProgress()}%`}}
              ></div>
            </div>
            
            <p className="text-center text-gold font-semibold">
              Награда: {getNextReward()?.reward.toLocaleString()} V-BDOG
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gold font-semibold">🎉 Все награды получены! 🎉</p>
          </div>
        )}
      </Card>

      {/* Rewards list */}
      <div className="max-w-md mx-auto animate-fade-in-up" style={{animationDelay: '0.4s'}}>
        <h3 className="text-xl font-bold text-foreground mb-4 text-center">
          Система наград
        </h3>
        
        <Card className="card-glow p-4">
          <div className="space-y-3">
            {rewards.map((reward, index) => {
              const isCompleted = referredCount >= reward.count;
              const isCurrent = !isCompleted && (index === 0 || referredCount >= rewards[index - 1].count);
              
              return (
                <div 
                  key={reward.count}
                  className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                    isCompleted 
                      ? 'bg-gold/20 border border-gold/30' 
                      : isCurrent 
                        ? 'bg-secondary border border-gold/20 animate-pulse-gold' 
                        : 'bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? 'bg-gold text-black' : 'bg-gray-subtle text-white'
                    }`}>
                      {isCompleted ? '✓' : reward.count}
                    </div>
                    <span className={`font-semibold ${
                      isCompleted ? 'text-gold' : 'text-foreground'
                    }`}>
                      {reward.count} реферал{reward.count > 1 ? (reward.count < 5 ? 'а' : 'ов') : ''}
                    </span>
                  </div>
                  
                  <span className={`font-bold ${
                    isCompleted ? 'text-gold' : 'text-muted-foreground'
                  }`}>
                    {reward.reward.toLocaleString()} V-BDOG
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Referral;