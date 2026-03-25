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

const DETOX_PHASES = [
  { id: "acute", name: "Acute Phase", startDay: 1, endDay: 14, description: "Your brain is adjusting to the absence of excessive dopamine stimulation. Cravings are intense but temporary." },
  { id: "stabilization", name: "Stabilization", startDay: 15, endDay: 45, description: "Things start to stabilize. Cravings become less intense, and you begin to see glimpses of clarity." },
  { id: "reconstruction", name: "Reconstruction", startDay: 46, endDay: 90, description: "Your brain is actively rebuilding. Dopamine receptors regenerate, and natural pleasure returns." },
  { id: "consolidation", name: "Consolidation", startDay: 91, endDay: 999, description: "New neural pathways are solidified. Recovery becomes your new normal." },
];

function getPhaseForDay(dayNumber: number) {
  for (const phase of DETOX_PHASES) {
    if (dayNumber >= phase.startDay && dayNumber <= phase.endDay) return phase;
  }
  return DETOX_PHASES[DETOX_PHASES.length - 1];
}

const SYSTEM_PROMPT = `You are a supportive, warm detox coach guiding someone through a recovery challenge. Your tone is calm, human, and encouraging — never clinical or gamified.

You will receive:
- The challenge title and description
- The current day number and total duration
- The current detox phase and its description
- The user's past check-in history (responses and any failures)

Generate content for TODAY in this exact JSON format:
{
  "coach_message": "A short (2-3 sentences), human, supportive message explaining what the user may experience during this phase/day. Personalize based on their history.",
  "mental_mission": "One mental/mindset mission for today (awareness, reflection, gratitude, etc.)",
  "behavioral_mission": "One concrete behavioral action for today (exercise, journaling, cold shower, etc.)"
}

Rules:
- Adapt tone based on history: if the user had recent failures, be extra compassionate. If they're on a streak, be encouraging but grounded.
- Reference the phase naturally ("You're in the stabilization phase now...")
- Keep missions achievable and varied day to day
- Never use XP, points, levels, or gamification language
- Be genuinely human and warm`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user_id = claimsData.claims.sub as string;
    const body = await req.json();
    const RequestSchema = z.object({
      challenge_id: z.string().uuid(),
      day_number: z.number().int().min(1).max(365),
    });
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request data" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { challenge_id, day_number } = parsed.data;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if content already exists for this day
    const { data: existing } = await supabase
      .from('challenge_daily_entries')
      .select('*')
      .eq('challenge_id', challenge_id)
      .eq('day_number', day_number)
      .single();

    if (existing?.coach_message) {
      return new Response(JSON.stringify({ entry: existing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('detox_challenges')
      .select('*')
      .eq('id', challenge_id)
      .eq('user_id', user_id)
      .single();

    if (challengeError || !challenge) {
      return new Response(JSON.stringify({ error: 'Challenge not found' }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch past entries for context
    const { data: pastEntries } = await supabase
      .from('challenge_daily_entries')
      .select('day_number, checkin_response, is_failure, phase_name')
      .eq('challenge_id', challenge_id)
      .order('day_number', { ascending: false })
      .limit(7);

    const phase = getPhaseForDay(day_number);

    const prompt = `Challenge: "${challenge.title}"
Description: ${challenge.description || 'A personal detox challenge'}
Day: ${day_number} of ${challenge.duration_days}
Current Phase: ${phase.name} (${phase.description})

Recent history (last 7 days):
${pastEntries?.length ? pastEntries.map(e => 
  `Day ${e.day_number}: ${e.checkin_response || 'no check-in'}${e.is_failure ? ' (setback)' : ''}`
).join('\n') : 'No previous entries yet — this is the beginning of the journey.'}

Generate today's content.`;

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
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 512,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Groq API error: ${response.status}`);
    }

    const groqData = await response.json();
    const content = groqData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No response from Groq");

    let parsed;
    try { parsed = JSON.parse(content); } catch {
      throw new Error("Failed to parse AI response");
    }

    // Upsert the daily entry
    const { data: entry, error: upsertError } = await supabase
      .from('challenge_daily_entries')
      .upsert({
        challenge_id,
        user_id,
        day_number,
        phase_name: phase.name,
        coach_message: parsed.coach_message,
        mental_mission: parsed.mental_mission,
        behavioral_mission: parsed.behavioral_mission,
      }, { onConflict: 'challenge_id,day_number' })
      .select()
      .single();

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ entry }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Challenge daily content error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
