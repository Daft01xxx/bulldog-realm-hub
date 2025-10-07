import { useState } from 'react';
import { Menu, X, Home, Wallet, Info, Users, Megaphone, HeadphonesIcon, Moon, Sun, Pickaxe, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage, languageNames } from '@/contexts/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import bdogLogo from "@/assets/bulldog-logo-transparent.png";

export default function TopNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { profile } = useProfile();

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
      title: t('menu.miner'),
      icon: "miner",
      path: "/miner",
      description: t('menu.miner.desc')
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

  const sortedLanguages = Object.entries(languageNames).sort((a, b) => 
    a[1].localeCompare(b[1])
  );

  const handleNavigate = (item: any) => {
    if (item.external) {
      window.open(item.path, '_blank');
    } else {
      navigate(item.path);
    }
    setIsOpen(false);
  };

  const copyUserId = async () => {
    const userId = profile?.reg || localStorage.getItem("bdog-reg") || "";
    if (userId) {
      try {
        await navigator.clipboard.writeText(userId);
        toast({
          title: t('toast.copied'),
          description: t('toast.copied.desc'),
          duration: 1000,
        });
      } catch {
        toast({
          title: t('toast.error'),
          description: t('toast.copy.error'),
          variant: "destructive",
          duration: 1000,
        });
      }
    }
  };

  return (
    <>
      {/* Top Bar Controls */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-transparent"
            >
              {isOpen ? (
                <X className="w-4 h-4 text-gold" />
              ) : (
                <Menu className="w-4 h-4 text-gold" />
              )}
            </Button>
          </SheetTrigger>
        </Sheet>
        
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
        </div>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-80 bg-card border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-gold">BDOG APP</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* User ID Section */}
            <div className="p-4 bg-surface/50 rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground mb-2">{t('user.id')}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gold font-semibold text-sm truncate">
                  {profile?.reg || localStorage.getItem("bdog-reg") || ""}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyUserId}
                  className="h-8 w-8 p-0 hover:bg-gold/10 flex-shrink-0"
                >
                  <Copy className="w-4 h-4 text-gold" />
                </Button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="p-4 bg-surface/50 rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground mb-3">{t('select.language')}</p>
              <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                <SelectTrigger className="w-full border-gold/20 text-gold">
                  <SelectValue>{languageNames[language]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sortedLanguages.map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon !== "bdog-silver" && item.icon !== "miner" && item.icon !== "support" ? item.icon : null;
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
                        ) : item.icon === "miner" ? (
                          <Pickaxe className="w-4 h-4 icon-gold" />
                        ) : IconComponent ? (
                          <IconComponent className="w-4 h-4 icon-gold" />
                        ) : null}
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
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
