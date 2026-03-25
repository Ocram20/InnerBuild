import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";
import { useAdminAccess } from "./useAdminAccess";
import { supabase } from "@/integrations/supabase/client";

// Free tier limits
export const FREE_LIMITS = {
  MAX_HABITS: 5,
  MAX_TOTAL_CHALLENGES: 1, // Lifetime limit for free users
};

export function usePremiumLimits() {
  const { user, loading: authLoading } = useAuth();
  const { hasAdminRole } = useAdminAccess();
  
  const { subscription, loading: subLoading } = useSubscription({
    enabled: !!user && !hasAdminRole,
  });

  const [counts, setCounts] = useState({ habits: 0, totalChallengesCreated: 0 });
  const [countsLoading, setCountsLoading] = useState(true);

  const isPremium = hasAdminRole || subscription.subscribed;
  const loading = authLoading || (!hasAdminRole && subLoading) || countsLoading;

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) {
        setCounts({ habits: 0, totalChallengesCreated: 0 });
        setCountsLoading(false);
        return;
      }

      try {
        // Fetch habit count
        const { count: habitCount, error: habitError } = await supabase
          .from("habits")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (habitError) throw habitError;

        // Fetch lifetime challenge counter from profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("total_challenges_created")
          .eq("user_id", user.id)
          .single();

        if (profileError) throw profileError;

        setCounts({
          habits: habitCount || 0,
          totalChallengesCreated: profile?.total_challenges_created || 0,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setCountsLoading(false);
      }
    };

    fetchCounts();
  }, [user]);

  const refetch = async () => {
    if (!user) return;
    setCountsLoading(true);
    
    try {
      const { count: habitCount } = await supabase
        .from("habits")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_active", true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("total_challenges_created")
        .eq("user_id", user.id)
        .single();

      setCounts({
        habits: habitCount || 0,
        totalChallengesCreated: profile?.total_challenges_created || 0,
      });
    } catch (error) {
      console.error("Error refetching counts:", error);
    } finally {
      setCountsLoading(false);
    }
  };

  const canCreateHabit = isPremium || counts.habits < FREE_LIMITS.MAX_HABITS;
  const canCreateChallenge = isPremium || counts.totalChallengesCreated < FREE_LIMITS.MAX_TOTAL_CHALLENGES;
  const habitsRemaining = isPremium ? Infinity : Math.max(0, FREE_LIMITS.MAX_HABITS - counts.habits);
  const challengesRemaining = isPremium ? Infinity : Math.max(0, FREE_LIMITS.MAX_TOTAL_CHALLENGES - counts.totalChallengesCreated);

  return {
    isPremium,
    loading,
    habitCount: counts.habits,
    totalChallengeCount: counts.totalChallengesCreated,
    canCreateHabit,
    canCreateChallenge,
    habitsRemaining,
    challengesRemaining,
    refetch,
  };
}
