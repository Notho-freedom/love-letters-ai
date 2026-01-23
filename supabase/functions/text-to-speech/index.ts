import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId = "pFZP5JQG7iQjIQuC4Bku", useFallback = false } = await req.json();

    if (!text || text.trim().length === 0) {
      throw new Error("Le texte est requis");
    }

    // If fallback is requested, return a signal to use browser TTS
    if (useFallback) {
      return new Response(
        JSON.stringify({ useBrowserTTS: true, text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    // If no API key, signal to use browser TTS
    if (!ELEVENLABS_API_KEY) {
      console.log("No ElevenLabs API key, signaling browser TTS fallback");
      return new Response(
        JSON.stringify({ useBrowserTTS: true, text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Attempting ElevenLabs TTS for text length:", text.length);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", response.status, errorText);
      
      // On any error, signal to use browser TTS as fallback
      console.log("ElevenLabs failed, signaling browser TTS fallback");
      return new Response(
        JSON.stringify({ useBrowserTTS: true, text, elevenLabsError: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("ElevenLabs TTS successful, audio size:", audioBuffer.byteLength);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    
    // On any error, signal browser TTS fallback instead of failing
    return new Response(
      JSON.stringify({ 
        useBrowserTTS: true, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
