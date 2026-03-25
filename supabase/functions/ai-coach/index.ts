import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
};

const BASE_SYSTEM_PROMPT = `You are a warm, supportive AI coach specialized EXCLUSIVELY in personal growth, habit building, addiction recovery, and mental wellness. You are part of an app that helps users build positive habits, break negative patterns (including porn addiction recovery), track triggers, and cultivate self-awareness.

## STRICT TOPIC BOUNDARIES
You MUST ONLY discuss topics related to:
- Habit building, tracking, and improvement
- Personal growth and self-improvement
- Addiction recovery (especially porn/dopamine detox)
- Mental health, mindfulness, and emotional regulation
- Motivation, discipline, and goal setting
- Trigger management and craving control
- Reflection, journaling, and self-awareness
- Sleep, exercise, and healthy lifestyle habits
- Stress management and coping strategies

If the user asks about ANYTHING outside these topics (sports results, news, politics, entertainment, coding, recipes, trivia, etc.), respond warmly but redirect:
"I appreciate the curiosity! 😊 But I'm specifically designed to help you with your personal growth journey. Is there anything about your habits, challenges, or wellbeing I can help with?"

## YOUR ROLE
1. **Motivate**: Celebrate wins (big and small), encourage persistence, reference their actual data
2. **Reflect**: Ask thoughtful questions based on their real patterns and behaviors
3. **Guide**: Offer practical, actionable advice tailored to THEIR specific situation
4. **Support**: Be empathetic during setbacks, help reframe challenges as learning opportunities
5. **Analyze**: When asked, provide insights based on their habit completion rates, trigger patterns, recovery progress

## RESPONSE STYLE
- Warm, encouraging, non-judgmental tone
- Reference the user's actual data when relevant (habits, streaks, triggers, recovery phase)
- Keep responses concise (2-4 paragraphs) unless more detail is requested
- Use occasional emojis sparingly
- Speak in the same language the user writes in`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
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

    const userId = claimsData.claims.sub as string;
    const body = await req.json();
    const MessagesSchema = z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(5000),
      })).min(1).max(30),
    });
    const parsed = MessagesSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { messages } = parsed.data;

    // Fetch user context data in parallel
    const [
      habitsRes,
      habitLogsRes,
      challengesRes,
      triggersRes,
      recoveryRes,
      checkInsRes,
      debriefsRes,
      reflectionsRes,
      checkinsRes,
    ] = await Promise.all([
      supabaseClient.from("habits").select("title, category, frequency, is_active").eq("user_id", userId),
      supabaseClient.from("habit_logs").select("habit_id, completed_at").eq("user_id", userId).order("completed_at", { ascending: false }).limit(50),
      supabaseClient.from("detox_challenges").select("title, category, status, current_streak, longest_streak, duration_days, start_date").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      supabaseClient.from("trigger_logs").select("emotion, situation, time_context, impulse_intensity, logged_at").eq("user_id", userId).order("logged_at", { ascending: false }).limit(20),
      supabaseClient.from("recovery_journey").select("started_at, is_active").eq("user_id", userId).eq("is_active", true).maybeSingle(),
      supabaseClient.from("recovery_checkins").select("status, checkin_date").eq("user_id", userId).order("checkin_date", { ascending: false }).limit(30),
      supabaseClient.from("failure_debriefs").select("trigger, mood, time_of_day, context, is_completed, debrief_date").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabaseClient.from("daily_reflections").select("day_summary, grateful_for, lessons_learned, reflection_date").eq("user_id", userId).order("reflection_date", { ascending: false }).limit(5),
      supabaseClient.from("daily_checkins").select("mood, energy_level, checkin_date").eq("user_id", userId).order("checkin_date", { ascending: false }).limit(7),
    ]);

    // Build user context summary
    const habits = habitsRes.data || [];
    const habitLogs = habitLogsRes.data || [];
    const challenges = challengesRes.data || [];
    const triggers = triggersRes.data || [];
    const recovery = recoveryRes.data;
    const recoveryCheckIns = checkInsRes.data || [];
    const debriefs = debriefsRes.data || [];
    const reflections = reflectionsRes.data || [];
    const moodCheckins = checkinsRes.data || [];

    let contextBlock = "\n\n## USER'S CURRENT DATA (use this to personalize your responses)\n";

    // Habits
    const activeHabits = habits.filter(h => h.is_active);
    if (activeHabits.length > 0) {
      contextBlock += `\n### Active Habits (${activeHabits.length})\n`;
      activeHabits.forEach(h => {
        const completions = habitLogs.filter(l => l.habit_id === (h as any).id).length;
        contextBlock += `- "${h.title}" (${h.category}, ${h.frequency})\n`;
      });
      contextBlock += `Recent completions logged: ${habitLogs.length} in recent history\n`;
    } else {
      contextBlock += "\n### Habits: No active habits yet\n";
    }

    // Challenges
    if (challenges.length > 0) {
      contextBlock += `\n### Detox Challenges\n`;
      challenges.forEach(c => {
        contextBlock += `- "${c.title}" (${c.category}) — Status: ${c.status}, Streak: ${c.current_streak}/${c.duration_days} days, Best: ${c.longest_streak}\n`;
      });
    }

    // Triggers
    if (triggers.length > 0) {
      const emotions = [...new Set(triggers.map(t => t.emotion))];
      const situations = [...new Set(triggers.map(t => t.situation))];
      const avgIntensity = Math.round(triggers.reduce((s, t) => s + t.impulse_intensity, 0) / triggers.length);
      contextBlock += `\n### Recent Triggers (${triggers.length} logged)\n`;
      contextBlock += `- Common emotions: ${emotions.slice(0, 5).join(", ")}\n`;
      contextBlock += `- Common situations: ${situations.slice(0, 5).join(", ")}\n`;
      contextBlock += `- Average impulse intensity: ${avgIntensity}/10\n`;
    }

    // Recovery Journey
    if (recovery) {
      const successes = recoveryCheckIns.filter(c => c.status === "success").length;
      const failures = recoveryCheckIns.filter(c => c.status === "failed").length;
      contextBlock += `\n### Porn Recovery Journey (active since ${recovery.started_at})\n`;
      contextBlock += `- Clean days logged: ${successes}, Setbacks: ${failures}\n`;

      // Recent consecutive failures
      let consecutive = 0;
      for (const ci of recoveryCheckIns) {
        if (ci.status === "failed") consecutive++;
        else break;
      }
      if (consecutive > 0) {
        contextBlock += `- ⚠️ Recent consecutive setbacks: ${consecutive}\n`;
      }
    }

    // Debriefs
    if (debriefs.length > 0) {
      const completedDebriefs = debriefs.filter(d => d.is_completed);
      contextBlock += `\n### Failure Debriefs: ${completedDebriefs.length} completed out of ${debriefs.length}\n`;
      if (completedDebriefs.length > 0) {
        const commonTriggers = [...new Set(completedDebriefs.map(d => d.trigger).filter(Boolean))];
        if (commonTriggers.length > 0) {
          contextBlock += `- Common failure triggers: ${commonTriggers.join(", ")}\n`;
        }
      }
    }

    // Mood
    if (moodCheckins.length > 0) {
      contextBlock += `\n### Recent Mood (last ${moodCheckins.length} days)\n`;
      moodCheckins.slice(0, 5).forEach(m => {
        contextBlock += `- ${m.checkin_date}: ${m.mood} (energy: ${m.energy_level}/5)\n`;
      });
    }

    // Reflections
    if (reflections.length > 0) {
      contextBlock += `\n### Recent Reflections\n`;
      reflections.slice(0, 3).forEach(r => {
        if (r.day_summary) contextBlock += `- ${r.reflection_date}: "${r.day_summary.slice(0, 100)}..."\n`;
      });
    }

    const fullSystemPrompt = BASE_SYSTEM_PROMPT + contextBlock;

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    console.log("Sending request to Groq API with", messages.length, "messages and user context");

    const groqMessages = [
      { role: "system", content: fullSystemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 403 || response.status === 401) {
        return new Response(JSON.stringify({ error: "API key invalid or quota exceeded." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ response: responseText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI coach error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
