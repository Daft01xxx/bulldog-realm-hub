import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User ID is required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Activating default miner for user: ${userId}`);

    // Get user profile first
    const { data: userProfile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('current_miner, miner_active, miner_level, v_bdog_earned')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user profile:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Check if user has default miner and it's not active
    if (userProfile.current_miner !== 'default') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User does not have default miner' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (userProfile.miner_active) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Miner is already active' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Activate miner and give initial reward of 100 V-BDOG
    const initialReward = 100;
    const newVBdogEarned = (userProfile.v_bdog_earned || 0) + initialReward;

    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        miner_active: true,
        last_miner_reward_at: new Date().toISOString(),
        v_bdog_earned: newVBdogEarned
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error activating miner:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to activate miner' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log(`Default miner activated for user ${userId}, initial reward: ${initialReward} V-BDOG`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Default miner activated successfully',
        data: {
          initialReward,
          newVBdogEarned,
          profile: updatedProfile
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Activate default miner function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})