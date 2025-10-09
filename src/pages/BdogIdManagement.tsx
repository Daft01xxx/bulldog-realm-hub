import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, Key, AlertCircle, Copy } from "lucide-react";
import { useProfileContext } from "@/components/ProfileProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const BdogIdManagement = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfileContext();
  const { t } = useLanguage();
  const [step, setStep] = useState<'view' | 'code' | 'change'>('view');
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!profile?.verification_email) {
      toast.error('Email не найден');
      return;
    }

    setLoading(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await updateProfile({
        verification_code: code,
        verification_code_expires: expiresAt.toISOString()
      });

      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          contactType: 'email',
          contactValue: profile.verification_email,
          code,
          subject: 'Смена пароля BDOG ID'
        }
      });

      if (error) {
        toast.error('Ошибка отправки кода');
      } else {
        toast.success(`Код отправлен на ${profile.verification_email}`);
        setStep('code');
      }
    } catch (error) {
      console.error('Error sending code:', error);
      toast.error('Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (inputCode === verificationCode) {
      toast.success('Код подтвержден!');
      setStep('change');
    } else {
      toast.error('Неверный код');
    }
  };

  const handleChangePassword = async () => {
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

    setLoading(true);
    try {
      await updateProfile({
        bdog_password: newPassword
      });

      toast.success('Пароль успешно изменен!');
      setStep('view');
      setInputCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Ошибка изменения пароля');
    } finally {
      setLoading(false);
    }
  };

  const copyBdogId = () => {
    if (profile?.bdog_id) {
      navigator.clipboard.writeText(profile.bdog_id);
      toast.success('BDOG ID скопирован');
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-dark"></div>
      
      {/* Header */}
      <div className="relative z-10">
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/menu')}
            className="hover:bg-transparent text-gold hover:text-gold/80"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="ml-2">Назад</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20 px-4 pb-8">
        <div className="container mx-auto max-w-md">
          <h1 className="text-4xl font-bold text-gradient text-center mb-2">
            BDOG ID
          </h1>
          
          {/* BDOG ID Display */}
          <Card className="p-6 bg-background/95 backdrop-blur-xl border-gold/20 mb-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Ваш BDOG ID</p>
                <code className="text-lg font-mono text-gold font-bold break-all">
                  {profile?.bdog_id || 'Не создан'}
                </code>
              </div>
              {profile?.bdog_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyBdogId}
                  className="flex-shrink-0"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              )}
            </div>
          </Card>

          {/* Content based on verification */}
          {profile?.verified ? (
            <Card className="p-6 bg-background/95 backdrop-blur-xl border-gold/20 space-y-6">
              {step === 'view' && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Key className="w-6 h-6 text-gold" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Пароль для входа</p>
                        <code className="text-lg font-mono">
                          {profile?.bdog_password || '••••••••••'}
                        </code>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                  >
                    Сменить пароль
                  </Button>
                </>
              )}

              {step === 'code' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Shield className="w-16 h-16 text-gold mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Введите код</h2>
                    <p className="text-sm text-muted-foreground">
                      Код отправлен на {profile?.verification_email}
                    </p>
                  </div>

                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest font-mono"
                  />

                  <Button
                    onClick={handleVerifyCode}
                    disabled={inputCode.length !== 6}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                  >
                    Подтвердить код
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setStep('view')}
                    className="w-full"
                  >
                    Отмена
                  </Button>
                </div>
              )}

              {step === 'change' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Key className="w-16 h-16 text-gold mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Новый пароль</h2>
                    <p className="text-sm text-muted-foreground">
                      Минимум 8 символов, 1 буква, 1 спецсимвол (!@#%)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Новый пароль
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Подтвердите пароль
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                  >
                    {loading ? 'Сохранение...' : 'Сохранить пароль'}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setStep('view')}
                    className="w-full"
                  >
                    Отмена
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6 bg-background/95 backdrop-blur-xl border-gold/20 space-y-6">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Аккаунт не защищен!</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Пройдите верификацию для подключения дополнительной защиты
                </p>
              </div>

              <Button
                onClick={() => navigate('/verification')}
                className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
              >
                Пройти верификацию
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BdogIdManagement;
