import { useState, useEffect, useCallback, useMemo } from "react";
import { Sparkles, Loader2, RefreshCw, TrendingUp, Shield, Lightbulb, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useNavigate } from "react-router-dom";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";

interface WhatsWorkingData {
  improving: string;
  protect: string;
  adjustment: string;
  generated_at: string;
}

export function WhatsWorkingSection() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const { hasAdminRole } = useAdminAccess();
  const isPremium = hasAdminRole || subscription.subscribed;

  const [data, setData] = useState<WhatsWorkingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const rawStrings = useMemo(() => {
    if (!data) return [];
    return [data.improving, data.protect, data.adjustment].filter(
      (v): v is string => typeof v === "string" && v.trim().length > 0
    );
  }, [data]);

  const { display } = useUiBatchTranslation(rawStrings, !!data && rawStrings.length > 0);

  const fetchLatest = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: insights } = await untypedTable("ai_insights")
        .select("*")
        .eq("user_id", user.id)
        .eq("insight_type", "whats_working")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (insights) {
        const analysis = insights.detailed_analysis as any;
        setData({
          improving: analysis?.improving || t("whats_working_section.insight_fallback_improving"),
          protect: analysis?.protect || t("whats_working_section.insight_fallback_protect"),
          adjustment: analysis?.adjustment || t("whats_working_section.insight_fallback_adjustment"),
          generated_at: insights.created_at,
        });
      }
    } catch (err) {
      console.error("Error fetching what's working:", err);
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data: sessionData } = await (await import("@/integrations/supabase/client")).supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whats-working`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            language: i18n.resolvedLanguage || i18n.language || "en",
          }),
        }
      );

      if (res.ok) {
        await fetchLatest();
      }
    } catch (err) {
      console.error("Error generating what's working:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Cooldown: only allow generation once every 7 days
  const daysUntilAvailable = data
    ? Math.max(0, 7 - Math.floor((Date.now() - new Date(data.generated_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const canGenerate = !data || daysUntilAvailable === 0;

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <section className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">{t("whats_working_section.title")}</h2>
        </div>
        {canGenerate ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={generate}
            disabled={generating}
            className="text-xs"
          >
            {generating ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            {data ? t("whats_working_section.refresh") : t("whats_working_section.generate")}
          </Button>
        ) : (
          <span className="text-[10px] text-muted-foreground">
            {t("whats_working_section.available_in", { days: daysUntilAvailable })}
          </span>
        )}
      </div>

      {isPremium ? (
        data ? (
          <div className="space-y-2.5">
            <div className="glass rounded-xl p-4 flex gap-3 items-start animate-slide-up">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 mt-0.5">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                  {t("whats_working_section.improving")}
                </p>
                <p className="text-sm text-foreground/85 leading-relaxed">{display(data.improving)}</p>
              </div>
            </div>

            <div className="glass rounded-xl p-4 flex gap-3 items-start animate-slide-up" style={{ animationDelay: "80ms" }}>
              <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-primary uppercase tracking-wider mb-0.5">
                  {t("whats_working_section.protect")}
                </p>
                <p className="text-sm text-foreground/85 leading-relaxed">{display(data.protect)}</p>
              </div>
            </div>

            <div className="glass rounded-xl p-4 flex gap-3 items-start animate-slide-up" style={{ animationDelay: "160ms" }}>
              <div className="p-1.5 rounded-lg bg-accent/10 mt-0.5">
                <Lightbulb className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-accent uppercase tracking-wider mb-0.5">
                  {t("whats_working_section.adjustment")}
                </p>
                <p className="text-sm text-foreground/85 leading-relaxed">{display(data.adjustment)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t("whats_working_section.empty_prompt")}</p>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {/* First Insight visible */}
          <div className="glass rounded-xl p-4 flex gap-3 items-start animate-slide-up">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 mt-0.5">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                {t("whats_working_section.improving")}
              </p>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {data ? display(data.improving) : t("whats_working_section.insight_fallback_improving")}
              </p>
            </div>
          </div>

          {/* Locked Teaser Card with blur & Lock icon */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-card/90 dark:bg-[#0d1612]/95 backdrop-blur-xl p-5 sm:p-6 shadow-md dark:shadow-[0_0_30px_-5px_rgba(16,185,129,0.25)] animate-slide-up">
            <div className="flex items-start gap-3.5 mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                  {t("whats_working_section.teaser_title", "🔒 L'AI ha rilevato pattern nascosti nelle tue giornate")}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {t("whats_working_section.teaser_desc", "Incrociando i tuoi check-in e le tue abitudini, il motore predittivo ha identificato gli ostacoli che frenano la tua costanza e 1 aggiustamento rapido per questa settimana.")}
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/pricing")}
              className="w-full mt-2 h-11 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
            >
              {t("whats_working_section.teaser_cta", "Sblocca la tua Analisi AI + 3 Bonus PRO ->")}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
