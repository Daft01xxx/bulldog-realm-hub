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
          grow1: number
          booster_expires_at: string | null
        }
        Update: {
          grow1?: number
          booster_expires_at?: string | null
        }
      }
    }
    Functions: {
      reset_expired_boosters: {
        Returns: number
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
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log(`Starting booster cleanup at ${new Date().toISOString()}`)

    // Call the database function to reset expired boosters
    const { data: resetCount, error } = await supabaseClient
      .rpc('reset_expired_boosters')

    if (error) {
      console.error('Booster cleanup error:', error)
      throw error
    }

    console.log(`Booster cleanup completed: ${resetCount} boosters reset`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Booster cleanup completed: ${resetCount} boosters reset`,
        resetCount: resetCount,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Booster cleanup function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})