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
    console.log("[NOTIFICATIONS] Starting notification check...");

    // Get unread, un-emailed notifications for users with email notifications enabled
    const { data: notifications, error: notifError } = await supabaseClient
      .from("notifications")
      .select(`
        id,
        user_id,
        type,
        title,
        message,
        created_at
      `)
      .eq("is_emailed", false)
      .eq("is_read", false)
      .order("created_at", { ascending: true })
      .limit(50);

    if (notifError) {
      console.error("Error fetching notifications:", notifError);
      throw notifError;
    }

    console.log(`[NOTIFICATIONS] Found ${notifications?.length || 0} notifications to process`);

    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by user
    const userNotifications = new Map<string, typeof notifications>();
    for (const notif of notifications) {
      const existing = userNotifications.get(notif.user_id) || [];
      existing.push(notif);
      userNotifications.set(notif.user_id, existing);
    }

    let processed = 0;

    for (const [userId, userNotifs] of userNotifications) {
      // Get user profile and email
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, email_notifications")
        .eq("user_id", userId)
        .single();

      if (!profile?.email_notifications) {
        console.log(`[NOTIFICATIONS] User ${userId} has email notifications disabled`);
        continue;
      }

      // Get user email from auth
      const { data: userData } = await supabaseClient.auth.admin.getUserById(userId);
      const userEmail = userData?.user?.email;

      if (!userEmail) {
        console.log(`[NOTIFICATIONS] No email for user ${userId}`);
        continue;
      }

      // Build email content
      const notifList = userNotifs
        .map((n) => `• ${n.title}: ${n.message}`)
        .join("\n");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Georgia', serif; background: #1a0a0a; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(45,31,31,0.9) 0%, rgba(26,10,10,0.95) 100%); border-radius: 20px; padding: 40px; border: 1px solid rgba(212,175,55,0.3); }
            .header { text-align: center; margin-bottom: 30px; }
            .heart { font-size: 48px; }
            h1 { color: #d4af37; font-size: 24px; margin: 10px 0; }
            .notification { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin: 12px 0; border-left: 3px solid #d4af37; }
            .notification h3 { color: #f5e6e0; margin: 0 0 8px 0; font-size: 16px; }
            .notification p { color: #9b7b7b; margin: 0; font-size: 14px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(212,175,55,0.2); }
            .footer p { color: #9b7b7b; font-size: 12px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #b76e79, #d4af37); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="heart">💌</div>
              <h1>Nouvelles notifications LoveSpace</h1>
            </div>
            ${userNotifs
              .map(
                (n) => `
              <div class="notification">
                <h3>${n.title}</h3>
                <p>${n.message}</p>
              </div>
            `
              )
              .join("")}
            <div class="footer">
              <a href="https://lovespace.app/dashboard" class="btn">Voir mon tableau de bord</a>
              <p>Vous recevez cet email car vous avez activé les notifications email sur LoveSpace.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email if RESEND configured
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
              to: [userEmail],
              subject: `💖 ${userNotifs.length} nouvelle(s) notification(s) LoveSpace`,
              html: htmlContent,
            }),
          });

          if (response.ok) {
            console.log(`[NOTIFICATIONS] Email sent to ${userEmail}`);
          } else {
            console.error(`[NOTIFICATIONS] Email failed:`, await response.text());
          }
        } catch (emailError) {
          console.error(`[NOTIFICATIONS] Email error:`, emailError);
        }
      } else {
        console.log(`[NOTIFICATIONS] RESEND not configured, skipping email to ${userEmail}`);
      }

      // Mark notifications as emailed
      const notifIds = userNotifs.map((n) => n.id);
      await supabaseClient
        .from("notifications")
        .update({ is_emailed: true })
        .in("id", notifIds);

      processed += userNotifs.length;
    }

    console.log(`[NOTIFICATIONS] Processed ${processed} notifications`);

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[NOTIFICATIONS] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
