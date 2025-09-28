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
    )

    const { promocode, deviceFingerprint } = await req.json()
    
    if (!promocode || typeof promocode !== 'string') {
      console.error('Invalid promocode:', promocode)
      return new Response(
        JSON.stringify({ success: false, error: 'Promocode is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!deviceFingerprint) {
      console.error('Device fingerprint is required')
      return new Response(
        JSON.stringify({ success: false, error: 'Device fingerprint is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Processing promocode:', promocode.toUpperCase(), 'for device:', deviceFingerprint)

    // Find user profile by device fingerprint
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_id, v_bdog_earned')
      .eq('device_fingerprint', deviceFingerprint)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return new Response(
        JSON.stringify({ success: false, error: 'Ошибка при получении профиля' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!profileData) {
      console.log('Profile not found for device:', deviceFingerprint)
      return new Response(
        JSON.stringify({ success: false, error: 'Профиль не найден' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Find the promocode
    const { data: promocodeData, error: promocodeError } = await supabaseClient
      .from('promocodes')
      .select('id, code, v_bdog_reward, is_active')
      .eq('code', promocode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle()

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
      .eq('user_id', profileData.user_id)
      .eq('promocode_id', promocodeData.id)
      .maybeSingle()

    if (usageError) {
      console.error('Error checking promocode usage:', usageError)
      return new Response(
        JSON.stringify({ success: false, error: 'Ошибка при проверке промокода' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

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
        user_id: profileData.user_id,
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

    // Add V-BDOG reward to user's profile
    const newBalance = (profileData?.v_bdog_earned || 0) + promocodeData.v_bdog_reward
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        v_bdog_earned: newBalance
      })
      .eq('user_id', profileData.user_id)

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