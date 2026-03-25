import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getSystemPrompt(language: string) {
  const langInstruction = language === "it"
    ? "IMPORTANT: You MUST respond entirely in Italian. All text fields (summary, cause, description, frequency, when, likely_reason, for_cause, strategy, why_it_helps, encouragement) must be written in Italian."
    : "Respond in English.";

  return `You are an AI Coach analyzing user trigger data for addiction recovery. Your role is to:

1. **Identify main causes**: What emotions and situations trigger urges most often?
2. **Detect timing patterns**: When do triggers occur (day of week, time of day)?
3. **Provide solutions**: Suggest practical prevention strategies for each pattern

${langInstruction}

Response Format (JSON):
{
  "main_causes": [
    {
      "cause": "string (e.g., 'Stress from work')",
      "frequency": "string (e.g., '45% of triggers')",
      "description": "string (brief explanation)"
    }
  ],
  "timing_patterns": [
    {
      "when": "string (e.g., 'Tuesday evenings 6-8 PM')",
      "frequency": "string (e.g., 'Occurs 3x per week')",
      "likely_reason": "string"
    }
  ],
  "solutions": [
    {
      "for_cause": "string (which cause this addresses)",
      "strategy": "string (practical action to take)",
      "why_it_helps": "string"
    }
  ],
  "summary": "string (2-3 sentences summarizing findings)",
  "encouragement": "string (supportive message)"
}

Be warm, supportive, and non-judgmental. Focus on understanding patterns, not blame.`;
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

    const { language = "en" } = await req.json().catch(() => ({}));

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user can generate a new report (4-day cooldown)
    const { data: lastReport } = await supabase
      .from('ai_insights')
      .select('created_at')
      .eq('user_id', userId)
      .eq('insight_type', 'trigger_report')
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

    console.log(`Fetching trigger data for user ${userId}`);

    // Fetch trigger logs for the period
    const { data: triggerLogs, error: triggersError } = await supabase
      .from('trigger_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', startDate.toISOString())
      .lte('logged_at', endDate.toISOString());

    if (triggersError) throw triggersError;

    if (!triggerLogs || triggerLogs.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No trigger logs found in the last 4 days. Log some triggers first!' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format trigger data for analysis
    const triggerData = triggerLogs.map(log => ({
      logged_at: log.logged_at,
      day_of_week: new Date(log.logged_at).toLocaleDateString('en-US', { weekday: 'long' }),
      hour: new Date(log.logged_at).getHours(),
      emotion: log.emotion,
      situation: log.situation,
      time_context: log.time_context,
      impulse_intensity: log.impulse_intensity,
      was_alone: log.was_alone,
      location_context: log.location_context,
      notes: log.notes,
    }));

    // Prepare prompt for Groq
    const analysisPrompt = `
Analyze this user's trigger data from the last 4 days:

## Trigger Logs (${triggerLogs.length} entries):
${JSON.stringify(triggerData, null, 2)}

Please analyze and identify:
1. The main causes/emotions that trigger urges
2. When triggers occur most (day/time patterns)
3. Practical solutions for each identified cause

Return your analysis as valid JSON matching the format specified.`;

    console.log("Sending request to Groq API for trigger analysis");

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

    console.log("Received trigger analysis from Groq");

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      console.error("Failed to parse Groq response:", analysisText);
      throw new Error("Failed to parse AI response");
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Store the insight in the database
    const { data: insight, error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        insight_type: 'trigger_report',
        title: 'Your Trigger Analysis Report',
        summary: analysis.summary || 'Analysis complete',
        detailed_analysis: {
          main_causes: analysis.main_causes || [],
          timing_patterns: analysis.timing_patterns || [],
          solutions: analysis.solutions || [],
          encouragement: analysis.encouragement || '',
        },
        recommendations: (analysis.solutions || []).map((s: { strategy: string }) => s.strategy),
        period_start: startDateStr,
        period_end: endDateStr,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to store insight:", insertError);
      throw insertError;
    }

    console.log("Trigger report stored successfully:", insight.id);

    return new Response(JSON.stringify({ 
      success: true, 
      insight_id: insight.id,
      summary: analysis.summary,
      encouragement: analysis.encouragement,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Trigger Report error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
