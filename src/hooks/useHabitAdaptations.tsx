import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface HabitAdaptation {
  id: string;
  habit_id: string;
  adaptation_type: "timing" | "difficulty" | "frequency" | "alternative";
  original_value: string | null;
  suggested_value: string;
  reason: string;
  status: "pending" | "accepted" | "dismissed";
  pattern_data: Record<string, unknown> | null;
  habits?: { title: string };
}

export function useHabitAdaptations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adaptations, setAdaptations] = useState<HabitAdaptation[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  // Prevent re-triggering analysis every time adaptations becomes empty (e.g. right after accept/dismiss)
  const hasAutoAnalyzedRef = useRef(false);

  const fetchAdaptations = useCallback(async () => {
    if (!user) return;

    const { data } = await untypedTable("habit_adaptations")
      .select("*, habits(title)")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data) {
      setAdaptations(data as HabitAdaptation[]);
    }
  }, [user]);

  const analyzePatterns = useCallback(async () => {
    if (!user) return;

    setAnalyzing(true);
    try {
      // Get the user's session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("No auth session found");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-habits`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}), // userId is derived from auth token server-side
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.adaptations) {
          setAdaptations(result.adaptations);
        }
      }
    } catch (error) {
      console.error("Error analyzing habits:", error);
    } finally {
      setAnalyzing(false);
    }
  }, [user]);

  const updateAdaptation = useCallback(async (
    adaptationId: string,
    status: "accepted" | "dismissed"
  ) => {
    if (!user) return;

    // If the user is interacting with suggestions, do not auto-run analysis again in this session.
    hasAutoAnalyzedRef.current = true;

    // Find adaptation BEFORE removing from state
    const adaptation = adaptations.find(a => a.id === adaptationId);
    
    if (!adaptation) {
      console.error("Adaptation not found:", adaptationId);
      return;
    }

    console.log("Updating adaptation:", { adaptationId, status, adaptation });
    
    // Optimistic UI update - remove immediately
    setAdaptations(prev => prev.filter(a => a.id !== adaptationId));

    const { error } = await untypedTable("habit_adaptations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", adaptationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating adaptation:", error);
      toast({
        title: "Error",
        description: "Failed to update suggestion",
        variant: "destructive",
      });
      // Revert on error
      setAdaptations(prev => [...prev, adaptation]);
      return;
    }

    // If accepted, apply the change to the habit
    if (status === "accepted") {
      console.log("Applying change to habit:", adaptation.habit_id, adaptation.suggested_value);
      
      if (adaptation.adaptation_type === "timing") {
        const { error: habitError } = await supabase
          .from("habits")
          .update({ reminder_time: adaptation.suggested_value })
          .eq("id", adaptation.habit_id)
          .eq("user_id", user.id);
        
        if (habitError) {
          console.error("Error updating habit timing:", habitError);
        }
      } else if (adaptation.adaptation_type === "difficulty") {
        // For difficulty, update the habit title to the suggested version
        const { error: habitError } = await supabase
          .from("habits")
          .update({ 
            title: adaptation.suggested_value,
            description: `Simplified version. Original: ${adaptation.original_value}`
          })
          .eq("id", adaptation.habit_id)
          .eq("user_id", user.id);
        
        if (habitError) {
          console.error("Error updating habit difficulty:", habitError);
        }
      } else if (adaptation.adaptation_type === "frequency") {
        const { error: habitError } = await supabase
          .from("habits")
          .update({ frequency: adaptation.suggested_value })
          .eq("id", adaptation.habit_id)
          .eq("user_id", user.id);
        
        if (habitError) {
          console.error("Error updating habit frequency:", habitError);
        }
      }

      toast({
        title: "✓ Habit updated",
        description: `Changed to "${adaptation.suggested_value}"`,
      });
    } else {
      toast({
        title: "Suggestion dismissed",
        description: "The habit remains unchanged",
      });
    }

    // Ensure local state matches backend (and remove the card if no more pending)
    await fetchAdaptations();
  }, [user, adaptations, toast, fetchAdaptations]);

  const getAdaptationForHabit = useCallback((habitId: string) => {
    return adaptations.find(a => a.habit_id === habitId);
  }, [adaptations]);

  useEffect(() => {
    fetchAdaptations();
  }, [fetchAdaptations]);

  // Analyze patterns on first load if no pending adaptations
  useEffect(() => {
    if (!user) return;
    if (hasAutoAnalyzedRef.current) return;
    if (adaptations.length > 0) return;
    if (loading || analyzing) return;

    hasAutoAnalyzedRef.current = true;
    analyzePatterns();
  }, [user, adaptations.length, loading, analyzing, analyzePatterns]);

  return {
    adaptations,
    loading,
    analyzing,
    analyzePatterns,
    updateAdaptation,
    getAdaptationForHabit,
    refetch: fetchAdaptations,
  };
}
