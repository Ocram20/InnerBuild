import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { CategoryPreferences } from "./useCategoryPreferences";

export const DEFAULT_FREE_PREFERENCES: CategoryPreferences = {
  habits: true,
  challenges: true,
  "daily-planning": true,
  "evening-reflection": true,
  coach: false,
  "trigger-tracking": false,
  "the-forge": false,
};

export function useOnboarding() {
  const { user } = useAuth();
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setShouldShowOnboarding(false);
      setLoading(false);
      return;
    }

    checkOnboardingStatus();
  }, [user?.id]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    // Check localStorage first for instant UI response
    const localKey = `innerbuild_onboarding_${user.id}`;
    const localStatus = localStorage.getItem(localKey);

    if (localStatus === "true") {
      setShouldShowOnboarding(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to fetch profile onboarding status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("has_completed_onboarding, primary_focus, category_preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.warn("Onboarding check profile notice:", profileError.message || profileError);
      }

      const hasOnboardingFlag = (profile as any)?.has_completed_onboarding === true;
      const hasProfilePreferences = !!((profile as any)?.primary_focus || (profile as any)?.category_preferences);

      if (hasOnboardingFlag || hasProfilePreferences) {
        localStorage.setItem(localKey, "true");
        setShouldShowOnboarding(false);
        setLoading(false);
        return;
      }

      // Fallback check: check if user already has active habits (existing user)
      const { count: habitCount } = await supabase
        .from("habits")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (habitCount && habitCount > 0) {
        // User already has habits, they have used the app before
        localStorage.setItem(localKey, "true");
        setShouldShowOnboarding(false);
        setLoading(false);
        return;
      }

      // If profile error occurred, do not force onboarding on users
      if (profileError && !profile) {
        setShouldShowOnboarding(false);
        setLoading(false);
        return;
      }

      // Only show onboarding for brand new users
      setShouldShowOnboarding(true);
    } catch (err) {
      console.error("Onboarding check error:", err);
      setShouldShowOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (
    focus?: string,
    categoryPreferences?: CategoryPreferences
  ) => {
    if (!user) return;

    const localKey = `innerbuild_onboarding_${user.id}`;
    localStorage.setItem(localKey, "true");
    setShouldShowOnboarding(false);

    try {
      const updateData: Record<string, unknown> = {
        user_id: user.id,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      };

      if (focus) {
        updateData.primary_focus = focus;
      }

      if (categoryPreferences) {
        updateData.category_preferences = categoryPreferences;
      }

      const { error } = await (supabase.from("profiles") as any)
        .upsert(updateData, { onConflict: "user_id" });

      if (error) {
        console.warn("Notice updating profile onboarding:", error.message || error);
      }
    } catch (err) {
      console.warn("Notice updating profile onboarding:", err);
    }
  };

  const skipOnboarding = async () => {
    await markCompleted(undefined, DEFAULT_FREE_PREFERENCES);
  };

  return {
    shouldShowOnboarding,
    loading,
    markCompleted,
    skipOnboarding,
    dismissModal: () => {
      if (user) {
        localStorage.setItem(`innerbuild_onboarding_${user.id}`, "true");
      }
      setShouldShowOnboarding(false);
    },
  };
}
