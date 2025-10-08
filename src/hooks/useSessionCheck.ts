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

    // Set this session as active in database (max 2 devices)
    const setActiveSession = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('active_sessions')
        .eq('user_id', userId)
        .single();

      let activeSessions: Array<{id: string, lastActivity: number}> = 
        Array.isArray(profile?.active_sessions) ? profile.active_sessions as any[] : [];
      
      // Remove sessions older than 5 minutes (inactive)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      activeSessions = activeSessions.filter((s) => s.lastActivity > fiveMinutesAgo);
      
      // Check if this session already exists
      const existingSessionIndex = activeSessions.findIndex((s: any) => s.id === sessionId);
      
      if (existingSessionIndex >= 0) {
        // Update existing session
        activeSessions[existingSessionIndex].lastActivity = Date.now();
      } else {
        // Add new session
        if (activeSessions.length >= 2) {
          // Remove oldest session
          activeSessions.sort((a: any, b: any) => a.lastActivity - b.lastActivity);
          activeSessions.shift();
        }
        activeSessions.push({
          id: sessionId,
          lastActivity: Date.now()
        });
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          active_sessions: activeSessions,
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
        .select('active_sessions')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Failed to check session:', error);
        return;
      }

      const activeSessions: Array<{id: string, lastActivity: number}> = 
        Array.isArray(data?.active_sessions) ? data.active_sessions as any[] : [];
      const currentSession = activeSessions.find((s) => s.id === sessionIdRef.current);

      if (!currentSession) {
        // Session was removed (3rd device logged in)
        toast.error('Ваш аккаунт был открыт на другом устройстве', {
          description: 'Достигнут лимит в 2 устройства',
          duration: 5000
        });
        
        // Clear interval and redirect
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        
        navigate('/');
      }
    };

    // Set initial session
    setActiveSession();

    // Check session every 5 seconds
    checkIntervalRef.current = setInterval(checkSession, 5000);

    // Update last activity every 30 seconds
    const activityInterval = setInterval(() => {
      setActiveSession();
    }, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      clearInterval(activityInterval);
    };
  }, [userId, navigate]);
}
