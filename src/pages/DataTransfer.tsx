import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Smartphone, Copy, Check } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import TopNavigation from "@/components/TopNavigation";
import { supabase } from "@/integrations/supabase/client";

const DataTransfer = () => {
  const { profile, reloadProfile } = useProfile();
  const { t } = useLanguage();
  const [transferCode, setTransferCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Generate transfer code when profile loads
  useEffect(() => {
    if (profile) {
      generateTransferCode();
    }
  }, [profile]);

  const generateTransferCode = () => {
    if (!profile) return;

    const transferData = {
      reg: profile.reg,
      user_id: profile.user_id,
      bdog_balance: profile.bdog_balance,
      v_bdog_earned: profile.v_bdog_earned,
      bone: profile.bone,
      grow: profile.grow,
      grow1: profile.grow1,
      referrals: profile.referrals,
      device_fingerprint: profile.device_fingerprint,
      wallet_address: profile.wallet_address,
      miner_level: profile.miner_level,
      current_miner: profile.current_miner,
      completed_tasks: profile.completed_tasks,
      timestamp: Date.now(),
    };

    // Encode to base64 and ensure it's at least 120 characters
    const jsonString = JSON.stringify(transferData);
    const encoded = btoa(jsonString);
    const paddedCode = encoded.padEnd(120, '=');
    
    setTransferCode(paddedCode);
  };

  const copyTransferCode = async () => {
    try {
      await navigator.clipboard.writeText(transferCode);
      setCopied(true);
      toast({
        title: "Скопировано",
        description: "Код переноса скопирован в буфер обмена",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: "Не удалось скопировать код",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleImport = async () => {
    if (!importCode.trim()) {
      toast({
        title: t('toast.error'),
        description: "Введите код переноса",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setIsImporting(true);

    try {
      // Decode the transfer code
      const cleanCode = importCode.trim().replace(/=+$/, '');
      const decoded = atob(cleanCode);
      const transferData = JSON.parse(decoded);
      
      // Validate transfer data
      if (!transferData.reg || !transferData.device_fingerprint) {
        throw new Error("Неверный формат кода переноса");
      }

      // Check if code is not too old (24 hours)
      const codeAge = Date.now() - transferData.timestamp;
      if (codeAge > 24 * 60 * 60 * 1000) {
        throw new Error("Код переноса истёк. Создайте новый код.");
      }

      // Check if trying to import to the same device
      if (profile?.device_fingerprint === transferData.device_fingerprint) {
        throw new Error("Нельзя перенести данные на то же устройство");
      }

      // Update current profile with transferred data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          reg: transferData.reg,
          bdog_balance: transferData.bdog_balance || 0,
          v_bdog_earned: transferData.v_bdog_earned || 0,
          bone: transferData.bone || 0,
          grow: transferData.grow || 0,
          grow1: transferData.grow1 || 1,
          referrals: transferData.referrals || 0,
          wallet_address: transferData.wallet_address,
          miner_level: transferData.miner_level || 1,
          current_miner: transferData.current_miner || 'default',
          completed_tasks: transferData.completed_tasks || '',
          updated_at: new Date().toISOString(),
        })
        .eq('device_fingerprint', profile?.device_fingerprint);

      if (updateError) throw updateError;

      // Invalidate old device by clearing its data
      const { error: invalidateError } = await supabase
        .from('profiles')
        .update({
          bdog_balance: 0,
          v_bdog_earned: 0,
          bone: 0,
          grow: 0,
          grow1: 1,
          referrals: 0,
          wallet_address: null,
          miner_level: 1,
          current_miner: 'default',
          miner_active: false,
          completed_tasks: '',
          device_fingerprint: 'invalidated_' + transferData.device_fingerprint,
          updated_at: new Date().toISOString(),
        })
        .eq('device_fingerprint', transferData.device_fingerprint);

      if (invalidateError) {
        console.error("Failed to invalidate old device:", invalidateError);
      }

      toast({
        title: "Успешно",
        description: "Данные успешно перенесены. Старое устройство деактивировано.",
        duration: 3000,
      });

      setImportCode("");
      await reloadProfile();
      
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message || "Ошибка при импорте данных. Проверьте код.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <TopNavigation />
      
      <div className="max-w-2xl mx-auto pt-20">
        <div className="text-center mb-8">
          <Smartphone className="w-16 h-16 text-gold mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient mb-2">
            {t('menu.data.transfer')}
          </h1>
          <p className="text-muted-foreground">
            Перенесите данные на другое устройство
          </p>
        </div>

        <div className="space-y-6">
          {/* Transfer Code Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-6 h-6 text-gold" />
              <h2 className="text-xl font-semibold text-foreground">Код переноса</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Скопируйте этот код и вставьте его на новом устройстве. После переноса данные на этом устройстве будут удалены.
            </p>
            <div className="relative">
              <Textarea
                value={transferCode}
                readOnly
                className="min-h-[120px] mb-3 font-mono text-xs bg-secondary/50"
                placeholder="Загрузка кода..."
              />
              <Button
                onClick={copyTransferCode}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                disabled={!transferCode}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>

          {/* Import Code Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-6 h-6 text-gold" />
              <h2 className="text-xl font-semibold text-foreground">Импорт с другого устройства</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Вставьте код переноса с другого устройства. Ваши текущие данные будут заменены, а старое устройство деактивировано.
            </p>
            <Textarea
              placeholder="Вставьте код переноса здесь..."
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              className="min-h-[120px] mb-4 font-mono text-xs"
            />
            <Button
              onClick={handleImport}
              className="button-gradient-gold w-full"
              disabled={!importCode.trim() || isImporting}
            >
              {isImporting ? "Перенос..." : "Перенести данные"}
            </Button>
          </Card>

          {/* Warning Card */}
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ <strong>Важно:</strong> Аккаунт можно использовать только на одном устройстве. После переноса данных старое устройство будет деактивировано и все данные на нём удалены. Код действителен 24 часа.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataTransfer;
