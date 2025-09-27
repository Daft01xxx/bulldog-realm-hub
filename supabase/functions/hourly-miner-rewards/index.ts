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

    console.log(`Starting hourly miner rewards distribution at ${new Date().toISOString()}`)

    // Call the database function to distribute miner rewards
    const { data: rewardCount, error } = await supabaseClient
      .rpc('distribute_miner_rewards')

    if (error) {
      console.error('Miner rewards distribution error:', error)
      throw error
    }

    console.log(`Miner rewards distribution completed: ${rewardCount} users rewarded`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Miner rewards distributed to ${rewardCount} users`,
        rewardCount: rewardCount,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('Hourly miner rewards function error:', error)
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