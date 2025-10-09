import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, Key, AlertCircle, Copy } from "lucide-react";
import { useProfileContext } from "@/components/ProfileProvider";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const BdogIdManagement = () => {
  const navigate = useNavigate();
  const { profile } = useProfileContext();
  const { t } = useLanguage();

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
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/menu')}
            className="border-gold text-gold hover:bg-gold hover:text-black transition-colors"
          >
            <Menu className="w-5 h-5 mr-2" />
            Меню
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
                onClick={() => navigate('/change-password')}
                className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
              >
                Сменить пароль
              </Button>
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
