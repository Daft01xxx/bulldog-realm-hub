import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useSessionCheck(userId: string | undefined, enabled: boolean = true) {
  const navigate = useNavigate();
  const sessionIdRef = useRef<string>('');
  const checkIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userId || !enabled) return;

    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionIdRef.current = sessionId;

    // Set this session as active in database
    const setActiveSession = async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          active_session_id: sessionId,
          last_activity: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to set active session:', error);
      }
    };

    // Check if current session is still active
    const checkSession = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('active_session_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Failed to check session:', error);
        return;
      }

      if (data?.active_session_id !== sessionIdRef.current) {
        // Another device has taken over
        toast.error('Ваш аккаунт был открыт на другом устройстве', {
          description: 'Вы были отключены с этого устройства',
          duration: 5000
        });
        
        // Clear interval and redirect
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        
        // Sign out user
        await supabase.auth.signOut();
        navigate('/');
      }
    };

    // Set initial session
    setActiveSession();

    // Check session every 5 seconds
    checkIntervalRef.current = setInterval(checkSession, 5000);

    // Update last activity every 30 seconds
    const activityInterval = setInterval(() => {
      supabase
        .from('profiles')
        .update({ last_activity: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('active_session_id', sessionIdRef.current)
        .then(({ error }) => {
          if (error) console.error('Failed to update activity:', error);
        });
    }, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      clearInterval(activityInterval);
    };
  }, [userId, navigate]);
}
