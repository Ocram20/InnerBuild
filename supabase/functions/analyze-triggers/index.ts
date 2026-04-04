import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
};

interface TriggerLog {
  id: string;
  logged_at: string;
  impulse_intensity: number;
  emotion: string;
  situation: string;
  time_context: string;
  location_context: string | null;
  was_alone: boolean;
  notes: string | null;
}

function baseLanguage(code: string | undefined): string {
  return (code || "en").split("-")[0];
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    // Create auth client to verify the user
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

    // Use the authenticated user's ID - never trust userId from request body
    const userId = user.id;

    // Create service client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch last 30 days of trigger logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs, error: logsError } = await supabase
      .from("trigger_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", thirtyDaysAgo.toISOString())
      .order("logged_at", { ascending: false });

    if (logsError) throw logsError;

    if (!logs || logs.length < 3) {
      return new Response(
        JSON.stringify({ 
          insights: [],
          message: "Not enough data to generate insights. Keep logging your triggers."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse language from request body
    const reqBody = await req.json().catch(() => ({}));
    const language = baseLanguage(reqBody.language);

    // Analyze patterns locally first
    const patterns = analyzePatterns(logs as TriggerLog[], language);

    // If we have Lovable AI, generate deeper insights
    let aiInsights: string[] = [];
    if (lovableApiKey && logs.length >= 5) {
      try {
        aiInsights = await generateAIInsights(lovableApiKey, logs as TriggerLog[], patterns, language);
      } catch (e) {
        console.error("AI insight generation failed:", e);
      }
    }

    // Combine local patterns with AI insights
    const allInsights = [
      ...patterns.map(p => ({
        insight_type: p.type,
        title: p.title,
        description: p.description,
        pattern_data: p.data,
      })),
      ...aiInsights.map(insight => ({
        insight_type: "suggestion",
        title: language === "it" ? "Suggerimento AI" : "AI Suggestion",
        description: insight,
        pattern_data: null,
      })),
    ];

    // Store insights in database (replace old ones)
    await supabase
      .from("trigger_insights")
      .delete()
      .eq("user_id", userId);

    if (allInsights.length > 0) {
      await supabase
        .from("trigger_insights")
        .insert(allInsights.map(i => ({
          user_id: userId,
          ...i,
        })));
    }

    // Fetch updated insights
    const { data: savedInsights } = await supabase
      .from("trigger_insights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return new Response(
      JSON.stringify({ 
        insights: savedInsights || [],
        patterns,
        logsCount: logs.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-triggers function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface PatternResult {
  type: "pattern" | "warning" | "suggestion";
  title: string;
  description: string;
  data: Record<string, unknown>;
}

function analyzePatterns(logs: TriggerLog[], language: string): PatternResult[] {
  const patterns: PatternResult[] = [];
  const isIt = language === "it";

  // Time pattern analysis
  const timeContextCounts: Record<string, { count: number; avgIntensity: number; intensities: number[] }> = {};
  const emotionCounts: Record<string, number> = {};
  const situationCounts: Record<string, number> = {};
  const aloneCounts = { alone: 0, notAlone: 0 };
  const hourCounts: Record<number, number> = {};
  const dayOfWeekCounts: Record<number, number> = {};

  for (const log of logs) {
    if (!timeContextCounts[log.time_context]) {
      timeContextCounts[log.time_context] = { count: 0, avgIntensity: 0, intensities: [] };
    }
    timeContextCounts[log.time_context].count++;
    timeContextCounts[log.time_context].intensities.push(log.impulse_intensity);

    emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
    situationCounts[log.situation] = (situationCounts[log.situation] || 0) + 1;

    if (log.was_alone) aloneCounts.alone++;
    else aloneCounts.notAlone++;

    const hour = new Date(log.logged_at).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;

    const dayOfWeek = new Date(log.logged_at).getDay();
    dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;
  }

  for (const tc of Object.keys(timeContextCounts)) {
    const data = timeContextCounts[tc];
    data.avgIntensity = data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length;
  }

  const peakTime = Object.entries(timeContextCounts)
    .sort((a, b) => b[1].count - a[1].count)[0];
  
  if (peakTime && peakTime[1].count >= 2) {
    const timeLabel = getTimeLabel(peakTime[0], isIt);
    patterns.push({
      type: "pattern",
      title: isIt ? `Picco ${timeLabel}` : `Peak ${timeLabel}`,
      description: isIt 
        ? `Hai registrato ${peakTime[1].count} impulsi ${timeLabel} (intensità media: ${peakTime[1].avgIntensity.toFixed(1)}/10). Questo è il tuo momento più vulnerabile.`
        : `You logged ${peakTime[1].count} impulses ${timeLabel} (avg intensity: ${peakTime[1].avgIntensity.toFixed(1)}/10). This is your most vulnerable time.`,
      data: { timeContext: peakTime[0], count: peakTime[1].count, avgIntensity: peakTime[1].avgIntensity },
    });
  }

  const topEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topEmotion && topEmotion[1] >= 2) {
    patterns.push({
      type: "pattern",
      title: isIt ? `Emozione dominante: ${topEmotion[0]}` : `Dominant emotion: ${topEmotion[0]}`,
      description: isIt
        ? `"${topEmotion[0]}" appare in ${topEmotion[1]} dei tuoi ${logs.length} log. Lavorare su questa emozione potrebbe aiutarti.`
        : `"${topEmotion[0]}" appears in ${topEmotion[1]} of your ${logs.length} logs. Working on this emotion could help.`,
      data: { emotion: topEmotion[0], count: topEmotion[1] },
    });
  }

  const alonePercent = (aloneCounts.alone / logs.length) * 100;
  if (alonePercent >= 70 && logs.length >= 3) {
    patterns.push({
      type: "warning",
      title: isIt ? "Pattern di solitudine" : "Loneliness pattern",
      description: isIt
        ? `${alonePercent.toFixed(0)}% dei tuoi impulsi avvengono quando sei solo. Considera di pianificare attività sociali durante i momenti critici.`
        : `${alonePercent.toFixed(0)}% of your impulses happen when you're alone. Consider planning social activities during critical times.`,
      data: { alonePercent, aloneCount: aloneCounts.alone, total: logs.length },
    });
  }

  const peakHour = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (peakHour && parseInt(peakHour[0]) >= 22) {
    patterns.push({
      type: "warning",
      title: isIt ? "Rischio serale/notturno" : "Evening/night risk",
      description: isIt
        ? `Molti impulsi avvengono dopo le 22:00. Suggerimento: evita gli schermi dopo quest'ora o pratica 3 minuti di journaling prima di andare a letto.`
        : `Many impulses occur after 10 PM. Suggestion: avoid screens after this time or practice 3 minutes of journaling before bed.`,
      data: { peakHour: parseInt(peakHour[0]), count: peakHour[1] },
    });
  }

  const weekendCount = (dayOfWeekCounts[0] || 0) + (dayOfWeekCounts[6] || 0);
  const weekdayCount = logs.length - weekendCount;
  const weekendPercent = (weekendCount / logs.length) * 100;
  
  if (weekendPercent >= 50 && logs.length >= 4) {
    patterns.push({
      type: "pattern",
      title: isIt ? "Pattern del weekend" : "Weekend pattern",
      description: isIt
        ? `${weekendPercent.toFixed(0)}% degli impulsi avvengono nel weekend. Pianifica attività per sabato e domenica.`
        : `${weekendPercent.toFixed(0)}% of impulses happen on weekends. Plan activities for Saturday and Sunday.`,
      data: { weekendPercent, weekendCount, weekdayCount },
    });
  }

  return patterns;
}

function getTimeLabel(timeContext: string, isIt: boolean): string {
  const labels: Record<string, Record<string, string>> = {
    morning: { en: "in the morning", it: "di mattina" },
    afternoon: { en: "in the afternoon", it: "di pomeriggio" },
    evening: { en: "in the evening", it: "di sera" },
    night: { en: "at night", it: "di notte" },
  };
  const lang = isIt ? "it" : "en";
  return labels[timeContext]?.[lang] || timeContext;
}

async function generateAIInsights(apiKey: string, logs: TriggerLog[], localPatterns: PatternResult[], language: string): Promise<string[]> {
  const summary = {
    totalLogs: logs.length,
    avgIntensity: logs.reduce((a, b) => a + b.impulse_intensity, 0) / logs.length,
    topEmotions: getTopItems(logs.map(l => l.emotion), 3),
    topSituations: getTopItems(logs.map(l => l.situation), 3),
    timeBreakdown: getTopItems(logs.map(l => l.time_context), 4),
    alonePercent: (logs.filter(l => l.was_alone).length / logs.length) * 100,
    localPatterns: localPatterns.map(p => p.title),
  };

  const lang = languageName(language);
  const systemPrompt = `You are a recovery coach for addictions. Analyze the user's trigger patterns and generate 2-3 practical, actionable suggestions.

Rules:
- Be empathetic but direct
- Suggest specific actions (e.g., "3 minutes of breathing", "call a friend", "micro-exercise")
- Reference the user's specific patterns
- Each suggestion should be brief (1-2 sentences)
- Don't repeat already identified patterns, add value
- IMPORTANT: Respond entirely in ${lang}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the user's data:\n${JSON.stringify(summary, null, 2)}\n\nGenerate 2-3 practical suggestions.` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "provide_suggestions",
            description: "Provide practical suggestions for the user",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of 2-3 practical suggestions",
                },
              },
              required: ["suggestions"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "provide_suggestions" } },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI error:", response.status, text);
    return [];
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    try {
      const args = JSON.parse(toolCall.function.arguments);
      return args.suggestions || [];
    } catch {
      return [];
    }
  }

  return [];
}

function getTopItems(items: string[], limit: number): { item: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([item, count]) => ({ item, count }));
}
