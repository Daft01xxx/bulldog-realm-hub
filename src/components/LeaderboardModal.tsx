import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LeaderboardUser {
  bdog_id: string;
  nickname: string;
  v_bdog_earned: number;
}

interface LeaderboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeaderboardModal = ({ open, onOpenChange }: LeaderboardModalProps) => {
  const { t } = useLanguage();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchTopUsers();
    }
  }, [open]);

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
    if (position === 1) return <Trophy className="w-3 h-3 text-yellow-500" />;
    if (position === 2) return <Medal className="w-3 h-3 text-gray-400" />;
    if (position === 3) return <Medal className="w-3 h-3 text-amber-600" />;
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient text-center">
            Топ по балансу
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="space-y-1">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="p-2 border rounded-lg border-border/30 bg-card">
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {topUsers.map((user, index) => (
                <div
                  key={user.bdog_id}
                  className={`p-2 rounded-lg border transition-all ${
                    index < 3 ? 'border-gold/50 bg-gold/5' : 'border-border/30 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface/50 border border-border/30 flex-shrink-0">
                        {getMedalIcon(index + 1) || (
                          <span className="text-xs font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate text-xs">
                          {user.nickname || 'Аноним'}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          ID: {user.bdog_id || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gradient">
                        {(user.v_bdog_earned || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">V-BDOG</p>
                    </div>
                  </div>
                </div>
              ))}

              {topUsers.length === 0 && (
                <div className="p-6 text-center border rounded-lg border-border/30 bg-card">
                  <p className="text-muted-foreground text-sm">
                    Нет данных для отображения
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardModal;
