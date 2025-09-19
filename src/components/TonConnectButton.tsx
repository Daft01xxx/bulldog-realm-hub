import { TonConnectButton } from '@tonconnect/ui-react';

interface CustomTonConnectButtonProps {
  className?: string;
}

export const CustomTonConnectButton = ({ className }: CustomTonConnectButtonProps) => {
  return (
    <TonConnectButton 
      className={`${className} !bg-gradient-to-r !from-yellow-400 !to-yellow-600 !text-black !rounded-lg !px-6 !py-3 !font-bold !shadow-lg hover:!shadow-xl !transition-all !duration-300`}
    />
  );
};