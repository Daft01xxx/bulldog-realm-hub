import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Search } from 'lucide-react';

interface TransactionTrackerProps {
  onTransactionFound?: (txData: any) => void;
}

export default function TransactionTracker({ onTransactionFound }: TransactionTrackerProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const checkTonScan = (addressToCheck: string) => {
    const cleanAddress = addressToCheck.replace(/[^A-Za-z0-9_-]/g, '');
    const tonScanUrl = `https://tonscan.org/address/${cleanAddress}`;
    window.open(tonScanUrl, '_blank');
  };

  const convertAddress = (inputAddress: string) => {
    const cleanAddress = inputAddress.trim();
    let converted = '';
    let info = '';

    if (cleanAddress.startsWith('UQ')) {
      converted = 'EQ' + cleanAddress.substring(2);
      info = 'UQ → EQ (non-bounceable → bounceable)';
    } else if (cleanAddress.startsWith('EQ')) {
      converted = 'UQ' + cleanAddress.substring(2);
      info = 'EQ → UQ (bounceable → non-bounceable)';
    } else {
      info = 'Неизвестный формат адреса';
    }

    return { converted, info };
  };

  return (
    <Card className="card-glow p-4">
      <h3 className="text-lg font-semibold text-gold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5" />
        Отслеживание транзакций
      </h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="address" className="text-sm font-medium">
            TON адрес для проверки
          </Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="EQBN-LD_8VQJFG_Y2F3TEKcZDwBjQ9uCMlU7EwOA8beQ_gX7"
            className="mt-1"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => checkTonScan(address || "EQBN-LD_8VQJFG_Y2F3TEKcZDwBjQ9uCMlU7EwOA8beQ_gX7")}
            className="button-gold flex-1"
            disabled={loading}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Открыть в TonScan
          </Button>
        </div>

        {address && (
          <Card className="p-3 bg-muted/50">
            <h4 className="text-sm font-semibold mb-2">Информация об адресе:</h4>
            <div className="text-xs space-y-1">
              <p>
                <span className="text-muted-foreground">Исходный:</span> {address}
              </p>
              {(() => {
                const { converted, info } = convertAddress(address);
                return (
                  <>
                    <p>
                      <span className="text-muted-foreground">Конвертированный:</span> {converted}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Тип:</span> {info}
                    </p>
                  </>
                );
              })()}
            </div>
          </Card>
        )}

        <Card className="p-3 bg-blue-500/10 border-blue-500/20">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Руководство по форматам адресов:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>EQ:</strong> Bounceable адрес (для кошельков) - рекомендуется</p>
            <p>• <strong>UQ:</strong> Non-bounceable адрес (для смарт-контрактов)</p>
            <p>• Если TON не поступили, проверьте правильность формата адреса</p>
            <p>• В TonScan можно увидеть все входящие транзакции</p>
          </div>
        </Card>
      </div>
    </Card>
  );
}