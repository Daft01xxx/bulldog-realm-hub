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
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { promocode } = await req.json()
    
    if (!promocode || typeof promocode !== 'string') {
      console.error('Invalid promocode:', promocode)
      return new Response(
        JSON.stringify({ success: false, error: 'Promocode is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Processing promocode:', promocode.toUpperCase(), 'for user:', user.id)

    // Find the promocode
    const { data: promocodeData, error: promocodeError } = await supabaseClient
      .from('promocodes')
      .select('id, code, v_bdog_reward, is_active')
      .eq('code', promocode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (promocodeError || !promocodeData) {
      console.log('Promocode not found or inactive:', promocode)
      // Return success but with no reward (as requested - don't give anything for invalid codes)
      return new Response(
        JSON.stringify({ success: true, message: 'Промокод обработан', reward: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log('Found promocode:', promocodeData)

    // Check if user already used this promocode
    const { data: usageData, error: usageError } = await supabaseClient
      .from('promocode_usage')
      .select('id')
      .eq('user_id', user.id)
      .eq('promocode_id', promocodeData.id)
      .maybeSingle()

    if (usageData) {
      console.log('User already used this promocode')
      return new Response(
        JSON.stringify({ success: false, error: 'Промокод уже использован' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Mark promocode as used by this user
    const { error: insertUsageError } = await supabaseClient
      .from('promocode_usage')
      .insert([{
        user_id: user.id,
        promocode_id: promocodeData.id
      }])

    if (insertUsageError) {
      console.error('Error inserting promocode usage:', insertUsageError)
      return new Response(
        JSON.stringify({ success: false, error: 'Ошибка при использовании промокода' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Marked promocode as used')

    // Get current V-BDOG balance
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('v_bdog_earned')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return new Response(
        JSON.stringify({ success: false, error: 'Ошибка при получении профиля' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Current profile data:', profileData)

    // Add V-BDOG reward to user's profile
    const newBalance = (profileData?.v_bdog_earned || 0) + promocodeData.v_bdog_reward
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        v_bdog_earned: newBalance
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: 'Ошибка при начислении награды' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Updated V-BDOG balance from', (profileData?.v_bdog_earned || 0), 'to', newBalance)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Промокод ${promocodeData.code} успешно активирован!`,
        reward: promocodeData.v_bdog_reward
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('Redeem promocode function error:', error)
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