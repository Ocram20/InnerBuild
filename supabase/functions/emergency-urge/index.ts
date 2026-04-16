// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
// @ts-ignore
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
};

serve(async (req: Request) => {
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

    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-ignore
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const body = await req.json().catch(() => ({}));
    
    // Very permissive parsing to avoid 400 errors
    const feeling = typeof body.feeling === 'string' ? body.feeling.substring(0, 500) : "";
    const location = typeof body.location === 'string' ? body.location.substring(0, 200) : "";
    const alone = typeof body.alone === 'boolean' ? body.alone : true;
    const language = typeof body.language === 'string' ? body.language.substring(0, 10) : "en";
    
    const langMap: Record<string, string> = {
      en: "English", it: "Italian", de: "German", es: "Spanish",
      fr: "French", pt: "Portuguese", ro: "Romanian", ru: "Russian", zh: "Chinese",
    };
    const lang = langMap[language] || "English";

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

    // @ts-ignore
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const prompt = `You are a professional recovery coach helping someone experiencing a strong urge RIGHT NOW.

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

CRITICAL RULES for Coherence and Value:
1. VARIETY: Do NOT just suggest the same "take a walk, take a cold shower, call a friend" loop.
2. CONTEXT AWARENESS: 
   - If User is TIRED or EXHAUSTED: DO NOT suggest a walk, run, or intense exercise. Instead, suggest grounding, breathing, changing the room, or sensory engagement (e.g., "wash your face with cold water", "listen to a specific 5-min guided meditation").
   - If User is BORED: Suggest active engagement or a creative micro-task.
   - If User is STRESSED: Suggest specific breathing techniques (Box breathing, 4-7-8).
3. COHERENCE: The actions MUST be possible in their ${location}.
4. PERSONALIZATION: Integrate their specific "reasons to quit" into the reminder.
5. NO GENERIC LOOPS: Use the provided anti-trigger plans if they match the current feeling/context.
6. Respond entirely in ${lang}.
7. Respond ONLY with valid JSON.`;

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

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      parsedContent = {
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

    return new Response(JSON.stringify(parsedContent), {
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
