import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    // Get IP address from various headers (Cloudflare, standard proxy headers)
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    // Priority: CF-Connecting-IP > X-Real-IP > X-Forwarded-For > fallback
    const clientIp = cfConnectingIp || realIp || (forwarded?.split(',')[0].trim()) || '127.0.0.1';
    
    // Get user agent for device fingerprinting
    const userAgent = req.headers.get('user-agent') || '';
    
    // Create a simple device fingerprint based on user agent
    // This helps distinguish between different browsers/devices on same IP
    const deviceFingerprint = createDeviceFingerprint(userAgent);
    
    console.log(`Device info - IP: ${clientIp}, Fingerprint: ${deviceFingerprint}`);

    return new Response(
      JSON.stringify({
        ip_address: clientIp,
        device_fingerprint: deviceFingerprint,
        user_agent: userAgent
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error getting device info:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get device info',
        ip_address: '127.0.0.1',
        device_fingerprint: 'unknown-device'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

function createDeviceFingerprint(userAgent: string): string {
  // Create a simple hash of user agent to distinguish devices
  let hash = 0;
  if (userAgent.length === 0) return 'unknown-device';
  
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `device-${Math.abs(hash)}`;
}