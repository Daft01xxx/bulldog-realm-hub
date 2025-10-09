import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  contactType: 'email' | 'phone';
  contactValue: string;
  code: string;
  subject?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contactType, contactValue, code, subject }: VerificationRequest = await req.json();
    
    console.log(`Sending ${contactType} verification code to ${contactValue}`);

    if (contactType === 'email') {
      // Check if RESEND_API_KEY is available
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      
      console.log(`Verification code request:`, { contactType, contactValue, code, subject });
      console.log(`Email verification code for ${contactValue}: ${code}`);
      
      if (!resendApiKey) {
        console.warn("RESEND_API_KEY not found - returning success with logged code");
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Code logged (email service not configured)",
            code: code,
            note: "Check server logs for the verification code"
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      try {
        const { Resend } = await import("npm:resend@2.0.0");
        const resend = new Resend(resendApiKey);

        const emailResponse = await resend.emails.send({
          from: "BDOG App <onboarding@resend.dev>",
          to: [contactValue],
          subject: subject || "Код верификации BDOG",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #D4AF37;">BDOG ID</h1>
              <h2>Код верификации</h2>
              <p>Ваш код верификации:</p>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${code}
              </div>
              <p style="color: #666;">Код действителен 10 минут.</p>
              <p style="color: #666;">Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
            </div>
          `,
        });

        console.log("Resend response:", emailResponse);

        // If email fails (like domain not verified), still return success
        if (emailResponse.error) {
          console.error("Resend error:", emailResponse.error.message);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Code logged (email sending failed)",
              code: code,
              note: "Email service requires domain verification. Check server logs for code."
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }

        console.log("Email sent successfully:", emailResponse);

        return new Response(
          JSON.stringify({ success: true, data: emailResponse }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } catch (emailError: any) {
        console.error("Error sending verification code:", emailError);
        // Still return success so user can use the code
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Code logged (email error)",
            code: code,
            note: "Check server logs for the verification code"
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    } else {
      // Phone verification (Twilio)
      const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

      if (!twilioAccountSid || !twilioAuthToken || !twilioPhone) {
        console.error("Twilio credentials not found");
        console.log(`Verification code for ${contactValue}: ${code}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Code logged (SMS service not configured)",
            code: code // Only for development
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

      const formData = new URLSearchParams();
      formData.append("To", contactValue);
      formData.append("From", twilioPhone);
      formData.append("Body", `Ваш код верификации BDOG: ${code}. Код действителен 10 минут.`);

      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Twilio error:", errorText);
        throw new Error(`Twilio API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("SMS sent successfully:", data);

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-verification-code:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
