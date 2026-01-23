import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ElevenLabs voice IDs
const ELEVENLABS_VOICES = {
  // Female voices
  "lily": { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", gender: "female", style: "soft" },
  "jessica": { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", gender: "female", style: "warm" },
  "sarah": { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", gender: "female", style: "passionate" },
  "alice": { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", gender: "female", style: "dramatic" },
  "laura": { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", gender: "female", style: "intimate" },
  "matilda": { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", gender: "female", style: "narrator" },
  
  // Male voices
  "charlie": { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", gender: "male", style: "warm" },
  "george": { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", gender: "male", style: "dramatic" },
  "daniel": { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", gender: "male", style: "passionate" },
  "liam": { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", gender: "male", style: "soft" },
  "brian": { id: "nPczCjzI2devNBz1zQrb", name: "Brian", gender: "male", style: "narrator" },
  "chris": { id: "iP95p4xoKVk53GoZ742B", name: "Chris", gender: "male", style: "intimate" },
};

async function generateWithElevenLabs(
  text: string,
  voiceId: string,
  style: string
): Promise<ArrayBuffer> {
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  // Adjust voice settings based on style
  const voiceSettings = {
    stability: style === "dramatic" ? 0.4 : style === "soft" ? 0.7 : 0.5,
    similarity_boost: 0.8,
    style: style === "passionate" ? 0.6 : style === "intimate" ? 0.5 : 0.4,
    use_speaker_boost: true,
  };

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
        voice_settings: voiceSettings,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("ElevenLabs error:", response.status, errorText);
    throw new Error(`ElevenLabs error: ${response.status}`);
  }

  return await response.arrayBuffer();
}

async function generateWithFallbackTTS(
  text: string,
  voiceId: string = "pFZP5JQG7iQjIQuC4Bku"
): Promise<ArrayBuffer> {
  // Fallback to existing text-to-speech function logic
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

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
    throw new Error("Fallback TTS error");
  }

  return await response.arrayBuffer();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      text, 
      voiceKey = "lily", 
      narratorStyle = "warm",
      useElevenLabs = true 
    } = await req.json();

    if (!text || text.trim().length === 0) {
      throw new Error("Le texte est requis");
    }

    // Get voice configuration
    const voice = ELEVENLABS_VOICES[voiceKey as keyof typeof ELEVENLABS_VOICES] || ELEVENLABS_VOICES.lily;
    
    let audioBuffer: ArrayBuffer;

    if (useElevenLabs) {
      try {
        console.log(`Generating audio with ElevenLabs voice: ${voice.name}`);
        audioBuffer = await generateWithElevenLabs(text, voice.id, narratorStyle);
      } catch (error) {
        console.error("ElevenLabs failed, trying fallback:", error);
        audioBuffer = await generateWithFallbackTTS(text, voice.id);
      }
    } else {
      // Use fallback TTS directly
      console.log(`Using fallback TTS with voice: ${voice.name}`);
      audioBuffer = await generateWithFallbackTTS(text, voice.id);
    }

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Generate chapter audio error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erreur inconnue",
        voices: Object.keys(ELEVENLABS_VOICES)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
