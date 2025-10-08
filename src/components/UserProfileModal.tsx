import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProfileContext } from '@/components/ProfileProvider';
import { useNavigate } from 'react-router-dom';
import { User, Wallet, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onOpenChange }) => {
  const { profile } = useProfileContext();
  const navigate = useNavigate();

  const handleVerification = () => {
    onOpenChange(false);
    navigate('/verification');
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-gold/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient">
            Профиль пользователя
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              {profile.verified ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              )}
              <div>
                <p className="font-semibold">
                  {profile.verified ? 'Верифицирован' : 'Не верифицирован'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile.verified 
                    ? 'Ваш аккаунт подтвержден' 
                    : 'Требуется верификация'}
                </p>
              </div>
            </div>
          </div>

          {/* Nickname */}
          {profile.nickname && (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Никнейм
              </label>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">
                  {profile.nickname}
                </span>
              </div>
            </div>
          )}

          {/* User ID (BDOG format) */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              ID пользователя
            </label>
            <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
              <User className="w-4 h-4 text-muted-foreground" />
              <code className="flex-1 text-sm font-mono">
                {profile.user_id ? `BDOG_${profile.user_id.replace(/-/g, '').substring(0, 4).toUpperCase()}...${profile.user_id.replace(/-/g, '').slice(-4).toUpperCase()}` : 'Не указан'}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (profile.user_id) {
                    const cleanId = profile.user_id.replace(/-/g, '');
                    const bdogId = `BDOG_${cleanId.substring(0, 4).toUpperCase()}...${cleanId.slice(-4).toUpperCase()}`;
                    navigator.clipboard.writeText(bdogId);
                    toast.success('ID скопирован');
                  }
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Wallet Address */}
          {profile.wallet_address && (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Адрес кошелька
              </label>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <code className="flex-1 text-sm font-mono truncate">
                  {profile.wallet_address}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    navigator.clipboard.writeText(profile.wallet_address);
                    toast.success('Адрес скопирован');
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Verification Button */}
          {!profile.verified && (
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Пройдите верификацию для доступа ко всем функциям
              </p>
              <Button
                onClick={handleVerification}
                className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
              >
                Верификация личности
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
