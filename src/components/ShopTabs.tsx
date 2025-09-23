import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopTabsProps {
  currentTab: 'game' | 'shop';
  onTabChange: (tab: 'game' | 'shop') => void;
  children: React.ReactNode;
}

const ShopTabs = ({ currentTab, onTabChange, children }: ShopTabsProps) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
      
      {/* Bottom Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border">
        <div className="flex justify-around items-center py-2 px-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => onTabChange('game')}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-3 px-6 rounded-xl transition-all",
              currentTab === 'game' 
                ? "bg-gold text-black shadow-lg" 
                : "text-gold hover:bg-muted"
            )}
          >
            <Gamepad2 size={24} />
            <span className="text-xs font-medium">Тапалка</span>
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={() => onTabChange('shop')}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-3 px-6 rounded-xl transition-all",
              currentTab === 'shop' 
                ? "bg-gold text-black shadow-lg" 
                : "text-gold hover:bg-muted"
            )}
          >
            <ShoppingCart size={24} />
            <span className="text-xs font-medium">Магазин</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopTabs;