import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Download, Upload, Database } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import TopNavigation from "@/components/TopNavigation";

const DataTransfer = () => {
  const { profile, updateProfile } = useProfile();
  const { t } = useLanguage();
  const [importData, setImportData] = useState("");

  const exportData = () => {
    if (!profile) {
      toast({
        title: t('toast.error'),
        description: "Нет данных для экспорта",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const dataToExport = {
      reg: profile.reg,
      bdog_balance: profile.bdog_balance,
      v_bdog_earned: profile.v_bdog_earned,
      bone: profile.bone,
      grow: profile.grow,
      referrals: profile.referrals,
      export_date: new Date().toISOString(),
    };

    const dataString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bdog_data_${profile.reg}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Успешно",
      description: "Данные экспортированы",
      duration: 2000,
    });
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: t('toast.error'),
        description: "Введите данные для импорта",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      const parsedData = JSON.parse(importData);
      
      // Validate required fields
      if (!parsedData.reg) {
        throw new Error("Неверный формат данных");
      }

      await updateProfile({
        bdog_balance: parsedData.bdog_balance || 0,
        v_bdog_earned: parsedData.v_bdog_earned || 0,
        bone: parsedData.bone || 0,
        grow: parsedData.grow || 0,
      });

      toast({
        title: "Успешно",
        description: "Данные импортированы",
        duration: 2000,
      });

      setImportData("");
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: "Ошибка при импорте данных. Проверьте формат.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <TopNavigation />
      
      <div className="max-w-2xl mx-auto pt-20">
        <div className="text-center mb-8">
          <Database className="w-16 h-16 text-gold mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient mb-2">
            {t('menu.data.transfer')}
          </h1>
          <p className="text-muted-foreground">
            {t('menu.data.transfer.desc')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Export Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-gold" />
              <h2 className="text-xl font-semibold text-foreground">Экспорт данных</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Сохраните все ваши данные в файл JSON для резервного копирования или переноса на другое устройство.
            </p>
            <Button
              onClick={exportData}
              className="button-gradient-gold w-full"
              disabled={!profile}
            >
              <Download className="w-4 h-4 mr-2" />
              Экспортировать данные
            </Button>
          </Card>

          {/* Import Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-gold" />
              <h2 className="text-xl font-semibold text-foreground">Импорт данных</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Вставьте содержимое JSON-файла с вашими данными для восстановления.
            </p>
            <Textarea
              placeholder="Вставьте JSON-данные здесь..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="min-h-[200px] mb-4 font-mono text-sm"
            />
            <Button
              onClick={handleImport}
              className="button-gradient-gold w-full"
              disabled={!importData.trim()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Импортировать данные
            </Button>
          </Card>

          {/* Warning Card */}
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ <strong>Внимание:</strong> Импорт данных перезапишет ваши текущие данные. 
              Рекомендуется сначала экспортировать текущие данные в качестве резервной копии.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataTransfer;
