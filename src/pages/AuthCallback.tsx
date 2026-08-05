import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";

/**
 * AuthCallback — landing page for ALL Supabase email redirects.
 *
 * Supabase PKCE flow appends ?code=XXXX to the redirectTo URL.
 * We explicitly call exchangeCodeForSession() so we can:
 *   a) detect whether the code was already consumed (link reuse)
 *   b) know the exact auth type (recovery vs sign-in)
 *
 * Recovery flow:
 *  1. User clicks email link → lands here with ?code=XXXX
 *  2. We call exchangeCodeForSession(code)
 *  3. If session.type === "recovery" → set sessionStorage flag → /reset-password
 *  4. If exchange fails (code already used / expired):
 *       - sign out any lingering session so the user can't sneak into the dashboard
 *       - redirect to /forgot-password with ?error=link_expired
 *  5. If SIGNED_IN (email confirm etc.) → /dashboard
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const run = async () => {
      handled.current = true;

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      // ── Case 1: PKCE code present in URL ──────────────────────────────────
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data?.session) {
          // Code already used, expired, or invalid.
          // Sign out any existing session so the user cannot land on the dashboard.
          await supabase.auth.signOut();
          navigate("/forgot-password?error=link_expired", { replace: true });
          return;
        }

        const session = data.session;

        // Supabase sets user.recovery_sent_at and the session type for recovery flows.
        // The most reliable check is the onAuthStateChange event, but since we
        // already have the session we inspect the user metadata instead.
        const isRecovery =
          // @ts-expect-error – Supabase JS types don't expose "type" on Session but it exists at runtime
          session.type === "recovery" ||
          // fallback: check the hash (older Supabase versions)
          new URLSearchParams(window.location.hash.substring(1)).get("type") === "recovery";

        if (isRecovery) {
          // Set a tab-scoped flag. This is intentionally sessionStorage (not localStorage)
          // so that:
          //  - refreshing the reset page still works (same tab keeps sessionStorage)
          //  - opening a new tab does NOT inherit the flag (prevents bypass)
          //  - after sign-out the flag is cleared on next load
          sessionStorage.setItem("reset_pending", "1");
          navigate("/reset-password", { replace: true });
        } else {
          // Regular sign-in (e.g. email confirmation)
          navigate("/dashboard", { replace: true });
        }
        return;
      }

      // ── Case 2: No code — listen for the auth state change ────────────────
      // This handles the legacy implicit (#access_token=…) flow and edge cases.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          subscription.unsubscribe();
          clearTimeout(timeout);

          if (event === "PASSWORD_RECOVERY") {
            sessionStorage.setItem("reset_pending", "1");
            navigate("/reset-password", { replace: true });
          } else if (event === "SIGNED_IN" && session) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/auth", { replace: true });
          }
        }
      );

      // Safety net: if nothing fires within 8 s, bounce to /auth
      const timeout = setTimeout(async () => {
        subscription.unsubscribe();
        navigate("/auth", { replace: true });
      }, 8000);
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <LoadingSpinner />
      <p className="text-muted-foreground text-sm">Verifying your link…</p>
    </div>
  );
}
