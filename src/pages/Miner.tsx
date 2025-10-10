import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Wallet, ShoppingCart, Grid3x3, PackageOpen } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import FloatingCosmicCoins from "@/components/FloatingCosmicCoins";
import AutoMinerRewards from '@/components/AutoMinerRewards';

// Import miner images
import defaultMinerImage from '@/assets/default-miner.png';
import plusMinerImage from '@/assets/plus-miner.png';
import silverMinerImage from '@/assets/silver-miner.png';
import goldMinerImage from '@/assets/gold-miner.png';
import diamondMinerImage from '@/assets/diamond-miner.png';
import premiumMinerImage from '@/assets/premium-miner.png';
import homemadeMinerImage from '@/assets/homemade-miner.png';
import oldMinerImage from '@/assets/old-miner.png';

interface MinerType {
  id: string;
  name: string;
  price: number;
  priceType: 'V-BDOG' | 'TON';
  income: number;
  description: string;
  image: string;
  category: 'regular' | 'powerful' | 'limited';
}

interface UserMiner {
  id: string;
  miner_id: string;
  miner_name: string;
  purchase_price: number;
  hourly_income: number;
  is_on_grid: boolean;
  grid_position: number | null;
}

const minerTypes: MinerType[] = [
  { id: 'homemade', name: 'Самодельный', price: 100000, priceType: 'V-BDOG', income: 100, description: 'Простой самодельный майнер', image: homemadeMinerImage, category: 'regular' },
  { id: 'old', name: 'Старый', price: 200000, priceType: 'V-BDOG', income: 200, description: 'Старый но надежный', image: oldMinerImage, category: 'regular' },
  { id: 'default', name: 'DEFOLT', price: 0, priceType: 'TON', income: 100, description: 'Бесплатный майнер', image: defaultMinerImage, category: 'powerful' },
  { id: 'plus', name: 'PLUS', price: 1, priceType: 'TON', income: 500, description: 'Улучшенная производительность', image: plusMinerImage, category: 'powerful' },
  { id: 'silver', name: 'SILVER', price: 3, priceType: 'TON', income: 1400, description: 'Серебряный уровень', image: silverMinerImage, category: 'powerful' },
  { id: 'gold', name: 'GOLD', price: 6, priceType: 'TON', income: 2500, description: 'Золотой стандарт', image: goldMinerImage, category: 'powerful' },
  { id: 'diamond', name: 'DIAMOND', price: 15, priceType: 'TON', income: 6000, description: 'Алмазная мощность', image: diamondMinerImage, category: 'powerful' },
  { id: 'premium', name: 'PREMIUM', price: 35, priceType: 'TON', income: 10000, description: 'Максимальная производительность', image: premiumMinerImage, category: 'powerful' }
];

const Miner = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { isConnected, walletData, sendTransaction } = useBdogTonWallet();
  const [activeTab, setActiveTab] = useState('regular');
  const [userMiners, setUserMiners] = useState<UserMiner[]>([]);
  const [gridMiners, setGridMiners] = useState<(UserMiner | null)[]>([null, null, null]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedMiner, setSelectedMiner] = useState<UserMiner | null>(null);
  const [showMinerDialog, setShowMinerDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      loadUserMiners();
    }
  }, [profile]);

  const loadUserMiners = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('user_miners')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      setUserMiners(data || []);

      // Load grid miners
      const onGridMiners = (data || []).filter(m => m.is_on_grid).sort((a, b) => (a.grid_position || 0) - (b.grid_position || 0));
      const newGrid: (UserMiner | null)[] = [null, null, null];
      onGridMiners.forEach(miner => {
        if (miner.grid_position && miner.grid_position >= 1 && miner.grid_position <= 3) {
          newGrid[miner.grid_position - 1] = miner;
        }
      });
      setGridMiners(newGrid);
    } catch (error) {
      console.error('Failed to load miners:', error);
    }
  };

  const getTotalHourlyIncome = () => {
    return gridMiners.reduce((total, miner) => {
      return total + (miner?.hourly_income || 0);
    }, 0);
  };

  const handlePurchaseMiner = async (miner: MinerType) => {
    if (!profile) {
      toast({
        title: "Ошибка",
        description: "Профиль не загружен",
        variant: "destructive",
      });
      return;
    }

    if (miner.priceType === 'TON' && !isConnected) {
      toast({
        title: "Кошелек не подключен",
        description: "Подключите кошелек для покупки",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);
    try {
      let success = false;

      if (miner.priceType === 'V-BDOG') {
        const currentBalance = profile.v_bdog_earned || 0;
        if (currentBalance < miner.price) {
          toast({
            title: "Недостаточно средств",
            description: `Нужно ${miner.price.toLocaleString()} V-BDOG`,
            variant: "destructive",
          });
          setIsPurchasing(false);
          return;
        }

        await updateProfile({
          v_bdog_earned: currentBalance - miner.price
        });
        success = true;
      } else {
        const availableBalance = parseFloat(walletData?.tonBalance || "0");
        if (availableBalance < miner.price) {
          toast({
            title: "Недостаточно TON",
            description: `Нужно ${miner.price} TON`,
            variant: "destructive",
          });
          setIsPurchasing(false);
          return;
        }

        const merchantWallet = "UQBN-LD_8VQJFG_Y2F3TEKcZDwBjQ9uCMlU7EwOA8beQ_gX7";
        const comment = `BDOG: Майнер ${miner.name}`;
        const result = await sendTransaction(merchantWallet, miner.price.toString(), comment);
        success = !!result;
      }

      if (success) {
        // Add miner to user's inventory
        const { error } = await supabase
          .from('user_miners')
          .insert({
            user_id: profile.user_id,
            miner_id: miner.id,
            miner_name: miner.name,
            purchase_price: miner.price,
            hourly_income: miner.income,
            miner_category: miner.category,
            is_on_grid: false,
            grid_position: null
          });

        if (error) throw error;

        await loadUserMiners();

        toast({
          title: "Майнер куплен!",
          description: `${miner.name} добавлен в ваши майнеры`,
        });
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Ошибка покупки",
        description: "Не удалось купить майнер",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handlePlaceOnGrid = async (miner: UserMiner, position: number) => {
    if (!profile) return;

    try {
      // Check if position is occupied
      if (gridMiners[position - 1]) {
        toast({
          title: "Место занято",
          description: "Сначала снимите майнер с этой позиции",
          variant: "destructive",
        });
        return;
      }

      // Update miner in database
      const { error } = await supabase
        .from('user_miners')
        .update({
          is_on_grid: true,
          grid_position: position
        })
        .eq('id', miner.id);

      if (error) throw error;

      await loadUserMiners();
      setShowMinerDialog(false);

      toast({
        title: "Майнер установлен",
        description: `${miner.miner_name} начинает приносить доход`,
      });
    } catch (error) {
      console.error('Failed to place miner:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось установить майнер",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromGrid = async (miner: UserMiner) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('user_miners')
        .update({
          is_on_grid: false,
          grid_position: null
        })
        .eq('id', miner.id);

      if (error) throw error;

      await loadUserMiners();

      toast({
        title: "Майнер снят",
        description: `${miner.miner_name} убран с сетки`,
      });
    } catch (error) {
      console.error('Failed to remove miner:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось снять майнер",
        variant: "destructive",
      });
    }
  };

  const handleSellMiner = async (miner: UserMiner) => {
    if (!profile) return;

    const sellPrice = Math.floor(miner.purchase_price * 0.5);

    try {
      // Remove miner from database
      const { error: deleteError } = await supabase
        .from('user_miners')
        .delete()
        .eq('id', miner.id);

      if (deleteError) throw deleteError;

      // Add V-BDOG to user's balance
      await updateProfile({
        v_bdog_earned: (profile.v_bdog_earned || 0) + sellPrice
      });

      await loadUserMiners();
      setShowMinerDialog(false);

      toast({
        title: "Майнер продан",
        description: `Получено ${sellPrice.toLocaleString()} V-BDOG`,
      });
    } catch (error) {
      console.error('Failed to sell miner:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось продать майнер",
        variant: "destructive",
      });
    }
  };

  const getAvailableGridPosition = () => {
    for (let i = 0; i < 3; i++) {
      if (!gridMiners[i]) return i + 1;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingCosmicCoins />
      <AutoMinerRewards />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gold hover:bg-gold/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Майнеры BDOG</h1>
            <p className="text-muted-foreground">Автоматическое получение V-BDOG</p>
          </div>
        </div>

        {/* Grid Display */}
        <Card className="card-glow p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gold mb-2">Сетка майнинга</h2>
            <p className="text-sm text-muted-foreground mb-1">
              Прибыль в час: <span className="text-gold font-bold">{getTotalHourlyIncome().toLocaleString()} V-BDOG</span>
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {gridMiners.map((miner, index) => (
              <div
                key={index}
                className={`aspect-square rounded-lg border-2 border-dashed ${
                  miner ? 'border-gold/50 bg-gold/5' : 'border-muted'
                } flex flex-col items-center justify-center cursor-pointer hover:border-gold/70 transition-colors`}
                onClick={() => miner && handleRemoveFromGrid(miner)}
              >
                {miner ? (
                  <>
                    <img src={minerTypes.find(m => m.id === miner.miner_id)?.image} alt={miner.miner_name} className="w-16 h-16 object-contain mb-2" />
                    <p className="text-xs text-gold font-bold">{miner.miner_name}</p>
                    <p className="text-xs text-muted-foreground">{miner.hourly_income}/час</p>
                  </>
                ) : (
                  <Grid3x3 className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="regular">Обычные</TabsTrigger>
            <TabsTrigger value="powerful">Мощные</TabsTrigger>
            <TabsTrigger value="limited">Лимитированные</TabsTrigger>
            <TabsTrigger value="my-miners">Мои майнеры</TabsTrigger>
          </TabsList>

          <TabsContent value="regular">
            <div className="space-y-4">
              {minerTypes.filter(m => m.category === 'regular').map((miner) => (
                <Card key={miner.id} className="card-glow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={miner.image} alt={miner.name} className="w-16 h-16 object-contain" />
                      <div>
                        <h3 className="text-lg font-bold text-gold">{miner.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1">{miner.description}</p>
                        <p className="text-lg font-bold text-gradient">
                          {miner.income.toLocaleString()} V-BDOG/час
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-gold mb-2">
                        {miner.price.toLocaleString()} {miner.priceType}
                      </p>
                      <Button
                        onClick={() => handlePurchaseMiner(miner)}
                        className="button-gradient-gold"
                        disabled={isPurchasing}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Купить
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="powerful">
            <div className="space-y-4">
              {minerTypes.filter(m => m.category === 'powerful').map((miner) => (
                <Card key={miner.id} className="card-glow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={miner.image} alt={miner.name} className="w-16 h-16 object-contain" />
                      <div>
                        <h3 className="text-lg font-bold text-gold">{miner.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1">{miner.description}</p>
                        <p className="text-lg font-bold text-gradient">
                          {miner.income.toLocaleString()} V-BDOG/час
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-gold mb-2">
                        {miner.price === 0 ? 'Бесплатно' : `${miner.price} ${miner.priceType}`}
                      </p>
                      <Button
                        onClick={() => handlePurchaseMiner(miner)}
                        className="button-gradient-gold"
                        disabled={isPurchasing || (miner.priceType === 'TON' && !isConnected)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Купить
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {!isConnected && (
                <Card className="card-glow p-6 text-center bg-gold/5 border-gold/20">
                  <Wallet className="w-12 h-12 text-gold mx-auto mb-4" />
                  <p className="text-gold font-semibold mb-2">Подключите кошелек</p>
                  <p className="text-sm text-muted-foreground">
                    Для покупки мощных майнеров необходим TON кошелек
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="limited">
            <Card className="card-glow p-12 text-center">
              <PackageOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Лимитированные майнеры скоро появятся</p>
            </Card>
          </TabsContent>

          <TabsContent value="my-miners">
            <div className="space-y-4">
              {userMiners.length === 0 ? (
                <Card className="card-glow p-12 text-center">
                  <PackageOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">У вас пока нет майнеров</p>
                </Card>
              ) : (
                userMiners.map((miner) => (
                  <Card 
                    key={miner.id} 
                    className="card-glow p-6 cursor-pointer hover:border-gold/50 transition-colors"
                    onClick={() => {
                      setSelectedMiner(miner);
                      setShowMinerDialog(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img 
                          src={minerTypes.find(m => m.id === miner.miner_id)?.image} 
                          alt={miner.miner_name} 
                          className="w-16 h-16 object-contain" 
                        />
                        <div>
                          <h3 className="text-lg font-bold text-gold">{miner.miner_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Прибыль: {miner.hourly_income.toLocaleString()} V-BDOG/час
                          </p>
                          {miner.is_on_grid && (
                            <p className="text-xs text-gold">На сетке (Позиция {miner.grid_position})</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Miner Action Dialog */}
      <Dialog open={showMinerDialog} onOpenChange={setShowMinerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-gold">{selectedMiner?.miner_name}</DialogTitle>
          </DialogHeader>
          {selectedMiner && (
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={minerTypes.find(m => m.id === selectedMiner.miner_id)?.image} 
                  alt={selectedMiner.miner_name} 
                  className="w-24 h-24 mx-auto object-contain mb-4" 
                />
                <p className="text-sm text-muted-foreground mb-2">
                  Доход: <span className="text-gold">{selectedMiner.hourly_income.toLocaleString()} V-BDOG/час</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Цена продажи: <span className="text-gold">{Math.floor(selectedMiner.purchase_price * 0.5).toLocaleString()} V-BDOG</span>
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                {selectedMiner.is_on_grid ? (
                  <Button
                    onClick={() => handleRemoveFromGrid(selectedMiner)}
                    variant="outline"
                    className="w-full"
                  >
                    Снять с сетки
                  </Button>
                ) : (
                  <>
                    {[1, 2, 3].map(pos => (
                      <Button
                        key={pos}
                        onClick={() => handlePlaceOnGrid(selectedMiner, pos)}
                        disabled={!!gridMiners[pos - 1]}
                        className="w-full button-gradient-gold"
                      >
                        Поставить на позицию {pos} {gridMiners[pos - 1] && '(Занято)'}
                      </Button>
                    ))}
                  </>
                )}
                
                <Button
                  onClick={() => handleSellMiner(selectedMiner)}
                  variant="destructive"
                  className="w-full"
                >
                  Продать за {Math.floor(selectedMiner.purchase_price * 0.5).toLocaleString()} V-BDOG
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Miner;
