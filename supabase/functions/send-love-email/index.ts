import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  content: string;
  type: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, senderName, content, type }: EmailRequest = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      // For now, return success without actually sending
      // User needs to configure RESEND_API_KEY for actual sending
      console.log("Email would be sent to:", recipientEmail);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email simulé (configurez RESEND_API_KEY pour l'envoi réel)",
          demo: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const typeLabels: Record<string, string> = {
      poem: "Un poème d'amour",
      letter: "Une lettre d'amour",
      story: "Une histoire d'amour",
      message: "Un message d'amour",
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: linear-gradient(135deg, #1a0a0a 0%, #2d1f1f 100%); margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%); border-radius: 20px; padding: 40px; border: 1px solid rgba(212, 175, 55, 0.3); }
          .header { text-align: center; margin-bottom: 30px; }
          .heart { font-size: 48px; }
          h1 { color: #d4af37; font-size: 24px; margin: 10px 0; }
          .content { color: #f5e6e0; line-height: 1.8; white-space: pre-wrap; font-size: 16px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(212, 175, 55, 0.2); }
          .footer p { color: #9b7b7b; font-size: 14px; }
          .signature { color: #d4af37; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="heart">💌</div>
            <h1>${typeLabels[type] || "Un message"} pour toi</h1>
          </div>
          <div class="content">${content.replace(/\n/g, '<br>')}</div>
          <div class="footer">
            <p class="signature">Avec tout mon amour, ${senderName}</p>
            <p>Créé avec ❤️ sur LoveSpace</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LoveSpace <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `💌 ${senderName} t'a envoyé ${typeLabels[type]?.toLowerCase() || "un message d'amour"}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend error:", response.status, errorText);
      throw new Error("Erreur lors de l'envoi de l'email");
    }

    const result = await response.json();
    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
