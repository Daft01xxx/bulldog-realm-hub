import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Ban } from "lucide-react";

interface BanUserModalProps {
  onUserBanned?: () => void;
}

const BanUserModal = ({ onUserBanned }: BanUserModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userReg, setUserReg] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBanUser = async () => {
    if (!userReg.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите имя пользователя для бана",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-panel', {
        body: { action: 'ban_user', user_reg: userReg.trim() }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Пользователь забанен",
          description: `Пользователь ${userReg} был забанен`,
        });
        setUserReg("");
        setIsOpen(false);
        onUserBanned?.();
      } else {
        throw new Error(data?.error || "Неизвестная ошибка");
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось забанить пользователя",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Ban className="w-4 h-4 mr-2" />
          Забанить пользователя
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Забанить пользователя</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Имя пользователя (REG)
            </label>
            <Input
              value={userReg}
              onChange={(e) => setUserReg(e.target.value)}
              placeholder="Введите имя пользователя для бана"
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleBanUser}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? "Баним..." : "Забанить"}
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BanUserModal;