import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Home, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfileContext } from "@/components/ProfileProvider";
import UserEditModal from "@/components/UserEditModal";
import { Skeleton } from "@/components/ui/skeleton";

export interface UserProfile {
  user_id: string;
  bdog_id: string | null;
  nickname: string | null;
  reg: string | null;
  grow: number;
  bone: number;
  v_bdog_earned: number;
  bdog_balance: number;
  referrals: number;
  ip_address: string | null;
  second_ip_address: string | null;
  device_fingerprint: string | null;
  wallet_address: string | null;
  created_at: string;
  grow1: number;
  booster_expires_at: string | null;
  current_miner?: string;
  miner_active?: boolean;
  miner_level?: number;
  ban?: number;
  blacklisted?: boolean;
  keys?: number;
  verified?: boolean;
  verification_email?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  item_name: string;
  amount: number;
  currency: string;
  status: string;
  purchased_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfileContext();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if current user has admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!profile) {
        setLoading(true);
        return;
      }

      // Check if user has admin role using secure server-side function
      const { data: hasAdminRole, error } = await supabase.rpc('has_role', {
        _user_id: profile.user_id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось проверить права доступа",
          variant: "destructive",
        });
        navigate("/menu");
        return;
      }

      if (hasAdminRole) {
        await loadUsers();
      } else {
        toast({
          title: "Доступ запрещен",
          description: "У вас нет прав доступа к админ-панели",
          variant: "destructive",
        });
        navigate("/menu");
      }
    };

    checkAdminAccess();
  }, [profile, navigate]);

  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = profiles.filter(p => 
        (p.bdog_id && p.bdog_id.toLowerCase().includes(query)) ||
        (p.nickname && p.nickname.toLowerCase().includes(query)) ||
        (p.reg && p.reg.toLowerCase().includes(query)) ||
        (p.ip_address && p.ip_address.includes(query)) ||
        (p.second_ip_address && p.second_ip_address.includes(query)) ||
        (p.wallet_address && p.wallet_address.toLowerCase().includes(query)) ||
        (p.user_id && p.user_id.toLowerCase().includes(query))
      );
      setFilteredProfiles(filtered);
    }
  }, [profiles, searchQuery]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProfiles(data as unknown as UserProfile[] || []);
      setFilteredProfiles(data as unknown as UserProfile[] || []);
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

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-6 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/menu")}
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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          🛠️ Админ панель
        </h1>
        <p className="text-sm text-muted-foreground">
          Всего: <span className="text-gold font-semibold">{profiles.length}</span>
          {searchQuery && <> | Найдено: <span className="text-gold">{filteredProfiles.length}</span></>}
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по BDOG ID, Username, IP, кошельку..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-2">
          {filteredProfiles.map((user) => (
            <Card
              key={user.user_id}
              className="p-3 cursor-pointer hover:bg-surface/50 transition-colors"
              onClick={() => handleUserClick(user)}
            >
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">BDOG ID</p>
                  <p className="font-semibold text-gold">{user.bdog_id || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Username</p>
                  <p className="font-semibold">{user.nickname || user.reg || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">V-BDOG</p>
                  <p className="font-semibold text-green-500">{user.v_bdog_earned?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Кошелёк</p>
                  <p className="font-mono text-xs truncate">
                    {user.wallet_address ? `${user.wallet_address.slice(0, 6)}...` : "Нет кошелька"}
                  </p>
                </div>
              </div>
              {user.ban === 1 && (
                <div className="mt-2 text-xs text-red-500 font-semibold">⛔ Забанен</div>
              )}
              {user.blacklisted && (
                <div className="mt-2 text-xs text-red-600 font-semibold">🚫 Чёрный список</div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* User Edit Modal */}
      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onUpdate={loadUsers}
        />
      )}
    </div>
  );
};

export default Admin;