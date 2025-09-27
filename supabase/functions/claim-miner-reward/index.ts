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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Set the auth header for the client
    supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: '',
    } as any)

    // Get user from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Check if reward is ready (1 hour since last reward)
    const lastRewardTime = profile.last_miner_reward_at ? new Date(profile.last_miner_reward_at) : new Date(0)
    const nextRewardTime = new Date(lastRewardTime.getTime() + 60 * 60 * 1000) // Add 1 hour
    const currentTime = new Date()

    if (currentTime < nextRewardTime) {
      return new Response(
        JSON.stringify({ 
          error: 'Reward not ready yet',
          nextRewardTime: nextRewardTime.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Calculate reward based on miner type
    const minerType = profile.current_miner || 'default'
    const minerLevel = profile.miner_level || 1
    
    const { data: reward, error: rewardError } = await supabaseClient
      .rpc('get_miner_hourly_income', { 
        miner_type: minerType, 
        miner_level: minerLevel 
      })

    if (rewardError) {
      console.error('Error calculating reward:', rewardError)
      return new Response(
        JSON.stringify({ error: 'Error calculating reward' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update profile with reward
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        v_bdog_earned: (profile.v_bdog_earned || 0) + reward,
        last_miner_reward_at: currentTime.toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return new Response(
        JSON.stringify({ error: 'Error updating profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        reward: reward,
        newBalance: (profile.v_bdog_earned || 0) + reward,
        message: `Получено ${reward} V-BDOG!`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('Claim miner reward function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})