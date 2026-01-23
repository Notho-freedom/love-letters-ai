import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  try {
    console.log("[SCHEDULER] Checking scheduled emails...");

    const now = new Date();
    
    // Get scheduled emails that are due
    const { data: scheduledEmails, error } = await supabaseClient
      .from("scheduled_emails")
      .select(`
        id,
        user_id,
        creation_id,
        recipient_email,
        scheduled_at,
        creations (
          type,
          recipient_name,
          content
        )
      `)
      .eq("is_sent", false)
      .lte("scheduled_at", now.toISOString())
      .limit(20);

    if (error) throw error;

    console.log(`[SCHEDULER] Found ${scheduledEmails?.length || 0} emails to send`);

    if (!scheduledEmails || scheduledEmails.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;

    for (const email of scheduledEmails) {
      const creation = email.creations as any;
      if (!creation) continue;

      // Get sender name
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name")
        .eq("user_id", email.user_id)
        .single();

      const senderName = profile?.full_name || "Un admirateur";
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
              <h1>${typeLabels[creation.type] || "Un message"} pour toi</h1>
            </div>
            <div class="content">${creation.content.replace(/\n/g, "<br>")}</div>
            <div class="footer">
              <p class="signature">Avec tout mon amour, ${senderName}</p>
              <p>Créé avec ❤️ sur LoveSpace</p>
            </div>
          </div>
        </body>
        </html>
      `;

      if (RESEND_API_KEY) {
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "LoveSpace <onboarding@resend.dev>",
              to: [email.recipient_email],
              subject: `💌 ${senderName} t'a envoyé ${typeLabels[creation.type]?.toLowerCase() || "un message d'amour"}`,
              html: htmlContent,
            }),
          });

          if (response.ok) {
            console.log(`[SCHEDULER] Email sent to ${email.recipient_email}`);
            
            // Mark as sent
            await supabaseClient
              .from("scheduled_emails")
              .update({ is_sent: true, sent_at: new Date().toISOString() })
              .eq("id", email.id);

            // Update creation
            await supabaseClient
              .from("creations")
              .update({ is_sent: true })
              .eq("id", email.creation_id);

            // Notify sender
            await supabaseClient.from("notifications").insert({
              user_id: email.user_id,
              type: "creation_sent",
              title: "Message envoyé ! 💌",
              message: `Votre ${creation.type} pour ${creation.recipient_name} a été envoyé avec succès.`,
              related_id: email.creation_id,
            });

            sent++;
          } else {
            console.error(`[SCHEDULER] Failed to send:`, await response.text());
          }
        } catch (sendError) {
          console.error(`[SCHEDULER] Send error:`, sendError);
        }
      } else {
        console.log(`[SCHEDULER] RESEND not configured, marking as sent anyway`);
        await supabaseClient
          .from("scheduled_emails")
          .update({ is_sent: true, sent_at: new Date().toISOString() })
          .eq("id", email.id);
        sent++;
      }
    }

    // Create reminders for emails scheduled in next 24h
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const { data: upcomingEmails } = await supabaseClient
      .from("scheduled_emails")
      .select("user_id, scheduled_at, creations(recipient_name)")
      .eq("is_sent", false)
      .gt("scheduled_at", now.toISOString())
      .lte("scheduled_at", tomorrow.toISOString());

    for (const upcoming of upcomingEmails || []) {
      const creation = upcoming.creations as any;
      const scheduledTime = new Date(upcoming.scheduled_at);
      
      // Check if reminder already exists
      const { data: existingReminder } = await supabaseClient
        .from("notifications")
        .select("id")
        .eq("user_id", upcoming.user_id)
        .eq("type", "scheduled_reminder")
        .gte("created_at", new Date(now.getTime() - 60 * 60 * 1000).toISOString())
        .limit(1);

      if (!existingReminder || existingReminder.length === 0) {
        await supabaseClient.from("notifications").insert({
          user_id: upcoming.user_id,
          type: "scheduled_reminder",
          title: "Rappel d'envoi programmé 📅",
          message: `Votre message pour ${creation?.recipient_name || "votre bien-aimé(e)"} sera envoyé dans moins de 24h.`,
        });
      }
    }

    console.log(`[SCHEDULER] Sent ${sent} emails`);

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[SCHEDULER] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
