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
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const body = await req.json().catch(() => ({}));
    const language = baseLanguage(typeof body.language === "string" ? body.language : undefined);
    const langName = languageName(language);
    const raw = Array.isArray(body.strings) ? body.strings : [];
    const strings = raw
      .filter((s: unknown) => typeof s === "string" && s.trim().length > 0)
      .map((s: string) => (s.length > 400 ? s.slice(0, 400) : s))
      .slice(0, 32);

    if (strings.length === 0) {
      return new Response(JSON.stringify({ translations: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt =
      `Translate each string into ${langName} (locale code: ${language}) for display in a wellness app UI.\n` +
      `Rules:\n` +
      `- Output JSON only with key "translations" (array of strings, same length and order as input).\n` +
      `- Preserve meaning and tone; keep names/brands if untranslatable.\n` +
      `- Do not add explanations.\n` +
      `- Use only ${langName}; no mixed languages.\n\n` +
      `Input (JSON array):\n${JSON.stringify(strings)}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You only output valid JSON. The "translations" array must match the input length exactly. Target language: ${langName}.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq translate-ui-batch:", response.status, err);
      throw new Error("AI API error");
    }

    const groqData = await response.json();
    const content = groqData.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Invalid AI response");
    }

    const parsed = JSON.parse(content) as { translations?: unknown };
    const translations = parsed.translations;
    if (!Array.isArray(translations) || translations.length !== strings.length) {
      console.error("translate-ui-batch length mismatch", strings.length, translations);
      throw new Error("Invalid translation shape");
    }

    const out = translations.map((x, i) => (typeof x === "string" && x.trim() ? x : strings[i]));

    return new Response(JSON.stringify({ translations: out }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("translate-ui-batch error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
