import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const userId = claimsData.claims.sub as string;
    const { feeling, location, alone, language } = await req.json();
    const lang = language === "it" ? "Italian" : "English";

    // Fetch user's personal reasons to quit
    let reasons: string[] = [];
    try {
      const { data: reasonsData } = await supabaseClient
        .from("journal_entries")
        .select("content")
        .eq("user_id", userId)
        .eq("entry_date", "quit-reasons")
        .maybeSingle();

      if (reasonsData?.content) {
        reasons = JSON.parse(reasonsData.content);
      }
    } catch {}

    // Fetch user's anti-trigger plans
    let plans: any[] = [];
    try {
      const { data: plansData } = await supabaseClient
        .from("journal_entries")
        .select("content")
        .eq("user_id", userId)
        .eq("entry_date", "anti-trigger-plans")
        .maybeSingle();

      if (plansData?.content) {
        plans = JSON.parse(plansData.content);
      }
    } catch {}

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const prompt = `You are a calm, supportive recovery coach helping someone who is experiencing a strong urge RIGHT NOW. They need immediate, practical help.

User's current state:
- Feeling: ${feeling}
- Location: ${location}
- Alone: ${alone ? "Yes" : "No"}

${reasons.length > 0 ? `Their personal reasons to quit:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join("\n")}` : ""}

${plans.length > 0 ? `Their anti-trigger plans:\n${plans.map((p: any) => `- When "${p.trigger}" → "${p.action}"`).join("\n")}` : ""}

Provide a response in this JSON format:
{
  "immediate_actions": ["action1", "action2", "action3"],
  "personal_reminder": "A short, personalized reminder based on their reasons to quit (1-2 sentences)",
  "calming_message": "A short, calming and grounding message (2-3 sentences, warm and supportive)"
}

Rules:
- Be warm, calm, and non-judgmental
- Immediate actions should be things they can do RIGHT NOW given their location and situation
- If they're not alone, suggest involving the other person
- Reference their personal reasons if available
- Keep everything short and actionable — they're in crisis mode
- NO shame, NO lectures
- IMPORTANT: Respond entirely in ${lang}
- Respond ONLY with valid JSON`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: `You are a calm recovery coach. Respond only with valid JSON. Respond entirely in ${lang}.` },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      throw new Error("AI API error");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        immediate_actions: [
          "Step away from your device and go to another room",
          "Splash cold water on your face or take a cold shower",
          "Call or text someone you trust right now",
        ],
        personal_reminder: reasons.length > 0
          ? `Remember why you started: ${reasons[0]}`
          : "You chose this path because you want a better life. That choice still matters.",
        calming_message: "This urge is temporary — it will pass in 15-20 minutes. You've been through this before and come out stronger. Take it one breath at a time.",
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Emergency urge error:", error);
    return new Response(
      JSON.stringify({
        immediate_actions: [
          "Leave the room you're in right now",
          "Splash cold water on your face",
          "Do 20 push-ups or jumping jacks",
        ],
        personal_reminder: "You are stronger than this moment. Your future self will thank you.",
        calming_message: "This urge is intense but temporary. It will peak and pass within 15-20 minutes. You don't have to act on it — just breathe and ride the wave.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
