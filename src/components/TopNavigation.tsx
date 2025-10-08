import { useState } from 'react';
import { Moon, Sun, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import UserProfileModal from '@/components/UserProfileModal';

export default function TopNavigation() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Top Bar Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Profile Icon */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsProfileOpen(true)}
          className="hover:bg-transparent"
        >
          <UserIcon className="w-4 h-4 text-gold" />
        </Button>

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

      <UserProfileModal open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  );
}
