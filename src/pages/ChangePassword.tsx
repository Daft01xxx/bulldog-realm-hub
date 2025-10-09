import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useProfileContext } from '@/components/ProfileProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import TopNavigation from '@/components/TopNavigation';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile, updateProfile } = useProfileContext();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Заполните все поля');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Пароль должен содержать минимум 8 символов');
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword)) {
      toast.error('Пароль должен содержать хотя бы одну букву');
      return;
    }

    if (!/[!@#%]/.test(newPassword)) {
      toast.error('Пароль должен содержать хотя бы один спецсимвол (!@#%)');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      await updateProfile({
        bdog_password: newPassword
      });

      toast.success('Пароль успешно изменён');
      navigate('/bdog-id-management');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Произошла ошибка при смене пароля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 py-8">
      <TopNavigation />
      
      <div className="flex-1 flex items-center justify-center pt-16">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-gold/10"
            >
              <ArrowLeft className="w-5 h-5 text-gold" />
            </Button>
            <h1 className="text-2xl font-bold text-gradient">Смена пароля</h1>
          </div>

          <div className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Новый пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              {isLoading ? 'Изменение...' : 'Изменить пароль'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Минимум 8 символов, 1 буква, 1 спецсимвол (!@#%)
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
