import { useState } from 'react';
import { Menu, X, Home, Wallet, Info, Users, Megaphone, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTrigger as SheetTriggerPrimitive } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import bdogLogo from "@/assets/bdog-logo.jpeg";

export default function TopNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    {
      title: "Главное меню",
      icon: Home,
      path: "/menu",
      description: "Вернуться в главное меню"
    },
    {
      title: "Кошелёк BDOG",
      icon: Wallet,
      path: "/wallet",
      description: "Управление токенами"
    },
    {
      title: "BDOG GAME",
      icon: "bdog-silver",
      path: "/game",
      description: "Играть и зарабатывать"
    },
    {
      title: "Информация о BDOG",
      icon: Info,
      path: "/info",
      description: "О проекте"
    },
    {
      title: "Реферальная программа",
      icon: Users,
      path: "/referral",
      description: "Приглашать друзей"
    },
    {
      title: "Реклама проекта",
      icon: Megaphone,
      path: "/promotion",
      description: "Получать награды"
    },
    {
      title: "Поддержка",
      icon: "support",
      path: "https://t.me/Deff0xq",
      description: "Связаться с поддержкой",
      external: true
    }
  ];

  const handleNavigate = (item: any) => {
    if (item.external) {
      window.open(item.path, '_blank');
    } else {
      navigate(item.path);
    }
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="button-outline-gold fixed top-4 left-4 z-50"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-card border-border">
        <div className="flex items-center justify-between mb-6 pt-4">
          <h2 className="text-lg font-bold text-gradient">BDOG APP</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon !== "bdog-silver" && item.icon !== "support" ? item.icon : null;
            return (
              <Button
                key={item.title}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-surface-elevated group"
                onClick={() => handleNavigate(item)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-md bg-gradient-gold group-hover:animate-pulse-gold transition-all duration-300">
                    {item.icon === "bdog-silver" ? (
                      <img src={bdogLogo} alt="BDOG" className="w-4 h-4 rounded-full object-cover" />
                    ) : item.icon === "support" ? (
                      <HeadphonesIcon className="w-4 h-4 icon-gold" />
                    ) : (
                      <IconComponent className="w-4 h-4 icon-gold" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}