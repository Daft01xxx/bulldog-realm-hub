import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Home, Trash2, RefreshCw, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BanUserModal from "@/components/BanUserModal";
import UnbanUserModal from "@/components/UnbanUserModal";

interface UserProfile {
  id: string;
  reg: string | null;
  grow: number;
  bone: number;
  v_bdog_earned: number;
  referrals: number;
  ip_address: string | null;
  device_fingerprint: string | null;
  wallet_address: string | null;
  created_at: string;
  grow1: number;
  booster_expires_at: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [updateValues, setUpdateValues] = useState({
    grow: "",
    bone: "",
    v_bdog_earned: "",
    grow1: ""
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  
  const checkPassword = (password: string) => {
    return password === "admin123" || password === "Gnomdoma04022012";
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-panel', {
        body: { action: 'list_users' }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setProfiles(data.profiles || []);
        toast({
          title: "Пользователи загружены",
          description: `Найдено ${data.count} пользователей`,
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async () => {
    if (!selectedUserId) {
      toast({
        title: "Ошибка",
        description: "Выберите пользователя для обновления",
        variant: "destructive",
      });
      return;
    }

    try {
      const updates: any = {};
      if (updateValues.grow) updates.grow = parseInt(updateValues.grow);
      if (updateValues.bone) updates.bone = parseInt(updateValues.bone);
      if (updateValues.v_bdog_earned) updates.v_bdog_earned = parseInt(updateValues.v_bdog_earned);
      if (updateValues.grow1) updates.grow1 = parseInt(updateValues.grow1);

      const { data, error } = await supabase.functions.invoke('admin-panel', {
        body: { action: 'update_user', userId: selectedUserId, updates }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Пользователь обновлен",
          description: data.message,
        });
        loadUsers(); // Reload users
        setUpdateValues({ grow: "", bone: "", v_bdog_earned: "", grow1: "" });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить пользователя",
        variant: "destructive",
      });
    }
  };

  const deleteAllUsers = async () => {
    if (!confirm("Вы уверены, что хотите удалить ВСЕ профили пользователей? Это действие необратимо!")) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-panel', {
        body: { action: 'delete_all_users' }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Все пользователи удалены",
          description: data.message,
        });
        setProfiles([]);
      }
    } catch (error) {
      console.error('Error deleting all users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователей",
        variant: "destructive",
      });
    }
  };

  const resetAllBoosters = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-panel', {
        body: { action: 'reset_boosters' }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Ускорители сброшены",
          description: `Сброшено ускорителей: ${data.count}`,
        });
        loadUsers(); // Reload users
      }
    } catch (error) {
      console.error('Error resetting boosters:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сбросить ускорители",
        variant: "destructive",
      });
    }
  };

  const cleanupExpiredBoosters = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('booster-cleanup');

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Очистка завершена",
          description: `Сброшено истекших ускорителей: ${data.resetCount}`,
        });
        loadUsers(); // Reload users
      }
    } catch (error) {
      console.error('Error cleaning up boosters:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось очистить ускорители",
        variant: "destructive",
      });
    }
  };

  const unbanAllUsers = async () => {
    if (!confirm("Вы уверены, что хотите разбанить ВСЕХ пользователей?")) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ban: 0 } as any)
        .gt('ban' as any, 0);

      if (error) {
        throw error;
      }

      toast({
        title: "Все пользователи разбанены",
        description: "Все заблокированные пользователи были разбанены",
      });
      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error unbanning all users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось разбанить пользователей",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "dvertyty6278ggqhak" || passwordInput === "Gnomdoma04022012") {
      setIsAuthenticated(true);
      toast({
        title: "Вход выполнен",
        description: "Добро пожаловать в админ панель",
      });
    } else {
      toast({
        title: "Неверный пароль",
        description: "Попробуйте еще раз",
        variant: "destructive",
      });
      setPasswordInput("");
    }
  };

  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="card-glow p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              🔒 Админ панель
            </h1>
            <p className="text-muted-foreground">
              Введите пароль для доступа
            </p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Введите пароль"
                className="w-full"
                autoFocus
              />
            </div>
            <Button type="submit" className="button-gold w-full">
              Войти
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/menu")}
              className="button-outline-gold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад в меню
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8 pt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="button-outline-gold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
          className="button-outline-gold"
        >
          <Home className="w-4 h-4 mr-2" />
          Меню
        </Button>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🛠️ Админ панель
        </h1>
        <p className="text-muted-foreground">
          Управление пользователями и системой
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
        <Button
          onClick={loadUsers}
          disabled={loading}
          className="button-gold"
        >
          <Users className="w-4 h-4 mr-2" />
          {loading ? "Загрузка..." : `Загрузить пользователей (${profiles.length})`}
        </Button>
        
        <Button
          onClick={cleanupExpiredBoosters}
          className="button-gold"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Очистить ускорители
        </Button>
        
        <Button
          onClick={resetAllBoosters}
          variant="outline"
          className="button-outline-gold"
        >
          <Zap className="w-4 h-4 mr-2" />
          Сбросить все ускорители
        </Button>
        
        <Button
          onClick={unbanAllUsers}
          variant="outline"
          className="button-outline-gold"
        >
          <Users className="w-4 h-4 mr-2" />
          Разбанить всех
        </Button>
        
        <BanUserModal onUserBanned={loadUsers} />
        
        <UnbanUserModal onUserUnbanned={loadUsers} />
      </div>

      {/* Danger Zone */}
      <div className="max-w-2xl mx-auto mb-8">
        <Card className="p-6 border-red-500/20 bg-red-500/5">
          <h3 className="text-lg font-bold text-red-500 mb-4">⚠️ Опасная зона</h3>
          <Button
            onClick={deleteAllUsers}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Удалить всех пользователей
          </Button>
        </Card>
      </div>

      {/* User Update Form */}
      <Card className="card-glow p-6 mb-8 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-foreground mb-4">Обновить пользователя</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              ID пользователя
            </label>
            <Input
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              placeholder="Введите ID пользователя"
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Рост
              </label>
              <Input
                type="number"
                value={updateValues.grow}
                onChange={(e) => setUpdateValues(prev => ({ ...prev, grow: e.target.value }))}
                placeholder="Новое значение роста"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Косточки
              </label>
              <Input
                type="number"
                value={updateValues.bone}
                onChange={(e) => setUpdateValues(prev => ({ ...prev, bone: e.target.value }))}
                placeholder="Новое значение косточек"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                V-BDOG
              </label>
              <Input
                type="number"
                value={updateValues.v_bdog_earned}
                onChange={(e) => setUpdateValues(prev => ({ ...prev, v_bdog_earned: e.target.value }))}
                placeholder="Новое значение V-BDOG"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Множитель роста
              </label>
              <Input
                type="number"
                value={updateValues.grow1}
                onChange={(e) => setUpdateValues(prev => ({ ...prev, grow1: e.target.value }))}
                placeholder="Новый множитель"
              />
            </div>
          </div>
          
          <Button
            onClick={updateUser}
            className="button-gold w-full"
          >
            Обновить пользователя
          </Button>
        </div>
      </Card>

      {/* Users List */}
      {profiles.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-foreground mb-4 text-center">
            Все пользователи ({profiles.length})
          </h3>
          
          <div className="grid gap-4">
            {profiles.map((profile) => (
              <Card key={profile.id} className="card-glow p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                  <div>
                    <strong>ID:</strong><br/>
                    <span className="text-xs font-mono">{profile.id.substring(0, 8)}...</span>
                  </div>
                  <div>
                    <strong>Имя:</strong><br/>
                    {profile.reg || 'Anonymous'}
                  </div>
                  <div>
                    <strong>Рост:</strong><br/>
                    <span className="text-gold font-semibold">{profile.grow.toLocaleString()}</span>
                  </div>
                  <div>
                    <strong>Косточки:</strong><br/>
                    {profile.bone}
                  </div>
                  <div>
                    <strong>V-BDOG:</strong><br/>
                    <span className="text-gold">{profile.v_bdog_earned.toLocaleString()}</span>
                  </div>
                  <div>
                    <strong>Множитель:</strong><br/>
                    <span className={profile.grow1 > 1 ? "text-primary font-bold" : ""}>{profile.grow1}x</span>
                    {profile.booster_expires_at && new Date(profile.booster_expires_at) > new Date() && (
                      <div className="text-xs text-primary">Активен</div>
                    )}
                  </div>
                  <div>
                    <strong>Рефералы:</strong><br/>
                    {profile.referrals}
                  </div>
                  <div>
                    <strong>IP:</strong><br/>
                    <span className="text-xs">{profile.ip_address || 'N/A'}</span>
                  </div>
                  <div>
                    <strong>Создан:</strong><br/>
                    <span className="text-xs">{new Date(profile.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUserId(profile.id)}
                      className="text-xs"
                    >
                      Выбрать
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;