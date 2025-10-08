import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  contactType: 'phone' | 'email';
  contactValue: string;
  code: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contactType, contactValue, code }: VerificationRequest = await req.json();

    console.log('Verification code request:', { contactType, contactValue, code });

    // In a production environment, you would integrate with services like:
    // - Twilio for SMS
    // - SendGrid/Resend for Email
    // For now, we'll just log the code and return success

    if (contactType === 'email') {
      // TODO: Integrate with email service (Resend, SendGrid, etc.)
      console.log(`Email verification code for ${contactValue}: ${code}`);
      
      // Email integration can be added later with Resend
    } else if (contactType === 'phone') {
      console.log(`SMS verification code for ${contactValue}: ${code}`);
      
      const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");
      
      if (!accountSid || !authToken || !twilioPhone) {
        throw new Error('Twilio credentials not configured');
      }
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: contactValue,
            From: twilioPhone,
            Body: `Ваш код верификации BDOG: ${code}`,
          }),
        }
      );
      
      const result = await response.json();
      console.log('Twilio response:', result);
      
      if (!response.ok) {
        throw new Error(`Twilio error: ${result.message || 'Unknown error'}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Verification code sent successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
