import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
};

const RequestSchema = z.object({
  phase_id: z.string().max(50),
  phase_name: z.string().max(100),
  effective_days: z.number().int().min(0).max(9999),
  success_count: z.number().int().min(0).max(99999),
  failure_count: z.number().int().min(0).max(99999),
  debrief_count: z.number().int().min(0).max(99999),
  recent_consecutive_failures: z.number().int().min(0).max(9999).optional().default(0),
  progress_in_phase: z.number().min(0).max(100),
  language: z.enum(["en", "it"]).optional().default("en"),
});

const SYSTEM_PROMPT = `You are a compassionate, science-informed recovery coach. The user is on a porn recovery journey tracked via daily check-ins (success or setback).

You will receive their current recovery phase, effective progress days, success/failure counts, completed debriefs, recent consecutive failures, and phase progress percentage.

Your response should:
1. Acknowledge where they are in their journey with empathy (1-2 sentences)
2. If they have recent consecutive failures (2+), gently suggest they may benefit from resetting their recovery challenge to rebuild momentum — frame it as strength, not weakness. If 3+ consecutive, be more direct about it.
3. If they have any failures, normalize setbacks and explain how each one slows progress by ~2 days but never resets their journey (1-2 sentences, only if relevant)
4. Explain what's happening in their brain at this phase (2-3 sentences, accessible science)
5. Suggest 2-3 focus areas for this phase (not daily tasks, but broader life areas to work on)

Keep the tone warm, non-judgmental, and encouraging. Use "you" language. 
Total response should be 150-250 words. No markdown headers, just flowing paragraphs with line breaks between sections.

IMPORTANT: You MUST respond in the language specified by the user.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth with getClaims
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate request body with Zod
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      phase_id, phase_name, effective_days, success_count,
      failure_count, debrief_count, recent_consecutive_failures,
      progress_in_phase, language,
    } = parsed.data;

    const lang = language === "it" ? "Italian" : "English";

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured");
    }

    const userPrompt = `Current phase: ${phase_name} (${phase_id})
Effective recovery days: ${effective_days}
Progress through current phase: ${progress_in_phase}%
Successful days logged: ${success_count}
Setbacks logged: ${failure_count}
Recent consecutive failures: ${recent_consecutive_failures}
Failure debriefs completed: ${debrief_count}

Please provide a personalized phase insight for this user. Respond entirely in ${lang}.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      console.error("Groq API error:", response.status);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "Unable to generate insight at this time.";

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("recovery-phase-insight error:", error instanceof Error ? error.message : "Unknown");
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
