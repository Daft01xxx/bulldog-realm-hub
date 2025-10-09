import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import TopNavigation from '@/components/TopNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import FloatingCosmicCoins from '@/components/FloatingCosmicCoins';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardUser {
  bdog_id: string;
  nickname: string;
  v_bdog_earned: number;
}

const Leaderboard = () => {
  const { t } = useLanguage();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('bdog_id, nickname, v_bdog_earned')
        .order('v_bdog_earned', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        setTopUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background px-2 py-4 relative overflow-hidden">
      <FloatingCosmicCoins />
      <TopNavigation />

      <div className="pt-16 pb-20 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Топ по балансу
          </h1>
          <p className="text-muted-foreground">
            Топ 100 пользователей по V-BDOG
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-12 w-full" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {topUsers.map((user, index) => (
              <Card
                key={user.bdog_id}
                className={`p-4 hover-lift transition-all ${
                  index < 3 ? 'border-gold/50 shadow-gold/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface/50 border border-border/30">
                      {getMedalIcon(index + 1) || (
                        <span className="text-sm font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {user.nickname || 'Аноним'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        ID: {user.bdog_id || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right ml-2">
                    <p className="text-lg font-bold text-gradient">
                      {(user.v_bdog_earned || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">V-BDOG</p>
                  </div>
                </div>
              </Card>
            ))}

            {topUsers.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Нет данных для отображения
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
