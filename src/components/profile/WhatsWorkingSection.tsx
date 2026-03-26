import { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, RefreshCw, TrendingUp, Shield, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { Button } from "@/components/ui/button";

interface WhatsWorkingData {
  improving: string;
  protect: string;
  adjustment: string;
  generated_at: string;
}

export function WhatsWorkingSection() {
  const { user } = useAuth();
  const [data, setData] = useState<WhatsWorkingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchLatest = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: insights } = await untypedTable("ai_insights")
        .selec"*"
        .eq("user_id", user.id)
        .eq("insight_type", "whats_working")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (insights) {
        const analysis = insights.detailed_analysis as any;
        setData({
          improving: analysis?.improving || "Keep going – you're building momentum.",
          protect: analysis?.protect || "Your consistency is your greatest asset.",
          adjustment: analysis?.adjustment || "Try adjusting one small thing this week.",
          generated_at: insights.created_at,
        });
      }
    } catch (err) {
      console.error("Error fetching what's working:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data: sessionData } = await (await impor"@/integrations/supabase/client").supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whats-working`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ language: i18n.language?.substring(0, 2) || "en" }),
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
          <h2 className="text-lg font-semibold text-foreground">{"Cosa sta funzionando"}</h2>
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
            {data ? "Aggiorna" : "Genera"}
          </Button>
        ) : (
          <span className="text-[10px] text-muted-foreground">
            {`Disponibile in ${daysUntilAvailable} gg`}
          </span>
        )}
      </div>

      {data ? (
        <div className="space-y-2.5">
          <div className="glass rounded-xl p-4 flex gap-3 items-start animate-slide-up">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 mt-0.5">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">{"Continua così – stai costruendo slancio."}</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{data.improving}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-4 flex gap-3 items-start animate-slide-up" style={{ animationDelay: "80ms" }}>
            <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-primary uppercase tracking-wider mb-0.5">{"La tua costanza è la tua risorsa più grande."}</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{data.protect}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-4 flex gap-3 items-start animate-slide-up" style={{ animationDelay: "160ms" }}>
            <div className="p-1.5 rounded-lg bg-accent/10 mt-0.5">
              <Lightbulb className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-accent uppercase tracking-wider mb-0.5">{"Prova a modificare una piccola cosa questa settimana."}</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{data.adjustment}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{"Traccia le tue abitudini per una settimana per sbloccare approfondimenti personalizzati"}</p>
        </div>
      )}
    </section>
  );
}
