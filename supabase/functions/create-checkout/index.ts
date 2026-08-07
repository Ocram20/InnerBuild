// @ts-nocheck
declare const Deno: any;

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

const supportedLocales = ["it", "en", "de", "fr", "es", "ru", "ro", "pt", "zh"] as const;
type SupportedLocale = (typeof supportedLocales)[number];

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

const getStripeLocale = (locale: unknown): Stripe.Checkout.SessionCreateParams.Locale | "auto" => {
  if (typeof locale !== "string") return "auto";
  const baseLocale = locale.toLowerCase().split("-")[0];
  if (!supportedLocales.includes(baseLocale as SupportedLocale)) return "auto";
  if (baseLocale === "pt") return "pt-BR";
  if (baseLocale === "zh") return "zh";
  return baseLocale as Stripe.Checkout.SessionCreateParams.Locale;
};

const getCheckoutCopy = (locale: unknown) => {
  const baseLocale = typeof locale === "string" ? locale.toLowerCase().split("-")[0] : "en";
  switch (baseLocale) {
    case "it":
      return {
        name: "Abbonamento InnerBuild Pro",
        description:
          "Accesso completo a InnerBuild Pro: abitudini illimitate, sfide detox, strumenti premium, trigger tracking, Porn Recovery, AI Coach e sezione Impara.",
      };
    case "de":
      return {
        name: "InnerBuild Pro Abonnement",
        description:
          "Voller Zugriff auf InnerBuild Pro: unbegrenzte Gewohnheiten, Detox-Challenges, Premium-Tools, Trigger-Tracking, Porn Recovery, KI-Coach und Lernbereich.",
      };
    case "fr":
      return {
        name: "Abonnement InnerBuild Pro",
        description:
          "Acces complet a InnerBuild Pro : habitudes illimitees, defis detox, outils premium, suivi des declencheurs, Porn Recovery, coach IA et section Apprendre.",
      };
    case "es":
      return {
        name: "Suscripcion InnerBuild Pro",
        description:
          "Acceso completo a InnerBuild Pro: habitos ilimitados, desafios detox, herramientas premium, seguimiento de disparadores, Porn Recovery, coach IA y seccion Aprende.",
      };
    case "pt":
      return {
        name: "Assinatura InnerBuild Pro",
        description:
          "Acesso completo ao InnerBuild Pro: habitos ilimitados, desafios detox, ferramentas premium, rastreio de gatilhos, Porn Recovery, coach IA e secao Aprender.",
      };
    case "ru":
      return {
        name: "Podpiska InnerBuild Pro",
        description:
          "Polnyy dostup k InnerBuild Pro: neogranichennye privychki, detox-vyzovy, premium-instrumenty, otslezhivanie triggerov, Porn Recovery, AI-kouch i razdel obucheniya.",
      };
    case "ro":
      return {
        name: "Abonament InnerBuild Pro",
        description:
          "Acces complet la InnerBuild Pro: obiceiuri nelimitate, provocari detox, instrumente premium, monitorizare declansatori, Porn Recovery, coach AI si sectiunea Invatare.",
      };
    case "zh":
      return {
        name: "InnerBuild Pro Dingyue",
        description:
          "Quan bu fangwen InnerBuild Pro: wuxian xiguan, jiedu tiaozhan, gaoji gongju, chufa genzong, Porn Recovery, AI jiaolian he xuexi banqu.",
      };
    default:
      return {
        name: "InnerBuild Pro Subscription",
        description:
          "Full access to InnerBuild Pro: unlimited habits, detox challenges, premium tools, trigger tracking, Porn Recovery, AI coach, and Learn section.",
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json().catch(() => ({}));
    const checkoutLocale = getStripeLocale(requestBody?.locale);

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

    const checkoutCopy = getCheckoutCopy(requestBody?.locale);

    const { origin } = new URL(req.url);
    const baseUrl = req.headers.get("origin") || origin;

    const isAnnual = Boolean(requestBody?.isAnnual);
    const couponId = requestBody?.couponId || Deno.env.get("STRIPE_ANNUAL_COUPON_ID") || "n6FBk13r";
    const productId = Deno.env.get("STRIPE_PRODUCT_ID")?.trim();
    const priceId = requestBody?.priceId || Deno.env.get("STRIPE_PRICE_ID")?.trim();

    let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;

    if (priceId) {
      lineItem = { price: priceId, quantity: 1 };
    } else if (productId) {
      lineItem = {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: 999,
          recurring: { interval: "month" },
          product: productId,
        },
      };
    } else {
      lineItem = {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: 999,
          recurring: { interval: "month" },
          product_data: {
            name: checkoutCopy.name,
            description: checkoutCopy.description,
          },
        },
      };
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [lineItem],
      mode: "subscription",
      locale: checkoutLocale,
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
    };

    if (isAnnual && couponId) {
      try {
        sessionParams.discounts = [{ coupon: couponId }];
        const session = await stripe.checkout.sessions.create(sessionParams);
        return new Response(JSON.stringify({ url: session.url }), {
          headers: jsonHeaders,
          status: 200,
        });
      } catch (couponError: any) {
        console.warn("Checkout with coupon failed, attempting promotion_code:", couponError?.message);
        try {
          const promoParams = { ...sessionParams, discounts: [{ promotion_code: couponId }] };
          const session = await stripe.checkout.sessions.create(promoParams);
          return new Response(JSON.stringify({ url: session.url }), {
            headers: jsonHeaders,
            status: 200,
          });
        } catch (promoError: any) {
          console.error("Checkout with discount failed:", couponError?.message);
          throw couponError;
        }
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

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