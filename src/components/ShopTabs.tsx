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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {children}
      
      {/* Bottom Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-amber-200">
        <div className="flex justify-around items-center py-2 px-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => onTabChange('game')}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-3 px-6 rounded-xl transition-all",
              currentTab === 'game' 
                ? "bg-amber-500 text-white shadow-lg" 
                : "text-amber-600 hover:bg-amber-100"
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
                ? "bg-amber-500 text-white shadow-lg" 
                : "text-amber-600 hover:bg-amber-100"
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