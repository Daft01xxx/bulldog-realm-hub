import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MinerDebug: React.FC = () => {
  const { profile, reloadProfile } = useProfile();

  if (!profile) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Статус профиля</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Badge variant="destructive">Профиль не загружен</Badge>
          <Button onClick={reloadProfile} className="mt-4" size="sm">
            Обновить профиль
          </Button>
        </CardContent>
      </Card>
    );
  }

  const lastRewardTime = profile.last_miner_reward_at 
    ? new Date(profile.last_miner_reward_at).toLocaleString('ru-RU')
    : 'Никогда';

  const nextRewardTime = profile.last_miner_reward_at
    ? new Date(new Date(profile.last_miner_reward_at).getTime() + 60 * 60 * 1000).toLocaleString('ru-RU')
    : 'Сейчас';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Статус майнера</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Тип майнера</div>
            <Badge variant="outline">{profile.current_miner || 'default'}</Badge>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Уровень</div>
            <Badge variant="outline">{profile.miner_level || 1}</Badge>
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">V-BDOG заработано</div>
          <div className="text-lg font-bold">{(profile.v_bdog_earned || 0).toLocaleString()}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Последняя награда</div>
          <div className="text-sm">{lastRewardTime}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Следующая награда</div>
          <div className="text-sm">{nextRewardTime}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">User ID</div>
          <div className="text-xs font-mono break-all">{profile.user_id}</div>
        </div>

        <Button onClick={reloadProfile} className="w-full" size="sm">
          Обновить данные
        </Button>
      </CardContent>
    </Card>
  );
};

export default MinerDebug;