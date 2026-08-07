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
  }, [user]);

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
      const { data, error } = await supabase
        .from("profiles")
        .select("has_completed_onboarding")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.warn("Error fetching onboarding status:", error);
      }

      const completed = (data as { has_completed_onboarding?: boolean })?.has_completed_onboarding === true;
      if (completed) {
        localStorage.setItem(localKey, "true");
        setShouldShowOnboarding(false);
      } else {
        setShouldShowOnboarding(true);
      }
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
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      };

      if (focus) {
        updateData.primary_focus = focus;
      }

      if (categoryPreferences) {
        updateData.category_preferences = categoryPreferences;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to save onboarding in profile DB:", error);
        throw error;
      }
    } catch (err) {
      console.error("Failed to save onboarding in profile DB:", err);
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
    dismissModal: () => setShouldShowOnboarding(false),
  };
}
