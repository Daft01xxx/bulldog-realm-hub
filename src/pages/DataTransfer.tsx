import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, Key, Mail, AlertCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TopNavigation from '@/components/TopNavigation';

const DataTransfer: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfileContext();
  
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [importPhrase, setImportPhrase] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'phrase' | 'code'>('phrase');
  const [loading, setLoading] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

  useEffect(() => {
    if (profile?.verified && profile?.recovery_phrase) {
      setRecoveryPhrase(profile.recovery_phrase);
    }
  }, [profile]);

  const copyRecoveryPhrase = () => {
    if (recoveryPhrase) {
      navigator.clipboard.writeText(recoveryPhrase);
      setCopied(true);
      toast.success('Фраза восстановления скопирована');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartRecovery = async () => {
    if (!importPhrase.trim()) {
      toast.error('Введите фразу восстановления');
      return;
    }

    // Validate phrase format (20 words)
    const words = importPhrase.trim().split(/\s+/);
    if (words.length !== 20) {
      toast.error('Фраза должна содержать ровно 20 слов');
      return;
    }

    setLoading(true);
    try {
      // Find user by recovery phrase
      const { data: targetProfile, error: searchError } = await supabase
        .from('profiles')
        .select('user_id, verification_email, verified')
        .eq('recovery_phrase', importPhrase.trim())
        .single();

      if (searchError || !targetProfile) {
        toast.error('Неверная фраза восстановления');
        setLoading(false);
        return;
      }

      if (!targetProfile.verified) {
        toast.error('Этот аккаунт не верифицирован');
        setLoading(false);
        return;
      }

      if (!targetProfile.verification_email) {
        toast.error('Email не найден для этого аккаунта');
        setLoading(false);
        return;
      }

      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      setTargetEmail(targetProfile.verification_email);

      // Save temporary code
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await supabase
        .from('profiles')
        .update({
          verification_code: code,
          verification_code_expires: expiresAt.toISOString()
        })
        .eq('user_id', targetProfile.user_id);

      // Send code via edge function
      const { error: sendError } = await supabase.functions.invoke('send-verification-code', {
        body: {
          contactType: 'email',
          contactValue: targetProfile.verification_email,
          code
        }
      });

      if (sendError) {
        toast.error('Ошибка отправки кода');
      } else {
        toast.success(`Код отправлен на ${targetProfile.verification_email}`);
        setStep('code');
      }
    } catch (error) {
      console.error('Error starting recovery:', error);
      toast.error('Ошибка восстановления аккаунта');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRecovery = async () => {
    if (!inputCode.trim()) {
      toast.error('Введите код подтверждения');
      return;
    }

    if (inputCode !== verificationCode) {
      toast.error('Неверный код');
      return;
    }

    setLoading(true);
    try {
      // Find the target profile again
      const { data: targetProfile, error: searchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('recovery_phrase', importPhrase.trim())
        .single();

      if (searchError || !targetProfile) {
        toast.error('Ошибка восстановления данных');
        setLoading(false);
        return;
      }

      // Get current device info
      const { data: deviceData } = await supabase.functions.invoke('get-device-info');
      const newIpAddress = deviceData?.ip || null;

      // Update current profile with recovered data
      await updateProfile({
        ...targetProfile,
        user_id: profile?.user_id, // Keep current user_id
        second_ip_address: newIpAddress,
        created_at: profile?.created_at, // Keep original timestamps
        updated_at: new Date().toISOString()
      });

      toast.success('Аккаунт успешно восстановлен!');
      toast.success('Ваши данные перенесены на это устройство');
      
      setTimeout(() => {
        navigate('/menu');
      }, 2000);
    } catch (error) {
      console.error('Error completing recovery:', error);
      toast.error('Ошибка завершения восстановления');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gold hover:text-gold/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <h1 className="text-3xl font-bold text-gradient mb-8">
          Перенос данных
        </h1>

        {/* Show recovery phrase for verified users */}
        {profile?.verified && profile?.recovery_phrase ? (
          <Card className="card-glow p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-gold" />
              <h2 className="text-xl font-bold">Ваша фраза восстановления</h2>
            </div>
            
            <div className="bg-background/50 border-2 border-gold/20 rounded-lg p-4 mb-4">
              <Textarea
                value={recoveryPhrase}
                readOnly
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            <Button
              onClick={copyRecoveryPhrase}
              className="w-full button-gradient-gold"
              size="lg"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Скопировано!' : 'Копировать фразу'}
            </Button>

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Важно!</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Храните фразу в безопасном месте</li>
                    <li>Не делитесь ей ни с кем</li>
                    <li>Используйте для восстановления на другом устройстве</li>
                    <li>Максимум 2 устройства на аккаунт</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Show verification requirement for unverified users */}
        {!profile?.verified && (
          <Card className="card-glow p-6 mb-6">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Требуется верификация</h2>
              <p className="text-muted-foreground mb-6">
                Перенос данных доступен только для верифицированных пользователей.
                Пройдите верификацию для получения уникальной фразы восстановления.
              </p>
              <Button
                onClick={() => navigate('/verification')}
                className="button-gradient-gold"
                size="lg"
              >
                Пройти верификацию
              </Button>
            </div>
          </Card>
        )}

        {/* Recovery section */}
        <Card className="card-glow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Восстановление аккаунта</h2>
          </div>

          {step === 'phrase' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Введите фразу восстановления (20 слов)
                </label>
                <Textarea
                  value={importPhrase}
                  onChange={(e) => setImportPhrase(e.target.value)}
                  placeholder="word1 word2 word3..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleStartRecovery}
                disabled={loading || !importPhrase.trim()}
                className="w-full button-gradient-primary"
                size="lg"
              >
                {loading ? 'Проверка...' : 'Продолжить'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Mail className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Код отправлен на {targetEmail}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Введите код подтверждения
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <Button
                onClick={handleCompleteRecovery}
                disabled={loading || inputCode.length !== 6}
                className="w-full button-gradient-primary"
                size="lg"
              >
                {loading ? 'Восстановление...' : 'Восстановить аккаунт'}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setStep('phrase')}
                className="w-full"
              >
                Изменить фразу
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DataTransfer;