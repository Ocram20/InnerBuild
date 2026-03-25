import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
};

function getSystemPrompt(language: string) {
  const langInstruction = language === "it"
    ? "IMPORTANT: You MUST respond entirely in Italian. All text fields (summary, tips, issue, reason, suggested_title, suggested_description) must be written in Italian."
    : "Respond in English.";

  return `You are an AI Wellness Coach analyzing user habit data. Your role is to:

1. **Habit Analysis**: Review habit completion rates and suggest simplified versions for struggling habits
2. **Identify patterns**: When do they complete habits most? What habits are working?
3. **Provide actionable suggestions**: For each struggling habit, suggest a simpler alternative

${langInstruction}

Response Format (JSON):
{
  "habit_suggestions": [
    {
      "habit_id": "string (the ID of the habit)",
      "habit_title": "string",
      "current_completion_rate": number,
      "issue": "string (brief description of the problem)",
      "suggested_title": "string (simplified habit title)",
      "suggested_description": "string (why this change helps)",
      "reason": "string"
    }
  ],
  "summary": "string (2-3 sentences summarizing habit performance)",
  "tips": ["string", "string"] 
}

Focus ONLY on habits. Be warm, supportive, and non-judgmental. Suggest simpler versions like:
- "Read 1 hour" → "Read 15 minutes"
- "Exercise 1 hour" → "10 minute walk"
- "Meditate 30 min" → "5 minute breathing"`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    // Validate the user token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID not found in token' }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const body = await req.json().catch(() => ({}));
    const langParsed = z.object({ language: z.enum(["en", "it"]).optional().default("en") }).safeParse(body);
    const language = langParsed.success ? langParsed.data.language : "en";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user can generate a new report (4-day cooldown)
    const { data: lastReport } = await supabase
      .from('ai_insights')
      .select('created_at')
      .eq('user_id', userId)
      .eq('insight_type', 'habit_report')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastReport) {
      const lastReportDate = new Date(lastReport.created_at);
      const daysSinceReport = Math.floor(
        (Date.now() - lastReportDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceReport < 4) {
        return new Response(JSON.stringify({ 
          error: `You can generate a new report in ${4 - daysSinceReport} day(s)`,
          next_available_in_days: 4 - daysSinceReport
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Calculate date range (last 4 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 4);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log("Fetching habit data for analysis");

    // Fetch habits
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id, title, description, frequency')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (habitsError) throw habitsError;

    if (!habits || habits.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No active habits found. Create some habits first!' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch habit logs for the period
    const { data: habitLogs, error: logsError } = await supabase
      .from('habit_logs')
      .select('habit_id, completed_at')
      .eq('user_id', userId)
      .gte('completed_at', startDateStr)
      .lte('completed_at', endDateStr);

    if (logsError) throw logsError;

    // Calculate completion rates for each habit
    const habitStats = habits.map(habit => {
      const completions = (habitLogs || []).filter(log => log.habit_id === habit.id).length;
      const expectedDays = 4;
      const completionRate = Math.round((completions / expectedDays) * 100);
      
      return {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency,
        completions_last_4_days: completions,
        completion_rate: completionRate,
      };
    });

    // Prepare prompt for Groq
    const analysisPrompt = `
Analyze this user's habit performance from the last 4 days:

## Habits Performance:
${JSON.stringify(habitStats, null, 2)}

Please analyze and provide actionable suggestions. Focus on:
1. Habits with completion rates below 50% that need simplification
2. For each struggling habit, suggest a simpler alternative title
3. Provide practical tips for improvement

IMPORTANT: Include the habit "id" field in your habit_suggestions so we can apply changes.

Return your analysis as valid JSON matching the format specified.`;

    console.log("Sending request to Groq API for habit analysis");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: getSystemPrompt(language) },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a minute." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`Groq API error: ${response.status}`);
    }

    const groqData = await response.json();
    const analysisText = groqData.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error("No response from Groq");
    }

    console.log("Received habit analysis from Groq");

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      console.error("Failed to parse Groq response:", analysisText);
      throw new Error("Failed to parse AI response");
    }

    // Store the insight in the database
    const { data: insight, error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        insight_type: 'habit_report',
        title: 'Your Habit Analysis Report',
        summary: analysis.summary || 'Analysis complete',
        detailed_analysis: {
          habit_suggestions: analysis.habit_suggestions || [],
          tips: analysis.tips || [],
        },
        recommendations: analysis.tips || [],
        period_start: startDateStr,
        period_end: endDateStr,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to store insight:", insertError);
      throw insertError;
    }

    console.log("Habit report stored successfully:", insight.id);

    return new Response(JSON.stringify({ 
      success: true, 
      insight_id: insight.id,
      summary: analysis.summary,
      habit_suggestions: analysis.habit_suggestions || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Habit Report error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
