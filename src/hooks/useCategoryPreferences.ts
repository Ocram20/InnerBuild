import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";

export type CategoryPreferences = {
  habits: boolean;
  challenges: boolean;
  "daily-planning": boolean;
  coach: boolean;
  "evening-reflection": boolean;
  "trigger-tracking": boolean;
  "the-forge": boolean;
};

const DEFAULT_PREFERENCES: CategoryPreferences = {
  habits: true,
  challenges: true,
  "daily-planning": true,
  "evening-reflection": true,
  coach: false,
  "trigger-tracking": false,
  "the-forge": false,
};

export const useCategoryPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<CategoryPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.from("profiles") as any)
        .select("category_preferences")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data?.category_preferences) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...(data.category_preferences as CategoryPreferences),
        });
      }
    } catch (error) {
      console.error("Error fetching category preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof CategoryPreferences, value: boolean) => {
    if (!user) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const { error } = await (supabase.from("profiles") as any)
        .update({ category_preferences: newPreferences })
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating category preferences:", error);
      toast({
        title: t("common.error"),
        description: t("explore.settings.update_error"),
        variant: "destructive",
      });
      // Rollback
      setPreferences(preferences);
    }
  };

  return { preferences, loading, updatePreference };
};
