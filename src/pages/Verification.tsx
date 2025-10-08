import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Verification: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfileContext();
  const [step, setStep] = useState<'input' | 'code' | 'captcha'>('input');
  const [nickname, setNickname] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!nickname.trim()) {
      toast.error('Пожалуйста, введите никнейм');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(nickname)) {
      toast.error('Никнейм должен содержать 3-20 символов (буквы, цифры, _)');
      return;
    }

    if (!contactValue.trim()) {
      toast.error('Пожалуйста, введите email');
      return;
    }

    setLoading(true);
    try {
      // Check if nickname already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('nickname', nickname)
        .single();

      if (existingUser) {
        toast.error('Этот никнейм уже занят. Выберите другой.');
        setLoading(false);
        return;
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);

      // Save code to database
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Code valid for 10 minutes

      const updateData: any = {
        nickname: nickname,
        verification_code: code,
        verification_code_expires: expiresAt.toISOString(),
        verification_email: contactValue
      };

      await updateProfile(updateData);

      // Call edge function to send code
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          contactType: 'email',
          contactValue,
          code
        }
      });

      if (error) {
        console.error('Error sending code:', error);
        toast.error('Ошибка отправки кода. Попробуйте снова.');
      } else {
        toast.success(`Код отправлен на ${contactValue}`);
        setStep('code');
      }
    } catch (error) {
      console.error('Error in handleSendCode:', error);
      toast.error('Произошла ошибка. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (!inputCode.trim()) {
      toast.error('Введите код');
      return;
    }

    if (inputCode === verificationCode) {
      toast.success('Код подтвержден!');
      setStep('captcha');
    } else {
      toast.error('Неверный код. Попробуйте снова.');
    }
  };

  const handleCompleteCaptcha = async () => {
    setLoading(true);
    try {
      await updateProfile({
        verified: true,
        verification_completed_at: new Date().toISOString()
      });

      toast.success('Верификация успешно завершена!');
      
      setTimeout(() => {
        navigate('/menu');
      }, 1500);
    } catch (error) {
      console.error('Error completing verification:', error);
      toast.error('Ошибка завершения верификации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-4">
      <div className="container mx-auto max-w-md">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gold hover:text-gold/80"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-gradient">
            Верификация личности
          </h1>
        </div>

        <Card className="p-6 bg-background/95 backdrop-blur-xl border-gold/20">
          {step === 'input' && (
            <div className="space-y-6">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gold mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Создание аккаунта</h2>
                <p className="text-sm text-muted-foreground">
                  Введите никнейм и email для верификации
                </p>
              </div>

              {/* Nickname Input */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Никнейм
                </label>
                <Input
                  type="text"
                  placeholder="username"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="text-center text-lg"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  3-20 символов (буквы, цифры, _)
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  className="text-center text-lg"
                />
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                size="lg"
              >
                {loading ? 'Отправка...' : 'Продолжить'}
              </Button>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-6">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gold mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Введите код</h2>
                <p className="text-sm text-muted-foreground">
                  Код отправлен на {contactValue}
                </p>
              </div>

              {/* Code Input */}
              <div>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerifyCode}
                disabled={inputCode.length !== 6}
                className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                size="lg"
              >
                Подтвердить код
              </Button>

              <Button
                variant="ghost"
                onClick={() => setStep('input')}
                className="w-full"
              >
                Изменить контакт
              </Button>
            </div>
          )}

          {step === 'captcha' && (
            <div className="space-y-6">
              <div className="text-center">
                <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Почти готово!</h2>
                <p className="text-sm text-muted-foreground">
                  Пройдите капчу для завершения верификации
                </p>
              </div>

              {/* Captcha Placeholder */}
              <div className="bg-background/50 border-2 border-dashed border-gold/30 rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Здесь будет интеграция капчи
                </p>
                <p className="text-xs text-muted-foreground">
                  (reCAPTCHA / hCaptcha)
                </p>
              </div>

              {/* Complete Button */}
              <Button
                onClick={handleCompleteCaptcha}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
                size="lg"
              >
                {loading ? 'Завершение...' : 'Завершить верификацию'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Verification;
