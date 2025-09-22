import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          reg: string | null
          grow: number
          bone: number
          v_bdog_earned: number
          referrals: number
          ip_address: string | null
          device_fingerprint: string | null
          wallet_address: string | null
          created_at: string
          grow1: number
          booster_expires_at: string | null
          ban: number
        }
        Update: {
          grow?: number
          bone?: number
          v_bdog_earned?: number
          grow1?: number
          booster_expires_at?: string | null
          ban?: number
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`Received ${req.method} request to admin-panel`);
    
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    let requestData: any = {};
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestData = JSON.parse(bodyText);
      }
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const action = requestData.action;
    console.log(`Processing action: ${action}`);

    if (action === 'list_users') {
      console.log('Fetching all profiles...');
      const { data: profiles, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log(`Found ${profiles?.length || 0} profiles`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          profiles: profiles || [],
          count: profiles?.length || 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else if (action === 'update_user') {
      const { userId, updates } = requestData;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'userId is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      console.log(`Updating user ${userId} with:`, updates);
      
      const { data, error } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'User not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        );
      }

      console.log(`Successfully updated user ${userId}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `User ${userId} updated successfully`,
          profile: data[0]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else if (action === 'ban_user') {
      const { user_reg } = requestData;

      if (!user_reg) {
        return new Response(
          JSON.stringify({ success: false, error: 'user_reg is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      console.log(`Banning user with REG: ${user_reg}`);

      const { data, error } = await supabaseClient
        .from('profiles')
        .update({ ban: 1 })
        .eq('reg', user_reg)
        .select('id, reg');

      if (error) {
        console.error('Ban error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'User not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        );
      }

      console.log(`Successfully banned user ${user_reg}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `User ${user_reg} has been banned`,
          profile: data[0]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else if (action === 'unban_user') {
      const { user_reg } = requestData;

      if (!user_reg) {
        return new Response(
          JSON.stringify({ success: false, error: 'user_reg is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      console.log(`Unbanning user with REG: ${user_reg}`);

      const { data, error } = await supabaseClient
        .from('profiles')
        .update({ ban: 0 })
        .eq('reg', user_reg)
        .select('id, reg');

      if (error) {
        console.error('Unban error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'User not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        );
      }

      console.log(`Successfully unbanned user ${user_reg}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `User ${user_reg} has been unbanned`,
          profile: data[0]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else if (action === 'delete_all_users') {
      console.log('Deleting all user profiles...');
      
      const { error } = await supabaseClient
        .from('profiles')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Successfully deleted all user profiles');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All user profiles deleted successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else if (action === 'reset_boosters') {
      console.log('Resetting all active boosters...');
      
      const { data, error } = await supabaseClient
        .from('profiles')
        .update({ grow1: 1, booster_expires_at: null })
        .gt('grow1', 1)
        .select('id');

      if (error) {
        console.error('Reset boosters error:', error);
        throw error;
      }

      console.log(`Reset boosters for ${data?.length || 0} users`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Reset boosters for ${data?.length || 0} users`,
          count: data?.length || 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid action: ${action}. Available actions: list_users, update_user, ban_user, unban_user, delete_all_users, reset_boosters` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

  } catch (error) {
    console.error('Admin panel function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});