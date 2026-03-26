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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        headers: jsonHeaders,
        status: 401,
      });
    }

    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseAnonKey = getRequiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user?.email) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: jsonHeaders,
        status: 401,
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (isAdmin) {
      return new Response(
        JSON.stringify({
          subscribed: true,
          status: "active",
          isAdmin: true,
        }),
        { headers: jsonHeaders },
      );
    }

    const stripe = createStripeClient();
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false, status: "free" }), {
        headers: jsonHeaders,
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      return new Response(
        JSON.stringify({
          subscribed: true,
          status: "active",
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        }),
        { headers: jsonHeaders },
      );
    }

    return new Response(JSON.stringify({ subscribed: false, status: "free" }), {
      headers: jsonHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    console.error("Error checking subscription:", message);

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