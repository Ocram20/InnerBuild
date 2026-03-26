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

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const userEmail = user.email;
    const userId = user.id;

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "No email associated with account" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const stripe = createStripeClient();
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        return new Response(
          JSON.stringify({ error: "You already have an active subscription" }),
          {
            status: 400,
            headers: jsonHeaders,
          },
        );
      }
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
    }

    const products = await stripe.products.list({ active: true, limit: 100 });
    let product = products.data.find((p: { name: string }) => p.name === "InnerBuild Pro");

    if (!product) {
      product = await stripe.products.create({
        name: "InnerBuild Pro",
        description: "Full access to InnerBuild - habit tracking, detox challenges, and daily reflections",
      });
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      type: "recurring",
    });

    let price = prices.data.find(
      (p: { unit_amount: number | null; currency: string; recurring?: { interval: string } | null }) =>
        p.unit_amount === 999 && p.currency === "eur" && p.recurring?.interval === "month",
    );

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 999,
        currency: "eur",
        recurring: { interval: "month" },
      });
    }

    const { origin } = new URL(req.url);
    const baseUrl = req.headers.get("origin") || origin;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: jsonHeaders,
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    console.error("Checkout error:", message);

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