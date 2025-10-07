import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProfileContext } from '@/components/ProfileProvider';
import { useNavigate } from 'react-router-dom';
import { Shield, Wallet, User, CheckCircle, XCircle } from 'lucide-react';

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
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center gap-2">
            <User className="w-6 h-6 text-gold" />
            Профиль пользователя
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/20">
            <div className="flex items-center gap-3">
              {profile.verified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Статус верификации</p>
                <p className="text-sm text-muted-foreground">
                  {profile.verified ? 'Верифицирован' : 'Не верифицирован'}
                </p>
              </div>
            </div>
          </div>

          {/* User ID */}
          <div className="p-4 rounded-lg bg-background/50 border border-border/20">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-gold" />
              <p className="font-medium">ID пользователя</p>
            </div>
            <p className="text-sm text-muted-foreground break-all pl-8">
              {profile.user_id}
            </p>
          </div>

          {/* Wallet Address */}
          <div className="p-4 rounded-lg bg-background/50 border border-border/20">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-gold" />
              <p className="font-medium">Подключенный кошелек</p>
            </div>
            <p className="text-sm text-muted-foreground break-all pl-8">
              {profile.wallet_address || 'Кошелек не подключен'}
            </p>
          </div>

          {/* Verification Button */}
          {!profile.verified && (
            <Button
              onClick={handleVerification}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold flex items-center gap-2"
              size="lg"
            >
              <Shield className="w-5 h-5" />
              Верификация личности
            </Button>
          )}

          {!profile.verified && (
            <div className="text-center text-sm text-muted-foreground p-3 bg-background/30 rounded-lg border border-border/10">
              Пройдите верификацию личности и получите доступ ко всем функциям приложения
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
