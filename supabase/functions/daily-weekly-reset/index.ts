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

    const { searchParams } = new URL(req.url)
    const resetType = searchParams.get('type') // 'daily' or 'weekly'

    // Get current Moscow time
    const moscowTime = new Date().toLocaleString("en-US", {timeZone: "Europe/Moscow"});
    console.log(`Starting ${resetType} reset at ${new Date().toISOString()} (Moscow: ${moscowTime})`)

    if (resetType === 'daily') {
      // Daily reset: set all bone values to 1000 for ALL users
      const { error: dailyError, count } = await supabaseClient
        .from('profiles')
        .update({ bone: 1000 })
        .gte('id', '00000000-0000-0000-0000-000000000000') // Update ALL records

      if (dailyError) {
        console.error('Daily reset error:', dailyError)
        throw dailyError
      }

      console.log(`Daily reset completed: ${count || 0} profiles updated with bone = 1000`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Daily reset completed: ${count || 0} profiles updated with bone = 1000`,
          profilesUpdated: count || 0,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } else if (resetType === 'weekly') {
      // Weekly reset: reward top 5 players and reset grow to 0
      // This should run every Sunday at 10:00 AM Moscow time
      
      // 1. Get top 5 players by grow
      const { data: topPlayers, error: topPlayersError } = await supabaseClient
        .from('profiles')
        .select('id, reg, grow, v_bdog_earned')
        .order('grow', { ascending: false })
        .limit(5)

      if (topPlayersError) {
        console.error('Error fetching top players:', topPlayersError)
        throw topPlayersError
      }

      console.log('Top 5 players:', topPlayers)

      // 2. Award V-BDOG tokens to top 5 players
      if (topPlayers && topPlayers.length > 0) {
        for (const player of topPlayers) {
          const newVBdogBalance = (player.v_bdog_earned || 0) + 5000000
          
          const { error: rewardError } = await supabaseClient
            .from('profiles')
            .update({ v_bdog_earned: newVBdogBalance })
            .eq('id', player.id)

          if (rewardError) {
            console.error(`Error rewarding player ${player.id}:`, rewardError)
          } else {
            console.log(`Rewarded player ${player.reg || 'Anonymous'} (ID: ${player.id}) with 5,000,000 V-BDOG tokens`)
          }
        }
      }

      // 3. Reset all grow values to 0
      const { error: resetGrowError } = await supabaseClient
        .from('profiles')
        .update({ grow: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Update all records

      if (resetGrowError) {
        console.error('Weekly grow reset error:', resetGrowError)
        throw resetGrowError
      }

      // 4. Also reset any expired boosters during weekly reset
      const { data: boosterResetCount, error: boosterError } = await supabaseClient
        .rpc('reset_expired_boosters')

      if (boosterError) {
        console.error('Error resetting boosters during weekly reset:', boosterError)
      } else {
        console.log(`Reset ${boosterResetCount} expired boosters during weekly reset`)
      }

      console.log('Weekly reset completed: All grow reset to 0, top 5 players rewarded, boosters checked')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Weekly reset completed: All grow reset to 0, top 5 players rewarded',
          topPlayers: topPlayers?.map(p => ({ name: p.reg || 'Anonymous', grow: p.grow })),
          boosterResetCount: boosterResetCount || 0,
          timestamp: new Date().toISOString(),
          moscowTime: moscowTime
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid reset type. Use ?type=daily or ?type=weekly' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

  } catch (error: any) {
    console.error('Reset function error:', error)
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