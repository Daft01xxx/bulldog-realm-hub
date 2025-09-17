import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Gamepad2, Info, Users, Megaphone } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const Menu = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [reg, setReg] = useState("");
  const [balance2, setBalance2] = useState("0");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Load user data from profile or localStorage
    if (profile) {
      setReg(profile.reg || "");
      setBalance2(profile.balance2?.toString() || "0");
    } else {
      setReg(localStorage.getItem("bdog-reg") || "");
      setBalance2(localStorage.getItem("bdog-balance2") || "0");
    }
    
    // Trigger animations
    setAnimate(true);
  }, [profile]);

  const menuItems = [
    {
      title: "Кошелёк BDOG",
      icon: Wallet,
      path: "/wallet",
      description: "Управляйте своими токенами",
      delay: "0.1s"
    },
    {
      title: "BDOG GAME",
      icon: Gamepad2,
      path: "/game",
      description: "Играйте и зарабатывайте",
      delay: "0.2s"
    },
    {
      title: "Информация о BDOG",
      icon: Info,
      path: "/info",
      description: "Узнайте больше о проекте",
      delay: "0.3s"
    },
    {
      title: "Реферальная программа",
      icon: Users,
      path: "/referral",
      description: "Приглашайте друзей",
      delay: "0.4s"
    },
    {
      title: "Реклама проекта за вознаграждение",
      icon: Megaphone,
      path: "/promotion",
      description: "Продвигайте и получайте награды",
      delay: "0.5s"
    }
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      {/* Header with title */}
      <div className="text-center mb-12 pt-8">
        <h1 
          className={`text-5xl md:text-7xl font-bold text-gradient animate-glow-text mb-8 ${
            animate ? 'animate-bounce-in' : 'opacity-0'
          }`}
        >
          BDOG APP
        </h1>
        
        {/* User info */}
        <Card 
          className={`card-glow max-w-md mx-auto p-6 mb-8 ${
            animate ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.3s' }}
        >
          <div className="space-y-3">
            <p className="text-lg text-muted-foreground">
              Пользователь: <span className="text-gold font-semibold">{reg}</span>
            </p>
            <p className="text-xl text-foreground">
              Баланс: <span className="text-gradient font-bold">{balance2} BDOG</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Menu grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={item.title}
                className={`card-glow p-6 cursor-pointer hover-lift group ${
                  animate ? 'animate-slide-in-right' : 'opacity-0'
                }`}
                style={{ animationDelay: item.delay }}
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-gradient-gold group-hover:animate-pulse-gold transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Advertising space */}
        <Card 
          className={`card-glow p-6 text-center ${
            animate ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.6s' }}
        >
          <p className="text-gray-subtle mb-2">Твоя реклама тут,</p>
          <a 
            href="https://t.me/Deff0xq" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-light transition-colors underline font-semibold"
          >
            пиши нам
          </a>
        </Card>
      </div>
    </div>
  );
};

export default Menu;