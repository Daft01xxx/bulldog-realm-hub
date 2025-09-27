import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send, Wallet } from 'lucide-react';
import { useBdogTonWallet } from '@/hooks/useTonWallet';
import { useToast } from '@/hooks/use-toast';

export default function BdogPay() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isConnected, 
    walletData, 
    loading, 
    connectWallet, 
    sendTransaction,
    calculateTransactionFee
  } = useBdogTonWallet();
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ton' | 'bdog'>('ton');

  const handleSendTransaction = async (currency: 'ton' | 'bdog') => {
    if (!recipientAddress || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Ошибка валидации",
        description: "Проверьте адрес и сумму",
        variant: "destructive",
      });
      return;
    }

    const availableBalance = currency === 'ton' 
      ? parseFloat(walletData?.tonBalance || "0")
      : parseFloat(walletData?.bdogBalance || "0");
    const sendAmount = parseFloat(amount);
    const feeAmount = calculateTransactionFee(amount, currency);
    const totalRequired = currency === 'ton' ? sendAmount + feeAmount : feeAmount;

    if (currency === 'ton' && availableBalance < totalRequired) {
      toast({
        title: "Недостаточно TON",
        description: `Нужно ${totalRequired.toFixed(2)} TON (${sendAmount} + ${feeAmount} комиссия)`,
        variant: "destructive",
      });
      return;
    } else if (currency === 'bdog' && (sendAmount > parseFloat(walletData?.bdogBalance || "0") || availableBalance < feeAmount)) {
      toast({
        title: "Недостаточно средств",
        description: `Нужно ${sendAmount} BDOG и ${feeAmount} TON для комиссии`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    let result;
    if (currency === 'ton') {
      result = await sendTransaction(recipientAddress, amount, comment || undefined, 'ton');
    } else {
      result = await sendTransaction(recipientAddress, amount, comment || undefined, 'bdog');
    }
    
    if (result) {
      // Clear form on success
      setRecipientAddress('');
      setAmount('');
      setComment('');
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="button-outline-gold"
          >
            <ArrowLeft className="w-4 h-4 text-gold" />
            Назад
          </Button>
          <h1 className="text-xl font-bold text-center text-gold">BDOG PAY</h1>
        </div>

        {/* Main Content */}
        {!isConnected ? (
          <Card className="card-glow p-8 text-center">
            <Wallet className="w-16 h-16 text-gold mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gradient mb-4">
              Подключите кошелек
            </h2>
            <p className="text-muted-foreground mb-6">
              Для отправки TON транзакций необходимо подключить кошелек
            </p>
            <Button 
              onClick={connectWallet}
              className="button-gold w-full"
              disabled={loading}
            >
              {loading ? "Загрузка..." : "Подключить кошелек"}
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Wallet Balance */}
            <Card className="card-glow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gold">Ваш баланс</h3>
                <Wallet className="w-5 h-5 text-gold" />
              </div>
              <div className="space-y-2">
                <div className="text-xl font-bold text-gradient">
                  {walletData?.tonBalance || "0"} TON
                </div>
                <div className="text-xl font-bold text-gradient">
                  {walletData?.bdogBalance || "0"} BDOG
                </div>
                <div className="text-sm text-muted-foreground">
                  {walletData?.address ? 
                    `${walletData.address.slice(0, 4)}...${walletData.address.slice(-4)}` 
                    : "Адрес загружается..."
                  }
                </div>
              </div>
            </Card>

            {/* Send Transaction Form with Tabs */}
            <Card className="card-glow p-6">
              <h3 className="text-lg font-semibold text-gold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Отправить криптовалюту
              </h3>
              
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ton' | 'bdog')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ton">TON</TabsTrigger>
                  <TabsTrigger value="bdog">BDOG</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ton" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="recipient-ton" className="text-sm font-medium">
                      Адрес получателя
                    </Label>
                    <Input
                      id="recipient-ton"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="EQC..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount-ton" className="text-sm font-medium">
                      Сумма (TON)
                    </Label>
                    <Input
                      id="amount-ton"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.1"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Доступно: {walletData?.tonBalance || "0"} TON | Комиссия: {calculateTransactionFee(amount || "0", 'ton')} TON
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="comment-ton" className="text-sm font-medium">
                      Комментарий (необязательно)
                    </Label>
                    <Input
                      id="comment-ton"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Комментарий к транзакции"
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={() => handleSendTransaction('ton')}
                    className="button-gold w-full"
                    disabled={isProcessing || !recipientAddress || !amount || parseFloat(amount) <= 0}
                  >
                    {isProcessing ? "Отправка..." : "Отправить TON"}
                  </Button>
                </TabsContent>
                
                <TabsContent value="bdog" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="recipient-bdog" className="text-sm font-medium">
                      Адрес получателя
                    </Label>
                    <Input
                      id="recipient-bdog"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="EQC..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount-bdog" className="text-sm font-medium">
                      Сумма (BDOG)
                    </Label>
                    <Input
                      id="amount-bdog"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Доступно: {walletData?.bdogBalance || "0"} BDOG | Комиссия: {calculateTransactionFee(amount || "0", 'bdog')} TON
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="comment-bdog" className="text-sm font-medium">
                      Комментарий (необязательно)
                    </Label>
                    <Input
                      id="comment-bdog"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Комментарий к транзакции"
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={() => handleSendTransaction('bdog')}
                    className="button-gold w-full"
                    disabled={isProcessing || !recipientAddress || !amount || parseFloat(amount) <= 0}
                  >
                    {isProcessing ? "Отправка..." : "Отправить BDOG"}
                  </Button>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}