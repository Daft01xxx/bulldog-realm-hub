import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Pickaxe, Star, TrendingUp } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useBdogTonWallet } from "@/hooks/useTonWallet";
import { toast } from "@/hooks/use-toast";

import FloatingCosmicCoins from "@/components/FloatingCosmicCoins";
import MinerTimer from '@/components/MinerTimer';
import ClaimMinerRewards from '@/components/ClaimMinerRewards';
import StartMinerButton from '@/components/StartMinerButton';
import ActivateMinerButton from '@/components/ActivateMinerButton';
import AutoMinerRewards from '@/components/AutoMinerRewards';
import bdogLogoTransparent from "@/assets/bulldog-logo-transparent.png";

// Import miner images
import defaultMinerImage from '@/assets/default-miner.png';
import plusMinerImage from '@/assets/plus-miner.png';
import silverMinerImage from '@/assets/silver-miner.png';
import goldMinerImage from '@/assets/gold-miner.png';
import diamondMinerImage from '@/assets/diamond-miner.png';
import premiumMinerImage from '@/assets/premium-miner.png';

interface MinerType {
  id: string;
  name: string;
  price: string;
  income: number;
  description: string;
  image?: string;
}

const minerTypes: MinerType[] = [
  { id: 'default', name: 'DEFOLT', price: '0', income: 100, description: 'Бесплатный майнер для всех', image: defaultMinerImage },
  { id: 'plus', name: 'PLUS', price: '1', income: 500, description: 'Улучшенная производительность', image: plusMinerImage },
  { id: 'silver', name: 'SILVER', price: '3', income: 1400, description: 'Серебряный уровень майнинга', image: silverMinerImage },
  { id: 'gold', name: 'GOLD', price: '6', income: 2500, description: 'Золотой стандарт майнинга', image: goldMinerImage },
  { id: 'diamond', name: 'DIAMOND', price: '15', income: 6000, description: 'Алмазная мощность', image: diamondMinerImage },
  { id: 'premium', name: 'PREMIUM', price: '35', income: 10000, description: 'Максимальная производительность', image: premiumMinerImage }
];

const Miner = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { isConnected, walletData, sendTransaction } = useBdogTonWallet();
  const [currentMiner, setCurrentMiner] = useState('default');
  const [minerLevel, setMinerLevel] = useState(1);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      setCurrentMiner((profile as any).current_miner || 'default');
      setMinerLevel((profile as any).miner_level || 1);
    } else {
      setCurrentMiner(localStorage.getItem("bdog-current-miner") || 'default');
      setMinerLevel(parseInt(localStorage.getItem("bdog-miner-level") || "1"));
    }
  }, [profile]);

  const getCurrentMinerData = () => {
    return minerTypes.find(m => m.id === currentMiner) || minerTypes[0];
  };

  const getCurrentIncome = () => {
    const baseMiner = getCurrentMinerData();
    return Math.floor(baseMiner.income * Math.pow(1.2, minerLevel - 1));
  };

  const getAvailableMiners = () => {
    const currentMinerIndex = minerTypes.findIndex(m => m.id === currentMiner);
    return minerTypes.filter((_, index) => index > currentMinerIndex);
  };

  const handlePurchaseMiner = async (miner: MinerType) => {
    if (!isConnected) {
      toast({
        title: "Кошелек не подключен",
        description: "Подключите кошелек для покупки майнера",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const price = parseFloat(miner.price);
      const networkFee = 0.1;
      const totalRequired = price + networkFee;

      const availableBalance = parseFloat(walletData?.tonBalance || "0");
      if (availableBalance < totalRequired) {
        toast({
          title: "Недостаточно TON",
          description: `Нужно ${totalRequired.toFixed(2)} TON (${miner.price} + 0.1 комиссия)`,
          variant: "destructive",
        });
        return;
      }

      const merchantWallet = "UQBN-LD_8VQJFG_Y2F3TEKcZDwBjQ9uCMlU7EwOA8beQ_gX7";
      const comment = `BDOG: Майнер ${miner.name}`;
      
      const result = await sendTransaction(merchantWallet, miner.price, comment);
      
      if (result) {
        const updateData = {
          current_miner: miner.id,
          miner_level: 1,
          miner_active: false // Miner purchased but not started yet
        };

        if (profile) {
          await updateProfile(updateData as any);
        } else {
          localStorage.setItem("bdog-current-miner", miner.id);
          localStorage.setItem("bdog-miner-level", "1");
        }

        setCurrentMiner(miner.id);
        setMinerLevel(1);

        toast({
          title: "Майнер успешно куплен!",
          description: `Майнер ${miner.name} активирован. Теперь запустите его для получения дохода.`,
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

  const handleUpgradeMiner = async () => {
    if (minerLevel >= 5) {
      toast({
        title: "Максимальный уровень",
        description: "Майнер уже достиг максимального уровня",
        variant: "destructive",
      });
      return;
    }

    const upgradeCost = 30000;
    const currentVBdog = profile?.v_bdog_earned || 0;

    if (currentVBdog < upgradeCost) {
      toast({
        title: "Недостаточно V-BDOG",
        description: `Нужно ${upgradeCost.toLocaleString()} V-BDOG для улучшения`,
        variant: "destructive",
      });
      return;
    }

    setIsUpgrading(true);
    try {
      const updateData = {
        v_bdog_earned: currentVBdog - upgradeCost,
        miner_level: minerLevel + 1
      };

      if (profile) {
        await updateProfile(updateData as any);
      } else {
        localStorage.setItem("bdog-miner-level", (minerLevel + 1).toString());
      }

      setMinerLevel(minerLevel + 1);
      setShowUpgradeDialog(false);

      toast({
        title: "Майнер улучшен!",
        description: `Уровень ${minerLevel + 1}. Новый доход: ${getCurrentIncome()} V-BDOG/час`,
      });
    } catch (error) {
      console.error('Upgrade failed:', error);
      toast({
        title: "Ошибка улучшения",
        description: "Не удалось улучшить майнер",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
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

        {/* Current Miner Display */}
        <Card className="card-glow p-6 mb-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-primary/20 flex items-center justify-center border-2 border-gold/30 overflow-hidden">
                <img src={getCurrentMinerData().image} alt={getCurrentMinerData().name} className="w-20 h-20 object-cover rounded-full" />
              </div>
              <div className="absolute -top-2 -right-2 bg-gold text-black text-xs font-bold px-2 py-1 rounded-full">
                LVL {minerLevel}
              </div>
            </div>
            <h2 className="text-xl font-bold text-gold mb-2">
              Майнер {getCurrentMinerData().name}
            </h2>
            <p className="text-2xl font-bold text-gradient mb-2">
              {getCurrentIncome()} V-BDOG/час
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {getCurrentMinerData().description}
            </p>
            
            {/* Miner Timer - показываем всегда */}
            <div className="mb-4">
              <MinerTimer />
            </div>
            
            {/* Activate/Start Miner Button - показываем если майнер не активен */}
            {!(profile as any)?.miner_active && (
              <div className="mb-4">
                {currentMiner !== 'default' ? <StartMinerButton /> : <ActivateMinerButton />}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 justify-center">
            {/* Claim rewards only if miner is active */}
            {(profile as any)?.miner_active && <ClaimMinerRewards />}
            
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className={`border-gold/20 text-gold hover:bg-gold/10 ${
                    minerLevel >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={minerLevel >= 5}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Прокачать майнер
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-gold">Улучшение майнера</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-lg mb-2">Текущий уровень: <span className="text-gold font-bold">{minerLevel}</span></p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Доход после улучшения: <span className="text-gold">{Math.floor(getCurrentIncome() * 1.2)} V-BDOG/час</span>
                    </p>
                    <div className="p-4 bg-gold/10 rounded-lg border border-gold/20 mb-4">
                      <p className="text-center">
                        <span className="text-lg font-bold text-gold">30,000 V-BDOG</span>
                      </p>
                      <p className="text-sm text-muted-foreground">Стоимость улучшения</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowUpgradeDialog(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      className="flex-1 button-gradient-gold"
                      onClick={handleUpgradeMiner}
                      disabled={isUpgrading || (profile?.v_bdog_earned || 0) < 30000}
                    >
                      {isUpgrading ? "Улучшение..." : "Улучшить"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Available Miners */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gradient text-center mb-4">
            Доступные майнеры
          </h2>
          
          {getAvailableMiners().map((miner) => (
            <Card key={miner.id} className="card-glow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-primary/20 flex items-center justify-center border-2 border-gold/30 overflow-hidden">
                      <img src={miner.image} alt={miner.name} className="w-14 h-14 object-cover rounded-full" />
                    </div>
                  </div>
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
                    {miner.price} TON
                  </p>
                  <Button
                    onClick={() => handlePurchaseMiner(miner)}
                    className="button-gradient-gold"
                    disabled={isPurchasing || !isConnected}
                  >
                    {isPurchasing ? "Покупка..." : "Купить"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!isConnected && (
          <Card className="card-glow p-6 mt-6 text-center bg-gold/5 border-gold/20">
            <Star className="w-12 h-12 text-gold mx-auto mb-4" />
            <p className="text-gold font-semibold mb-2">Подключите кошелек</p>
            <p className="text-sm text-muted-foreground">
              Для покупки майнеров необходимо подключить TON кошелек
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Miner;