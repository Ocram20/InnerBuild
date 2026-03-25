import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SubscriptionStatus {
  subscribed: boolean;
  status: "free" | "active" | "canceled" | "past_due";
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

type UseSubscriptionOptions = {
  enabled?: boolean;
};

export function useSubscription(options: UseSubscriptionOptions = {}) {
  const enabled = options.enabled ?? true;
  const { session, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    status: "free",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setSubscription({ subscribed: false, status: "free" });
      setLoading(false);
      return;
    }

    // Wait for auth to finish loading before checking subscription
    if (authLoading) {
      return;
    }

    if (!session?.access_token) {
      setSubscription({ subscribed: false, status: "free" });
      setLoading(false);
      return;
    }

    checkSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, authLoading, enabled]);

  const checkSubscription = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      // Handle auth errors gracefully - user might have logged out or session expired
      if (error) {
        console.warn("Subscription check failed:", error);
        setSubscription({ subscribed: false, status: "free" });
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.warn("Error checking subscription:", error);
      // Default to free on error so user isn't stuck
      setSubscription({ subscribed: false, status: "free" });
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async () => {
    if (!session?.access_token) {
      throw new Error("Not authenticated");
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      throw error;
    }
  };

  const openPortal = async () => {
    if (!session?.access_token) {
      throw new Error("Not authenticated");
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      throw error;
    }
  };

  return {
    subscription,
    loading,
    createCheckout,
    openPortal,
    refetch: checkSubscription,
  };
}
