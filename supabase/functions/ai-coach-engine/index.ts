import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an AI Wellness Coach analyzing user habit and trigger data. Your role is to:

1. **Habit Analysis**: Review habit completion rates and suggest simplified versions for struggling habits (e.g., "Read 1 hour" → "Read 15 minutes")
2. **Trigger Pattern Detection**: Identify when triggers occur most frequently (day/time patterns) and common emotional/situational causes
3. **Actionable Insights**: Provide practical, encouraging recommendations

Response Format (JSON):
{
  "habit_adaptations": [
    {
      "habit_title": "string",
      "current_completion_rate": number,
      "issue": "string",
      "suggested_change": "string",
      "reason": "string"
    }
  ],
  "trigger_patterns": [
    {
      "pattern": "string (e.g., 'Tuesday evenings 6-8 PM')",
      "frequency": "string",
      "common_emotions": ["string"],
      "common_situations": ["string"],
      "prevention_tip": "string"
    }
  ],
  "summary": "string (2-3 sentences summarizing key findings)",
  "top_recommendations": ["string", "string", "string"]
}

Be warm, supportive, and non-judgmental. Focus on progress, not perfection.`;

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

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user_id = claimsData.claims.sub as string;

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date range (last 4 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 4);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log("Fetching user data for AI analysis");

    // Fetch habits and their logs
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id, title, description, frequency')
      .eq('user_id', user_id)
      .eq('is_active', true);

    if (habitsError) throw habitsError;

    // Fetch habit logs for the period
    const { data: habitLogs, error: logsError } = await supabase
      .from('habit_logs')
      .select('habit_id, completed_at')
      .eq('user_id', user_id)
      .gte('completed_at', startDateStr)
      .lte('completed_at', endDateStr);

    if (logsError) throw logsError;

    // Fetch trigger logs for the period
    const { data: triggerLogs, error: triggersError } = await supabase
      .from('trigger_logs')
      .select('*')
      .eq('user_id', user_id)
      .gte('logged_at', startDate.toISOString())
      .lte('logged_at', endDate.toISOString());

    if (triggersError) throw triggersError;

    // Calculate completion rates for each habit
    const habitStats = (habits || []).map(habit => {
      const completions = (habitLogs || []).filter(log => log.habit_id === habit.id).length;
      const expectedDays = 4; // Last 4 days
      const completionRate = Math.round((completions / expectedDays) * 100);
      
      return {
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency,
        completions_last_4_days: completions,
        completion_rate: completionRate,
      };
    });

    // Format trigger data for analysis
    const triggerData = (triggerLogs || []).map(log => ({
      logged_at: log.logged_at,
      emotion: log.emotion,
      situation: log.situation,
      time_context: log.time_context,
      impulse_intensity: log.impulse_intensity,
      was_alone: log.was_alone,
      notes: log.notes,
    }));

    // Prepare prompt for Groq
    const analysisPrompt = `
Analyze this user's wellness data from the last 4 days:

## Habits Performance:
${JSON.stringify(habitStats, null, 2)}

## Trigger Logs:
${triggerLogs?.length ? JSON.stringify(triggerData, null, 2) : 'No triggers logged in this period.'}

Please analyze patterns and provide actionable insights. Focus on:
1. Habits with completion rates below 50% that might need simplification
2. Trigger timing patterns (days/times when they occur most)
3. Common emotional and situational triggers
4. Practical recommendations for improvement

Return your analysis as valid JSON matching the format specified in the system prompt.`;

    console.log("Sending request to Groq API");

    // Call Groq API (OpenAI-compatible)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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

    console.log("Received analysis from Groq");

    // Parse the JSON response
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
        user_id,
        insight_type: 'full_report',
        title: 'Your 4-Day Wellness Report',
        summary: analysis.summary || 'Analysis complete',
        detailed_analysis: {
          habit_adaptations: analysis.habit_adaptations || [],
          trigger_patterns: analysis.trigger_patterns || [],
        },
        recommendations: analysis.top_recommendations || [],
        period_start: startDateStr,
        period_end: endDateStr,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to store insight:", insertError);
      throw insertError;
    }

    console.log("Insight stored successfully:", insight.id);

    return new Response(JSON.stringify({ 
      success: true, 
      insight_id: insight.id,
      summary: analysis.summary,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Coach Engine error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
