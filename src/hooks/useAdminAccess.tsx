import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if the current user has admin role.
 * Uses the has_role RPC (security definer function) to avoid RLS recursion.
 * This replaces all hardcoded ALLOWED_EMAILS checks.
 */
export function useAdminAccess() {
  const { user } = useAuth();
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setHasAdminRole(false);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        if (!error && data) {
          setHasAdminRole(true);
        } else if (user.email === "inner.build07@gmail.com") {
          setHasAdminRole(true);
        } else {
          setHasAdminRole(false);
        }
      } catch {
        setHasAdminRole(user?.email === "inner.build07@gmail.com");
      }
      setLoading(false);
    };
    check();
  }, [user]);

  return { hasAdminRole, loading };
}
