import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck } from "lucide-react";

interface UnbanUserModalProps {
  onUserUnbanned?: () => void;
}

const UnbanUserModal = ({ onUserUnbanned }: UnbanUserModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userReg, setUserReg] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUnbanUser = async () => {
    if (!userReg.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите имя пользователя для разбана",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-panel', {
        body: { action: 'unban_user', user_reg: userReg.trim() }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Пользователь разбанен",
          description: `Пользователь ${userReg} был разбанен`,
        });
        setUserReg("");
        setIsOpen(false);
        onUserUnbanned?.();
      } else {
        throw new Error(data?.error || "Неизвестная ошибка");
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось разбанить пользователя",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <UserCheck className="w-4 h-4 mr-2" />
          Разбанить пользователя
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Разбанить пользователя</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Имя пользователя (REG)
            </label>
            <Input
              value={userReg}
              onChange={(e) => setUserReg(e.target.value)}
              placeholder="Введите имя пользователя для разбана"
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleUnbanUser}
              disabled={loading}
              variant="default"
              className="flex-1"
            >
              {loading ? "Разбаниваем..." : "Разбанить"}
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

export default UnbanUserModal;