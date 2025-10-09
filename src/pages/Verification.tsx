import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfileContext } from '@/components/ProfileProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Verification: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useProfileContext();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleCompleteVerification = async () => {
    if (!nickname.trim()) {
      toast.error('Пожалуйста, введите никнейм');
      return;
    }

    // Validate nickname: max 12 chars, no spaces, underscores, special chars
    if (nickname.length > 12) {
      toast.error('Никнейм не может быть длиннее 12 символов');
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(nickname)) {
      toast.error('Никнейм может содержать только буквы и цифры');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Необходимо согласие на обработку персональных данных');
      return;
    }

    setLoading(true);
    try {
      // Check if nickname already exists
      const { data: existingNickname } = await supabase
        .from('profiles')
        .select('id')
        .ilike('nickname', nickname)
        .limit(1);

      if (existingNickname && existingNickname.length > 0) {
        toast.error('Этот никнейм уже занят. Выберите другой.');
        setLoading(false);
        return;
      }

      // Generate recovery phrase using database function
      const { data: phraseData, error: phraseError } = await supabase.rpc('generate_recovery_phrase');
      
      if (phraseError) {
        console.error('Error generating recovery phrase:', phraseError);
        toast.error('Ошибка генерации фразы восстановления');
        setLoading(false);
        return;
      }

      // Update profile with verification and recovery phrase
      await updateProfile({
        nickname: nickname,
        verified: true,
        verification_completed_at: new Date().toISOString(),
        recovery_phrase: phraseData
      });

      toast.success('Верификация успешно завершена!');
      toast.success('Фраза восстановления создана');
      
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
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Создание аккаунта</h2>
              <p className="text-sm text-muted-foreground">
                Введите никнейм для верификации
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
                onChange={(e) => setNickname(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                className="text-center text-lg"
                maxLength={12}
              />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Максимум 12 символов (только буквы и цифры)
              </p>
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="bg-background/50 border-2 border-gold/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms-check"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="mt-1"
                />
                <label 
                  htmlFor="terms-check" 
                  className="text-sm cursor-pointer leading-relaxed"
                >
                  Я согласен на обработку персональных данных и принимаю условия пользовательского соглашения
                </label>
              </div>
            </div>

            {/* Complete Button */}
            <Button
              onClick={handleCompleteVerification}
              disabled={loading || !agreedToTerms || !nickname.trim()}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold disabled:opacity-50"
              size="lg"
            >
              {loading ? 'Завершение...' : 'Завершить верификацию'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Verification;
