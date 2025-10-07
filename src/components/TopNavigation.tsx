import { useState } from 'react';
import { Menu, X, Home, Wallet, Info, Users, Megaphone, HeadphonesIcon, Moon, Sun, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import bdogLogo from "@/assets/bulldog-logo-transparent.png";

export default function TopNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const navigationItems = [
    {
      title: t('nav.main'),
      icon: Home,
      path: "/menu",
      description: t('nav.main.desc')
    },
    {
      title: t('menu.wallet'),
      icon: Wallet,
      path: "/wallet",
      description: t('menu.wallet.desc')
    },
    {
      title: t('menu.game'),
      icon: "bdog-silver",
      path: "/game",
      description: t('menu.game.desc')
    },
    {
      title: t('menu.info'),
      icon: Info,
      path: "/info",
      description: t('menu.info.desc')
    },
    {
      title: t('menu.referral'),
      icon: Users,
      path: "/referral",
      description: t('menu.referral.desc')
    },
    {
      title: t('menu.promotion'),
      icon: Megaphone,
      path: "/promotion",
      description: t('menu.promotion.desc')
    },
    {
      title: t('menu.support'),
      icon: "support",
      path: "https://t.me/Deff0xq",
      description: t('menu.support.desc'),
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
      {/* Top Bar Controls */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          className="hover:bg-transparent"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="w-4 h-4 text-gold" />
        </Button>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hover:bg-transparent"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-gold" /> : <Sun className="w-4 h-4 text-gold" />}
          </Button>
          
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
            className="hover:bg-transparent"
          >
            <Languages className="w-4 h-4 text-gold" />
          </Button>
        </div>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                      <img src={bdogLogo} alt="BDOG" className="w-4 h-4 object-contain" />
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
    </>
  );
}