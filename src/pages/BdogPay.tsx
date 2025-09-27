import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    sendTransaction 
  } = useBdogTonWallet();
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendTransaction = async () => {
    if (!recipientAddress || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Ошибка валидации",
        description: "Проверьте адрес и сумму",
        variant: "destructive",
      });
      return;
    }

    const availableBalance = parseFloat(walletData?.tonBalance || "0");
    const sendAmount = parseFloat(amount);

    if (sendAmount > availableBalance) {
      toast({
        title: "Недостаточно средств",
        description: `Доступно: ${availableBalance} TON`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const result = await sendTransaction(recipientAddress, amount, comment || undefined);
    
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
              <div className="text-2xl font-bold text-gradient">
                {walletData?.tonBalance || "0"} TON
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {walletData?.address ? 
                  `${walletData.address.slice(0, 4)}...${walletData.address.slice(-4)}` 
                  : "Адрес загружается..."
                }
              </div>
            </Card>

            {/* Send Transaction Form */}
            <Card className="card-glow p-6">
              <h3 className="text-lg font-semibold text-gold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Отправить TON
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient" className="text-sm font-medium">
                    Адрес получателя
                  </Label>
                  <Input
                    id="recipient"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="EQC..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Сумма (TON)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.1"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="comment" className="text-sm font-medium">
                    Комментарий (необязательно)
                  </Label>
                  <Input
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Комментарий к транзакции"
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={handleSendTransaction}
                  className="button-gold w-full"
                  disabled={isProcessing || !recipientAddress || !amount || parseFloat(amount) <= 0}
                >
                  {isProcessing ? "Отправка..." : "Отправить транзакцию"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}