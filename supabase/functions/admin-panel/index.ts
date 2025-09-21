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
        }
        Update: {
          grow?: number
          bone?: number
          v_bdog_earned?: number
          grow1?: number
          booster_expires_at?: string | null
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

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    console.log(`Admin panel action: ${action} at ${new Date().toISOString()}`)

    if (action === 'list_users') {
      // Get all users with their data
      const { data: profiles, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          profiles: profiles,
          count: profiles?.length || 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } else if (action === 'update_user' && userId) {
      const body = await req.json()
      const { updates } = body

      const { data, error } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()

      if (error) {
        throw error
      }

      console.log(`Updated user ${userId}:`, updates)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `User ${userId} updated successfully`,
          profile: data?.[0]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } else if (action === 'delete_all_users') {
      // Delete all profiles except system ones
      const { error } = await supabaseClient
        .from('profiles')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        throw error
      }

      console.log('All user profiles deleted')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All user profiles deleted successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } else if (action === 'reset_boosters') {
      // Reset all active boosters
      const { data, error } = await supabaseClient
        .from('profiles')
        .update({ grow1: 1, booster_expires_at: null })
        .gt('grow1', 1)
        .select('id')

      if (error) {
        throw error
      }

      console.log(`Reset boosters for ${data?.length || 0} users`)

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
      )

    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid action or missing parameters. Available actions: list_users, update_user, delete_all_users, reset_boosters' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

  } catch (error) {
    console.error('Admin panel function error:', error)
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