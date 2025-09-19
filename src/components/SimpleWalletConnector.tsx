import React from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const SimpleWalletConnector = () => {
  const wallet = useTonWallet();
  const navigate = useNavigate();

  const handleConnectedAction = () => {
    if (wallet) {
      navigate('/connected-wallet');
    }
  };

  return (
    <div className="space-y-4">
      {/* Official TON Connect Button */}
      <div className="flex justify-center">
        <TonConnectButton 
          className="!bg-gradient-to-r !from-yellow-400 !to-yellow-600 !text-black !rounded-lg !px-8 !py-4 !font-bold !text-lg !shadow-lg hover:!shadow-xl !transition-all !duration-300"
        />
      </div>
      
      {/* Show wallet info if connected */}
      {wallet && (
        <div className="text-center space-y-4">
          <div className="p-4 bg-card rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Подключен кошелек:</p>
            <p className="font-mono text-sm break-all">
              {wallet.account.address}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Устройство: {wallet.device.appName}
            </p>
          </div>
          
          <Button 
            onClick={handleConnectedAction}
            className="button-gold w-full"
          >
            Открыть кошелек
          </Button>
        </div>
      )}
    </div>
  );
};