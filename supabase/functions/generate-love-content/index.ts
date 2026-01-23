import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  type: "poem" | "letter" | "story" | "message";
  recipientName: string;
  occasion?: string;
  tone: string;
  details?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipientName, occasion, tone, details }: GenerateRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const typeLabels: Record<string, string> = {
      poem: "un poème d'amour",
      letter: "une lettre d'amour",
      story: "une courte histoire d'amour",
      message: "un message d'amour touchant",
    };

    const toneLabels: Record<string, string> = {
      romantic: "romantique et passionné",
      tender: "tendre et doux",
      passionate: "passionné et intense",
      playful: "espiègle et amusant",
      poetic: "poétique et métaphorique",
    };

    const systemPrompt = `Tu es un poète romantique français talentueux, spécialisé dans l'écriture de textes d'amour personnalisés. 
Tu écris avec élégance, émotion et sincérité. 
Tes créations sont uniques, touchantes et mémorables.
Tu utilises un français littéraire mais accessible.
Tu ne fais jamais de commentaires sur ta création, tu écris directement le texte demandé.`;

    const userPrompt = `Écris ${typeLabels[type] || "un texte d'amour"} pour ${recipientName}.
Ton: ${toneLabels[tone] || tone}
${occasion ? `Occasion: ${occasion}` : ""}
${details ? `Détails personnels à incorporer: ${details}` : ""}

Le texte doit être sincère, émouvant et personnalisé. Écris directement le contenu sans introduction ni explication.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de demandes. Veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits épuisés. Veuillez ajouter des crédits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erreur lors de la génération");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Aucun contenu généré");
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
