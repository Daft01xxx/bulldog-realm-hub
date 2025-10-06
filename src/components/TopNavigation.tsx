import { useState } from 'react';
import { Menu, Home, Wallet, Info, Users, Megaphone, HeadphonesIcon, Moon, Sun, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import bdogLogoTransparent from "@/assets/bulldog-logo-transparent.png";

export default function TopNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageToggle = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

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
    <>
      {/* Top navigation bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="button-outline-gold"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-card border-border">
            <div className="mb-6 pt-4">
              <h2 className="text-lg font-bold text-gradient">BDOG APP</h2>
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
                          <img 
                            src={bdogLogoTransparent} 
                            alt="BDOG" 
                            width="20"
                            height="20"
                            className="w-5 h-5 object-contain"
                            loading="lazy"
                            decoding="async"
                          />
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

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLanguageToggle}
            className="button-outline-gold w-9 h-9 p-0"
            title={t('switch.language')}
          >
            <Languages className="w-4 h-4 text-gold" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="button-outline-gold w-9 h-9 p-0"
            title={t('switch.theme')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-gold" />
            ) : (
              <Moon className="w-4 h-4 text-gold" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}