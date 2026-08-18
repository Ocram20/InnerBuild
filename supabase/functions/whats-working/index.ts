// @ts-nocheck
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
};

function baseLanguage(code: string | undefined): string {
  return (code || "en").toLowerCase().split("-")[0];
}

function languageName(code: string | undefined): string {
  const base = baseLanguage(code);
  const map: Record<string, string> = {
    en: "English",
    it: "Italian",
    zh: "Simplified Chinese",
    ru: "Russian",
    de: "German",
    fr: "French",
    es: "Spanish",
    pt: "Portuguese",
    ro: "Romanian",
  };
  return map[base] || "English";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    // Validate JWT and extract user_id from claims
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user_id = user.id;

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cooldown - only generate once per 7 days
    const { data: existing } = await supabase
      .from("ai_insights")
      .select("created_at")
      .eq("user_id", user_id)
      .eq("insight_type", "whats_working")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const daysSince = Math.floor((Date.now() - new Date(existing.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 7) {
        return new Response(JSON.stringify({ message: "Report generated recently. Next available in " + (7 - daysSince) + " days." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch last 7 days of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const [habitsRes, logsRes, triggersRes, checkinsRes, challengesRes] = await Promise.all([
      supabase.from("habits").select("id, title").eq("user_id", user_id).eq("is_active", true),
      supabase.from("habit_logs").select("habit_id, completed_at").eq("user_id", user_id).gte("completed_at", startStr),
      supabase.from("trigger_logs").select("id, emotion").eq("user_id", user_id).gte("logged_at", startDate.toISOString()),
      supabase.from("daily_checkins").select("mood").eq("user_id", user_id).gte("checkin_date", startStr),
      supabase.from("detox_challenges").select("title, status, current_streak").eq("user_id", user_id),
    ]);

    const habits = habitsRes.data || [];
    const logs = logsRes.data || [];
    const triggers = triggersRes.data || [];
    const checkins = checkinsRes.data || [];
    const challenges = challengesRes.data || [];

    // Compute completion rates
    const habitStats = habits.map(h => {
      const completions = logs.filter(l => l.habit_id === h.id).length;
      return { title: h.title, rate: Math.round((completions / 7) * 100) };
    });

    // Parse language from request body (same pattern as ai-coach-engine)
    const reqBody = await req.json().catch(() => ({}));
    const language = baseLanguage(typeof reqBody.language === "string" ? reqBody.language : undefined);
    const langName = languageName(language);

    const prompt = `You are a supportive wellness coach. Based on this user's last 7 days of data, provide exactly 3 insights in JSON.

Data:
- Habits: ${JSON.stringify(habitStats)}
- Triggers logged: ${triggers.length}
- Common emotions: ${[...new Set(triggers.map(t => t.emotion))].join(", ") || "none"}
- Mood check-ins: ${checkins.map(c => c.mood).join(", ") || "none"}
- Active challenges: ${challenges.filter(c => c.status === "active").map(c => c.title + " (" + c.current_streak + " days)").join(", ") || "none"}

Return JSON with exactly these keys:
{
  "improving": "One specific thing that is improving (1-2 sentences, warm and encouraging)",
  "protect": "One thing the user should protect/maintain (1-2 sentences)",
  "adjustment": "One small, actionable suggestion (1-2 sentences)"
}

Rules:
- Be warm, supportive, never judgmental
- Focus on progress, not perfection
- Be specific to the data, not generic
- Clinical but human tone
- CRITICAL: Write the three string values ONLY in ${langName} (language code ${language}). Do not use English, Italian, or any other language unless the target is that language. No mixed languages.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: `You output only valid JSON objects. All user-facing text in string values must be written entirely in ${langName}. Never mix languages.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", response.status, err);
      throw new Error("AI API error");
    }

    const groqData = await response.json();
    const analysis = JSON.parse(groqData.choices[0].message.content);

    // Store in ai_insights
    await supabase.from("ai_insights").insert({
      user_id,
      insight_type: "whats_working",
      title: "What's Working This Week",
      summary: analysis.improving,
      detailed_analysis: analysis,
      recommendations: [analysis.adjustment],
      period_start: startStr,
      period_end: endStr,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("whats-working error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
