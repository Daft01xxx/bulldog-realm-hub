import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Gift } from 'lucide-react';

export const NotificationToast = () => {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    if (!profile?.referral_notifications || !Array.isArray(profile.referral_notifications)) return;

    const notifications = profile.referral_notifications as Array<{
      type: string;
      timestamp: string;
      message: string;
      reg_id?: string;
      read?: boolean;
    }>;

    const unreadNotifications = notifications.filter(
      (notification) => !notification.read
    );

    if (unreadNotifications.length > 0) {
      // Show notifications
      unreadNotifications.forEach((notification) => {
        toast({
          title: "💰 Новая награда!",
          description: notification.message,
          duration: 5000,
        });
      });

      // Mark notifications as read
      const updatedNotifications = notifications.map(
        (notification) => ({ ...notification, read: true })
      );

      updateProfile({ referral_notifications: updatedNotifications });
    }
  }, [profile?.referral_notifications, toast, updateProfile]);

  return null;
};