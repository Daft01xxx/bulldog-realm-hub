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
      
      // Example Resend integration (commented out - needs RESEND_API_KEY secret):
      /*
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      await resend.emails.send({
        from: "BDOG App <noreply@yourdomain.com>",
        to: [contactValue],
        subject: "Код верификации BDOG",
        html: `
          <h1>Код верификации BDOG</h1>
          <p>Ваш код верификации: <strong>${code}</strong></p>
          <p>Код действителен в течение 10 минут.</p>
        `,
      });
      */
    } else if (contactType === 'phone') {
      // TODO: Integrate with SMS service (Twilio, etc.)
      console.log(`SMS verification code for ${contactValue}: ${code}`);
      
      // Example Twilio integration (commented out - needs TWILIO credentials):
      /*
      const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");
      
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
      */
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
