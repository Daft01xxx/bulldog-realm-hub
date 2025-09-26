import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ip_address } = await req.json();
    
    if (!ip_address) {
      return new Response(
        JSON.stringify({ error: 'IP address is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check multiple VPN detection APIs
    const vpnChecks = await Promise.allSettled([
      // Check via IP-API
      fetch(`http://ip-api.com/json/${ip_address}?fields=proxy,hosting,query`),
      // Check via VPN API
      fetch(`https://vpnapi.io/api/${ip_address}?key=${Deno.env.get('VPN_API_KEY') || 'free'}`),
    ]);

    let isVpn = false;
    let vpnDetails = {};

    // Process IP-API result
    if (vpnChecks[0].status === 'fulfilled') {
      try {
        const ipApiResult = await vpnChecks[0].value.json();
        if (ipApiResult.proxy || ipApiResult.hosting) {
          isVpn = true;
          vpnDetails = { ...vpnDetails, ipApi: ipApiResult };
        }
      } catch (error) {
        console.log('IP-API error:', error);
      }
    }

    // Process VPN API result  
    if (vpnChecks[1].status === 'fulfilled') {
      try {
        const vpnApiResult = await vpnChecks[1].value.json();
        if (vpnApiResult.security?.vpn || vpnApiResult.security?.proxy) {
          isVpn = true;
          vpnDetails = { ...vpnDetails, vpnApi: vpnApiResult };
        }
      } catch (error) {
        console.log('VPN-API error:', error);
      }
    }

    // Additional heuristics for common VPN/proxy patterns
    const suspiciousPatterns = [
      /^10\./,          // Private IP
      /^192\.168\./,    // Private IP  
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private IP
      /^127\./,         // Localhost
    ];

    const isSuspiciousIp = suspiciousPatterns.some(pattern => pattern.test(ip_address));
    
    if (isSuspiciousIp) {
      isVpn = true;
      vpnDetails = { ...vpnDetails, suspicious: 'Private/Local IP detected' };
    }

    console.log(`VPN Check for ${ip_address}:`, { isVpn, vpnDetails });

    return new Response(
      JSON.stringify({
        ip_address,
        is_vpn: isVpn,
        details: vpnDetails,
        checked_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('VPN detection error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'VPN detection failed',
        details: error?.message || 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});