import { useState } from 'react';
import { Menu, X, Home, CreditCard, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface WalletNavigationProps {
  onNavigateToSection: (section: string) => void;
  currentSection?: string;
}

export default function WalletNavigation({ onNavigateToSection, currentSection = 'wallet' }: WalletNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { id: 'wallet', label: 'Информация о кошельке', icon: Home },
    { id: 'balances', label: 'Балансы', icon: CreditCard },
    { id: 'nfts', label: 'NFT Коллекция', icon: Menu },
    { id: 'transactions', label: 'История транзакций', icon: History },
  ];

  const handleNavigate = (section: string) => {
    onNavigateToSection(section);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="button-outline-gold fixed top-4 right-4 z-50"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-gradient">Навигация по кошельку</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentSection === item.id ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto py-3 px-4 ${
                  currentSection === item.id ? "button-gold" : "button-outline-gold"
                }`}
                onClick={() => handleNavigate(item.id)}
              >
                <IconComponent className="w-4 h-4 mr-3" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}