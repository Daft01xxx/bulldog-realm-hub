import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Home, Trash2, RefreshCw, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BanUserModal from "@/components/BanUserModal";
import UnbanUserModal from "@/components/UnbanUserModal";

interface UserProfile {
  user_id: string;
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
  current_miner?: string;
  miner_active?: boolean;
  miner_level?: number;
  ban?: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [updateValues, setUpdateValues] = useState({
    grow: "",
    bone: "",
    v_bdog_earned: "",
    grow1: ""
  });
  const [activatingMiner, setActivatingMiner] = useState<string | null>(null);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = profiles.filter(profile => 
        (profile.reg && profile.reg.toLowerCase().includes(query)) ||
        (profile.ip_address && profile.ip_address.includes(query)) ||
        (profile.user_id && profile.user_id.toLowerCase().includes(query))
      );
      setFilteredProfiles(filtered);
    }
  }, [profiles, searchQuery]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Gnomdoma04022012") {
      setIsAuthenticated(true);
      toast({
        title: "Доступ разрешен",
        description: "Добро пожаловать в админ панель",
      });
    } else {
      toast({
        title: "Неверный пароль",
        description: "Попробуйте еще раз",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-foreground">🔒 Админ панель</h1>
            <p className="text-muted-foreground">Введите пароль для доступа</p>
          </CardHeader>
          <div className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <Button type="submit" className="w-full">
                Войти
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

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
        setFilteredProfiles(data.profiles || []);
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
        setFilteredProfiles([]);
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

  const activateDefaultMiner = async (userId: string) => {
    setActivatingMiner(userId);
    try {
      const { data, error } = await supabase.functions.invoke('activate-default-miner', {
        body: { userId }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Майнер активирован",
          description: `Дефолтный майнер активирован. Начислено ${data.data.initialReward} V-BDOG`,
        });
        loadUsers(); // Reload users
      }
    } catch (error) {
      console.error('Error activating miner:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось активировать майнер",
        variant: "destructive",
      });
    } finally {
      setActivatingMiner(null);
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
        <div className="mt-4 text-sm text-muted-foreground">
          Всего пользователей: <span className="text-gold font-semibold">{profiles.length}</span>
          {searchQuery && (
            <> | Найдено: <span className="text-gold font-semibold">{filteredProfiles.length}</span></>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-6">
        <Input
          placeholder="Поиск по имени, IP или ID пользователя..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
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
      {filteredProfiles.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-foreground mb-4 text-center">
            {searchQuery ? `Результаты поиска (${filteredProfiles.length})` : `Все пользователи (${filteredProfiles.length})`}
          </h3>
          
          <div className="grid gap-4">
            {filteredProfiles.map((profile) => {
              const hasDefaultInactiveMiner = profile.current_miner === 'default' && !profile.miner_active;
              
              return (
                <Card key={profile.user_id} className="card-glow p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>ID:</strong><br/>
                      <span className="text-xs font-mono">{profile.user_id.substring(0, 8)}...</span>
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
                      <strong>Майнер:</strong><br/>
                      <span className="text-xs">
                        {profile.current_miner || 'Нет'} 
                        {profile.miner_active ? ' (Активен)' : ' (Неактивен)'}
                      </span>
                    </div>
                    <div>
                      <strong>Создан:</strong><br/>
                      <span className="text-xs">{new Date(profile.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUserId(profile.user_id)}
                        className="text-xs"
                      >
                        Выбрать
                      </Button>
                      {hasDefaultInactiveMiner && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => activateDefaultMiner(profile.user_id)}
                          disabled={activatingMiner === profile.user_id}
                          className="text-xs bg-green-600 hover:bg-green-700"
                        >
                          {activatingMiner === profile.user_id ? (
                            <>
                              <Zap className="w-3 h-3 mr-1 animate-pulse" />
                              Активирую...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 mr-1" />
                              Активировать
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    {profile.ban === 1 && (
                      <div className="col-span-2">
                        <span className="text-red-500 font-bold text-xs">ЗАБЛОКИРОВАН</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;