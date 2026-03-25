import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured");
    }

    const body = await req.json();
    const RequestSchema = z.object({
      debriefData: z.object({
        mood: z.string().max(100).optional(),
        time_of_day: z.string().max(50).optional(),
        context: z.string().max(500).optional(),
        trigger: z.string().max(500).optional(),
        ignored_signal: z.string().max(500).optional(),
        signal_details: z.string().max(1000).optional(),
      }),
      language: z.enum(["en", "it"]).optional().default("en"),
    });
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { debriefData, language } = parsed.data;
    const lang = language === "it" ? "Italian" : "English";

    const prompt = `You are a supportive recovery coach helping someone who had a setback. Based on their debrief, provide 3 SHORT, actionable, and encouraging suggestions for what they can do differently next time.

Context from their debrief:
- Mood: ${debriefData.mood || "not specified"}
- Time: ${debriefData.time_of_day || "not specified"}
- Context: ${debriefData.context || "not specified"}
- Trigger: ${debriefData.trigger || "not specified"}
- Signal ignored: ${debriefData.ignored_signal || "not specified"}
${debriefData.signal_details ? `- More details: ${debriefData.signal_details}` : ""}

Rules:
- Be warm, supportive, and non-judgmental
- Keep each suggestion to 1-2 sentences max
- Focus on practical, actionable steps
- Use "you" language and be encouraging
- NO shame or negative language
- IMPORTANT: Respond entirely in ${lang}
- Format as a JSON array of 3 strings

Respond ONLY with a valid JSON object: {"suggestions": ["suggestion1", "suggestion2", "suggestion3"]}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a supportive recovery coach. Always respond with valid JSON only. Respond entirely in ${lang}.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      throw new Error("Failed to get AI suggestions");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Parse the JSON response
    let suggestions: string[] = [];
    try {
      const parsed = JSON.parse(content);
      suggestions = parsed.suggestions || [];
    } catch {
      // Try to extract suggestions from text if JSON parsing fails
      console.error("Failed to parse JSON, content:", content);
      suggestions = [
        "Take a moment to practice the 5-4-3-2-1 grounding technique when you feel urges building.",
        "Set a reminder for your evening reflection to stay connected with your progress.",
        "Reach out to a friend or supportive person when you're feeling vulnerable.",
      ];
    }

    return new Response(
      JSON.stringify({ suggestions }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in debrief-suggestions:", error);
    
    // Return fallback suggestions on error
    return new Response(
      JSON.stringify({
        suggestions: [
          "Consider setting up a simple evening check-in routine to stay aware of your emotional state.",
          "When you notice early warning signs, try the HALT check: are you Hungry, Angry, Lonely, or Tired?",
          "Remember: progress isn't linear. Each day is a new opportunity to practice your recovery skills.",
        ],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
