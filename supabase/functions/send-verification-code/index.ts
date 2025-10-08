import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  contactType: 'email';
  contactValue: string;
  code: string;
  subject?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contactType, contactValue, code, subject }: VerificationRequest = await req.json();

    console.log('Verification code request:', { contactType, contactValue, code, subject });

    // In a production environment, you would integrate with services like:
    // - Twilio for SMS
    // - SendGrid/Resend for Email
    // For now, we'll just log the code and return success

    console.log(`Email verification code for ${contactValue}: ${code}`);
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }
    
    const resend = new Resend(resendApiKey);
    
    const emailSubject = subject || "Код верификации BDOG";
    const emailTitle = subject || "Код верификации BDOG";
    
    const emailResponse = await resend.emails.send({
      from: "BDOG <noreply@bdog.com>",
      to: [contactValue],
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">${emailTitle}</h1>
          <p style="font-size: 16px; color: #555;">Ваш код верификации:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <strong style="font-size: 24px; color: #333;">${code}</strong>
          </div>
          <p style="font-size: 14px; color: #777;">Код действителен в течение 10 минут.</p>
          <p style="font-size: 14px; color: #777;">Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
        </div>
      `,
    });
    
    console.log('Resend response:', emailResponse);
    
    if (emailResponse.error) {
      throw new Error(`Resend error: ${emailResponse.error.message}`);
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
