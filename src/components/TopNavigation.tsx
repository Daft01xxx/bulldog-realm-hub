import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, User as UserIcon, Menu, X, Home, Wallet, Info, Users, Megaphone, Shield, Gamepad2, Pickaxe, HeadphonesIcon, Copy, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage, languageNames } from '@/contexts/LanguageContext';
import { useProfileContext } from '@/components/ProfileProvider';
import UserProfileModal from '@/components/UserProfileModal';
import { toast } from 'sonner';

type Language = 'ru' | 'en' | 'zh' | 'es' | 'de' | 'fr' | 'it' | 'ja' | 'ko' | 'uk' | 'sv';

export default function TopNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { profile } = useProfileContext();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: Gamepad2, label: t('nav.game'), path: '/game' },
    { icon: Pickaxe, label: t('nav.miner'), path: '/miner' },
    { icon: Wallet, label: t('nav.wallet'), path: '/wallet' },
    { icon: Info, label: t('nav.info'), path: '/info' },
    { icon: Users, label: t('nav.referral'), path: '/referral' },
    { icon: Megaphone, label: t('nav.promotion'), path: '/promotion' },
    { icon: HeadphonesIcon, label: t('nav.support'), path: 'https://t.me/Deff0xq', external: true },
    { icon: Shield, label: 'BDOG ID', path: '/bdog-id-management' },
  ];

  // Add admin if user has admin IP
  if (profile?.ip_address && ['178.205.158.61', '127.0.0.1', 'localhost'].includes(profile.ip_address)) {
    navigationItems.push({ icon: Shield, label: t('nav.admin'), path: '/admin' });
  }

  const handleNavigate = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const copyUserId = () => {
    if (profile?.bdog_id) {
      navigator.clipboard.writeText(profile.bdog_id);
      toast.success(t('toast.copied'));
    }
  };

  const sortedLanguages = Object.entries(languageNames).sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <>
      {/* Top Bar Controls */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        {/* Left: Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-transparent"
            >
              <Menu className="w-5 h-5 text-gold" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-background/95 backdrop-blur-xl border-gold/20">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gradient">{t('nav.main')}</h2>
              </div>

              {/* User Info */}
              {profile && (
                <div className="mb-6 p-4 bg-surface/50 rounded-lg border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium">
                      {profile.nickname || t('profile.anonymous')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-muted-foreground flex-1">
                      {profile.bdog_id || t('profile.no_id')}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={copyUserId}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="flex-1 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className={`w-full justify-start gap-3 ${
                        isActive ? 'bg-gold/10 text-gold' : 'hover:bg-gold/5'
                      }`}
                      onClick={() => handleNavigate(item.path, item.external)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </nav>

              {/* Language Selector */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="w-4 h-4 text-gold" />
                  <span className="text-sm font-medium">{t('language.select')}</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full p-2 rounded-lg bg-surface/50 border border-border/30 text-sm"
                >
                  {sortedLanguages.map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Right: Profile & Theme */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsProfileOpen(true)}
            className="hover:bg-transparent"
          >
            <UserIcon className="w-4 h-4 text-gold" />
          </Button>

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

      <UserProfileModal open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  );
}
