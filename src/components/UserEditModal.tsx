import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Ban, ShieldOff, Trash2, ShieldX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, Purchase } from "@/pages/Admin";
import { Skeleton } from "@/components/ui/skeleton";

interface UserEditModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const UserEditModal = ({ user, isOpen, onClose, onUpdate }: UserEditModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [editValues, setEditValues] = useState({
    grow: user.grow,
    bone: user.bone,
    v_bdog_earned: user.v_bdog_earned,
    bdog_balance: user.bdog_balance,
    grow1: user.grow1,
    keys: user.keys || 0,
  });

  useEffect(() => {
    if (isOpen) {
      loadPurchases();
    }
  }, [isOpen, user.user_id]);

  const loadPurchases = async () => {
    setLoadingPurchases(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.user_id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editValues)
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Данные пользователя обновлены",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!confirm(`Забанить пользователя ${user.nickname || user.bdog_id}?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ban: 1 })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "Забанен",
        description: "Пользователь успешно забанен",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось забанить пользователя",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ban: 0 })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "Разбанен",
        description: "Пользователь успешно разбанен",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось разбанить пользователя",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlacklist = async () => {
    if (!confirm(`Добавить пользователя ${user.nickname || user.bdog_id} в чёрный список? Он не сможет войти даже с VPN!`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ blacklisted: true, ban: 1 })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "В чёрном списке",
        description: "Пользователь добавлен в чёрный список",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error blacklisting user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить в чёрный список",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`УДАЛИТЬ пользователя ${user.nickname || user.bdog_id}? Это действие необратимо!`)) return;
    if (!confirm(`Вы уверены? Все данные пользователя будут удалены навсегда!`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Пользователь удалён из базы данных",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Управление пользователем: {user.nickname || user.bdog_id || user.reg}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="edit">Редактировать</TabsTrigger>
            <TabsTrigger value="purchases">Покупки</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">BDOG ID</Label>
                  <p className="font-semibold text-gold">{user.bdog_id || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Username</Label>
                  <p className="font-semibold">{user.nickname || user.reg || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-mono text-xs">{user.verification_email || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Верификация</Label>
                  <p>{user.verified ? "✅ Да" : "❌ Нет"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">V-BDOG</Label>
                  <p className="font-bold text-green-500">{user.v_bdog_earned?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">BDOG Balance</Label>
                  <p className="font-bold">{user.bdog_balance?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Grow</Label>
                  <p>{user.grow?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bone</Label>
                  <p>{user.bone?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Множитель</Label>
                  <p>x{user.grow1}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ключи</Label>
                  <p>{user.keys || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Рефералы</Label>
                  <p>{user.referrals || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Майнер</Label>
                  <p>{user.current_miner || "default"} (Ур. {user.miner_level || 1})</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">IP адрес</Label>
                  <p className="font-mono text-xs">{user.ip_address || "—"}</p>
                  {user.second_ip_address && (
                    <p className="font-mono text-xs text-muted-foreground">
                      Второй: {user.second_ip_address}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Кошелёк TON</Label>
                  <p className="font-mono text-xs break-all">
                    {user.wallet_address || "Нет кошелька"}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">User ID</Label>
                  <p className="font-mono text-xs break-all">{user.user_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Регистрация</Label>
                  <p className="text-xs">{new Date(user.created_at).toLocaleString('ru-RU')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Статус</Label>
                  <div className="space-y-1">
                    {user.ban === 1 && <p className="text-red-500 font-semibold">⛔ Забанен</p>}
                    {user.blacklisted && <p className="text-red-600 font-semibold">🚫 ЧС</p>}
                    {user.ban !== 1 && !user.blacklisted && <p className="text-green-500">✅ Активен</p>}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Grow</Label>
                <Input
                  type="number"
                  value={editValues.grow}
                  onChange={(e) => setEditValues(prev => ({ ...prev, grow: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Bone</Label>
                <Input
                  type="number"
                  value={editValues.bone}
                  onChange={(e) => setEditValues(prev => ({ ...prev, bone: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>V-BDOG</Label>
                <Input
                  type="number"
                  value={editValues.v_bdog_earned}
                  onChange={(e) => setEditValues(prev => ({ ...prev, v_bdog_earned: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>BDOG Balance</Label>
                <Input
                  type="number"
                  value={editValues.bdog_balance}
                  onChange={(e) => setEditValues(prev => ({ ...prev, bdog_balance: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Множитель (grow1)</Label>
                <Input
                  type="number"
                  value={editValues.grow1}
                  onChange={(e) => setEditValues(prev => ({ ...prev, grow1: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label>Ключи</Label>
                <Input
                  type="number"
                  value={editValues.keys}
                  onChange={(e) => setEditValues(prev => ({ ...prev, keys: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <Button onClick={handleUpdate} disabled={loading} className="w-full button-gold">
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </Button>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-sm mb-2">Действия</h3>
              
              {user.ban === 1 ? (
                <Button onClick={handleUnban} disabled={loading} variant="outline" className="w-full">
                  <ShieldOff className="w-4 h-4 mr-2" />
                  Разбанить пользователя
                </Button>
              ) : (
                <Button onClick={handleBan} disabled={loading} variant="destructive" className="w-full">
                  <Ban className="w-4 h-4 mr-2" />
                  Забанить пользователя
                </Button>
              )}

              <Button onClick={handleBlacklist} disabled={loading || user.blacklisted} variant="destructive" className="w-full">
                <ShieldX className="w-4 h-4 mr-2" />
                {user.blacklisted ? "Уже в ЧС" : "Добавить в ЧС"}
              </Button>

              <Button onClick={handleDelete} disabled={loading} variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить пользователя
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            {loadingPurchases ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : purchases.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Покупок пока нет</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {purchases.map((purchase) => (
                  <Card key={purchase.id} className="p-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <Label className="text-muted-foreground text-xs">Товар</Label>
                        <p className="font-semibold">{purchase.item_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Сумма</Label>
                        <p className="font-bold text-green-500">
                          {purchase.amount} {purchase.currency}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-muted-foreground text-xs">Дата и время</Label>
                        <p className="text-xs">
                          {new Date(purchase.purchased_at).toLocaleString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;