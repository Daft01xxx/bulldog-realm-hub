import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BanUserModal({ isOpen, onClose }: BanUserModalProps) {
  const [userReg, setUserReg] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBanUser = async () => {
    if (!userReg.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите REG пользователя",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('admin-panel', {
        body: {
          action: 'ban_user',
          user_reg: userReg.trim()
        }
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Успех",
        description: `Пользователь ${userReg} забанен`,
      });

      setUserReg('');
      onClose();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось забанить пользователя",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Забанить пользователя</DialogTitle>
          <DialogDescription>
            Введите REG пользователя, которого хотите забанить
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userReg">REG пользователя</Label>
            <Input
              id="userReg"
              value={userReg}
              onChange={(e) => setUserReg(e.target.value)}
              placeholder="Введите REG пользователя"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button 
              onClick={handleBanUser} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Обработка...' : 'Отправить бан'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}