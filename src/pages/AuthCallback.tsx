import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Leaf, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handled = useRef(false);
  const [status, setStatus] = useState<"loading" | "confirmed" | "error">("loading");

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
          await supabase.auth.signOut();
          setStatus("error");
          navigate("/forgot-password?error=link_expired", { replace: true });
          return;
        }

        const session = data.session;
        const isRecovery =
          // @ts-expect-error – Supabase JS types don't expose "type" on Session but it exists at runtime
          session.type === "recovery" ||
          new URLSearchParams(window.location.hash.substring(1)).get("type") === "recovery";

        if (isRecovery) {
          sessionStorage.setItem("reset_pending", "1");
          navigate("/reset-password", { replace: true });
        } else {
          // Email confirmation for new account signups:
          // Immediately sign out so user is NOT auto-logged in, and show confirmation screen.
          await supabase.auth.signOut();
          setStatus("confirmed");
        }
        return;
      }

      // ── Case 2: No code — listen for auth state change ─────────────────────
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          subscription.unsubscribe();
          clearTimeout(timeout);

          if (event === "PASSWORD_RECOVERY") {
            sessionStorage.setItem("reset_pending", "1");
            navigate("/reset-password", { replace: true });
          } else if (event === "SIGNED_IN" && session) {
            // Immediately sign out to prevent auto-login
            await supabase.auth.signOut();
            setStatus("confirmed");
          } else {
            navigate("/auth", { replace: true });
          }
        }
      );

      const timeout = setTimeout(async () => {
        subscription.unsubscribe();
        navigate("/auth", { replace: true });
      }, 8000);
    };

    run();
  }, [navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#070c0a] text-foreground p-6">
        <LoadingSpinner />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          {t("common.loading", "Verifica in corso...")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070c0a] text-foreground p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-card/40 border border-emerald-500/30 backdrop-blur-2xl p-8 rounded-[28px] text-center shadow-2xl space-y-6 relative z-10 animate-fade-in">
        {/* Emblem Logo & Checkmark */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <Leaf className="h-9 w-9 text-emerald-400" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-[#070c0a]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {t("auth.email_confirmed_title", "Account confermato con successo!")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t(
              "auth.email_confirmed_desc",
              "La tua email è stata verificata. Ora puoi accedere al tuo account appena creato."
            )}
          </p>
        </div>

        {/* Action Button to Log In */}
        <Button
          onClick={() => navigate("/auth")}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all gap-2"
        >
          <span>{t("auth.log_in_now", "Accedi ora")}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
