import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";

/**
 * AuthCallback — landing page for ALL Supabase email redirects.
 *
 * Supabase appends ?code=XXXX to the redirectTo URL (PKCE flow).
 * This page is the ONLY page that handles that code, so Supabase JS
 * always mounts a fresh listener BEFORE the code is exchanged.
 *
 * Flow:
 *  1. User clicks email link → lands here with ?code=XXXX
 *  2. Supabase JS exchanges the code (triggered by onAuthStateChange subscribing)
 *  3. We receive the event and route accordingly:
 *     - PASSWORD_RECOVERY → /reset-password
 *     - SIGNED_IN         → /dashboard
 *     - anything else     → /auth
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (handled.current) return;

      if (event === "PASSWORD_RECOVERY") {
        handled.current = true;
        navigate("/reset-password", { state: { isRecovery: true }, replace: true });
      } else if (event === "SIGNED_IN" && session) {
        handled.current = true;
        navigate("/dashboard", { replace: true });
      }
    });

    // Safety net: if no event fires within 8 seconds, go to auth page
    const timeout = setTimeout(() => {
      if (!handled.current) {
        handled.current = true;
        navigate("/auth", { replace: true });
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <LoadingSpinner />
      <p className="text-muted-foreground text-sm">Verifying your link…</p>
    </div>
  );
}
