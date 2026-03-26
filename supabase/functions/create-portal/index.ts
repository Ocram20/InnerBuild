import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

const getRequiredEnv = (name: string) => {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const createStripeClient = () => {
  const stripeApiKey = getRequiredEnv("STRIPE_API_KEY");

  if (!stripeApiKey.startsWith("sk_")) {
    throw new Error("STRIPE_API_KEY must be a Stripe secret key starting with sk_");
  }

  return new Stripe(stripeApiKey, {
    apiVersion: "2023-10-16",
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseAnonKey = getRequiredEnv("SUPABASE_ANON_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const stripe = createStripeClient();
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ error: "No customer found" }), {
        status: 404,
        headers: jsonHeaders,
      });
    }

    const { origin } = new URL(req.url);
    const baseUrl = req.headers.get("origin") || origin;

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${baseUrl}/dashboard`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: jsonHeaders,
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    console.error("Portal error:", message);

    const isConfigError =
      message.includes("Missing required environment variable") ||
      message.includes("STRIPE_API_KEY must be a Stripe secret key") ||
      message.includes("Invalid API Key provided");

    return new Response(JSON.stringify({ error: message }), {
      headers: jsonHeaders,
      status: isConfigError ? 500 : 400,
    });
  }
});
