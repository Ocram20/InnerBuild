import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Zap,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Lightbulb,
  Heart,
  Calendar,
  Clock3,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTriggerReport, TriggerCause, TimingPattern, TriggerSolution } from "@/hooks/useTriggerReport";
import { useTranslation } from "react-i18next";
import { dateFnsLocale } from "@/lib/dateFnsLocale";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";

const formatTimeBadge = (whenStr: string, t: any) => {
  const lower = whenStr.toLowerCase();
  if (lower.includes("notte") || lower.includes("23") || lower.includes("01") || lower.includes("02") || lower.includes("tardi") || lower.includes("night") || lower.includes("late")) {
    return { icon: "🌙", label: whenStr.includes("23") ? whenStr : `${t("trigger_tracking.late_night", "Tarda Notte")} (${whenStr})` };
  }
  if (lower.includes("pomeriggio") || lower.includes("14") || lower.includes("15") || lower.includes("16") || lower.includes("solitudine") || lower.includes("afternoon")) {
    return { icon: "🌆", label: whenStr.includes("Pomeriggio") || whenStr.includes("Afternoon") ? whenStr : t("trigger_tracking.afternoon_alone", "Pomeriggio in solitudine") };
  }
  if (lower.includes("lavoro") || lower.includes("pausa") || lower.includes("work") || lower.includes("break")) {
    return { icon: "💼", label: whenStr.includes("Pausa") || whenStr.includes("Break") ? whenStr : `${t("trigger_tracking.work_break", "Pausa Lavoro")} (${whenStr})` };
  }
  if (lower.includes("mattin") || lower.includes("07") || lower.includes("08") || lower.includes("09") || lower.includes("morning")) {
    return { icon: "🌅", label: whenStr.includes("Mattina") || whenStr.includes("Morning") ? whenStr : t("trigger_tracking.early_morning", "Mattina presto") };
  }
  if (lower.includes("sera") || lower.includes("20") || lower.includes("21") || lower.includes("letto") || lower.includes("evening")) {
    return { icon: "🛋️", label: whenStr.includes("Sera") || whenStr.includes("Evening") ? whenStr : t("trigger_tracking.evening_home", "Sera a casa") };
  }
  return { icon: "⏰", label: whenStr };
};

export default function TriggerReportCard() {
  const { t, i18n } = useTranslation();
  const dfLocale = dateFnsLocale(i18n.resolvedLanguage || i18n.language);
  const {
    report,
    loading,
    generating,
    generateReport,
    markAsRead,
    canGenerateReport,
    getDaysUntilNextReport,
  } = useTriggerReport();
  const [expanded, setExpanded] = useState(true);

  const triggerReportRawStrings = useMemo(() => {
    if (!report) return [];
    const arr: string[] = [];
    if (report.summary?.trim()) arr.push(report.summary);
    const da = report.detailed_analysis;
    if (da) {
      for (const c of da.main_causes ?? []) {
        for (const x of [c.cause, c.frequency, c.description]) {
          if (typeof x === "string" && x.trim()) arr.push(x);
        }
      }
      for (const p of da.timing_patterns ?? []) {
        for (const x of [p.when, p.frequency, p.likely_reason]) {
          if (typeof x === "string" && x.trim()) arr.push(x);
        }
      }
      for (const sol of da.solutions ?? []) {
        for (const x of [sol.for_cause, sol.strategy, sol.why_it_helps]) {
          if (typeof x === "string" && x.trim()) arr.push(x);
        }
      }
      if (typeof da.encouragement === "string" && da.encouragement.trim()) {
        arr.push(da.encouragement);
      }
    }
    return arr;
  }, [report]);
  
  const { display } = useUiBatchTranslation(triggerReportRawStrings, !!report && triggerReportRawStrings.length > 0);

  const mainCauses = report?.detailed_analysis?.main_causes || [];
  const timingPatterns = report?.detailed_analysis?.timing_patterns || [];
  const solutions = report?.detailed_analysis?.solutions || [];
  const encouragement = report?.detailed_analysis?.encouragement || "";
  const daysUntilNext = getDaysUntilNextReport();

  // Grouping Analysis by Bad Habit
  const badHabitGroups = useMemo(() => {
    const groups: Record<string, {
      habitName: string;
      icon: string;
      causes: TriggerCause[];
      timings: TimingPattern[];
      solutions: TriggerSolution[];
    }> = {};

    const getHabitKey = (text: string): { name: string; icon: string } => {
      const lower = text.toLowerCase();
      if (lower.includes("social") || lower.includes("instagram") || lower.includes("tiktok") || lower.includes("feed")) {
        return { name: t("trigger_tracking.social_media", "Social Media"), icon: "📱" };
      }
      if (lower.includes("porn") || lower.includes("adulti") || lower.includes("nofap") || lower.includes("video osé")) {
        return { name: t("trigger_tracking.adult_content", "Pornografia / Contenuti Adulti"), icon: "🔞" };
      }
      if (lower.includes("cibo") || lower.includes("junk") || lower.includes("zuccheri") || lower.includes("dolci") || lower.includes("snack") || lower.includes("spazzatura")) {
        return { name: t("trigger_tracking.junk_food", "Junk Food"), icon: "🍔" };
      }
      if (lower.includes("fumo") || lower.includes("sigarett") || lower.includes("vape") || lower.includes("nicotin")) {
        return { name: t("trigger_tracking.smoking_nicotine", "Fumo / Nicotina"), icon: "🚬" };
      }
      if (lower.includes("video") || lower.includes("gaming") || lower.includes("giochi") || lower.includes("scherm")) {
        return { name: t("trigger_tracking.video_games", "Videogiochi"), icon: "🎮" };
      }
      if (lower.includes("alcol") || lower.includes("bere") || lower.includes("drink")) {
        return { name: t("trigger_tracking.alcohol", "Alcol"), icon: "🍺" };
      }
      return { name: t("trigger_tracking.general_patterns", "Pattern & Inneschi Generali"), icon: "⚡" };
    };

    mainCauses.forEach(c => {
      const { name, icon } = getHabitKey(`${c.cause} ${c.description}`);
      if (!groups[name]) groups[name] = { habitName: name, icon, causes: [], timings: [], solutions: [] };
      groups[name].causes.push(c);
    });

    timingPatterns.forEach(tItem => {
      const { name, icon } = getHabitKey(`${tItem.when} ${tItem.likely_reason}`);
      if (!groups[name]) groups[name] = { habitName: name, icon, causes: [], timings: [], solutions: [] };
      groups[name].timings.push(tItem);
    });

    solutions.forEach(s => {
      const { name, icon } = getHabitKey(`${s.for_cause} ${s.strategy} ${s.why_it_helps}`);
      if (!groups[name]) groups[name] = { habitName: name, icon, causes: [], timings: [], solutions: [] };
      groups[name].solutions.push(s);
    });

    if (Object.keys(groups).length === 0 && (mainCauses.length > 0 || timingPatterns.length > 0 || solutions.length > 0)) {
      const defaultName = t("trigger_tracking.general_patterns", "Pattern & Inneschi Generali");
      groups[defaultName] = {
        habitName: defaultName,
        icon: "⚡",
        causes: mainCauses,
        timings: timingPatterns,
        solutions: solutions,
      };
    }

    return Object.values(groups);
  }, [mainCauses, timingPatterns, solutions, t]);

  if (loading) {
    return (
      <Card className="rounded-2xl border border-[#9B5BDB]/20 bg-card dark:bg-slate-900/80 p-6 animate-pulse">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-3">
            <Zap className="h-6 w-6 text-[#9B5BDB]/60" />
            <span className="text-muted-foreground">{t("trigger_tracking.loading_insights")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="rounded-2xl border border-[#4D87D9]/30 bg-card dark:bg-[#131922] p-5 shadow-lg backdrop-blur-md">
        <CardContent className="py-4">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4D87D9]/10 border border-[#4D87D9]/20 flex items-center justify-center mx-auto">
              <Zap className="h-7 w-7 text-[#4D87D9]" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">{t("trigger_tracking.get_trigger_report")}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t("trigger_tracking.analyze_patterns")}</p>
            </div>
            <Button onClick={generateReport} disabled={generating} className="gap-2 bg-[#4D87D9] hover:bg-[#3b6eb8] text-white font-semibold text-xs rounded-xl h-10 px-5 shadow-md">
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {t("common.analyzing")}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t("trigger_tracking.generate_report")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, created_at, is_read, id } = report;

  return (
    <Card className={`glass rounded-2xl border-[#4D87D9]/30 ${!is_read ? "ring-2 ring-[#4D87D9]/40" : ""}`}>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4D87D9]/15 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-[#4D87D9]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground">
                  {t("trigger_tracking.analysis_title", "Analisi AI Trigger & Tentazioni")}
                </CardTitle>
                {!is_read && (
                  <Badge variant="secondary" className="text-xs bg-[#4D87D9]/15 text-[#4D87D9]">
                    {t("common.new")}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: dfLocale })}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpanded(!expanded);
              if (!is_read) markAsRead(id);
            }}
            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:bg-muted"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4 px-4 space-y-4">
        {/* Synthetic Executive Summary */}
        <div className="p-3.5 rounded-xl bg-[#4D87D9]/10 border border-[#4D87D9]/30 text-sm text-foreground/90 leading-relaxed">
          <span className="font-semibold text-[#4D87D9] mr-1.5">{t("trigger_tracking.summary_prefix", "📌 Sintesi:")}</span>
          {display(summary)}
        </div>

        {/* Bad Habit Grouped Cards */}
        {expanded && (
          <div className="space-y-4 pt-1">
            {badHabitGroups.map((group, gIdx) => {
              // Extract primary timing info or fallback
              const timingItem = group.timings[0];
              const timeBadge = timingItem ? formatTimeBadge(display(timingItem.when), t) : { icon: "⏰", label: t("trigger_tracking.critical_moment", "Momento critico rilevato") };
              const freqText = timingItem ? display(timingItem.frequency) : t("trigger_tracking.default_freq", "3 tentazioni su 4 registrate in questa fascia");

              // Extract single concrete actionable solution
              const solItem = group.solutions[0];
              const causeItem = group.causes[0];
              const actionAdvice = solItem 
                ? display(solItem.strategy)
                : causeItem
                ? t("trigger_tracking.advice_plan_action", "Pianifica un'azione alternativa immediata appena avverti lo stimolo.")
                : t("trigger_tracking.advice_environmental_barrier", "Imposta una barriera ambientale prima di entrare in questa fascia oraria.");

              return (
                <div
                  key={gIdx}
                  className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-3"
                >
                  {/* Bad Habit Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{group.icon}</span>
                      <h4 className="text-sm font-bold text-foreground">
                        {group.habitName}
                      </h4>
                    </div>
                    <Badge variant="outline" className="text-xs font-medium bg-[#4D87D9]/10 text-[#4D87D9] border-[#4D87D9]/30">
                      {t("trigger_tracking.pattern_detected", "Pattern Rilevato")}
                    </Badge>
                  </div>

                  {/* Visual Time & Frequency Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {/* Time Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#4D87D9]/15 border border-[#4D87D9]/30 text-xs font-medium text-blue-400">
                      <span className="text-sm">{timeBadge.icon}</span>
                      <span>{timeBadge.label}</span>
                    </div>

                    {/* Frequency Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-400">
                      <Flame className="h-3.5 w-3.5 text-rose-400" />
                      <span>{freqText}</span>
                    </div>
                  </div>

                  {/* Single Actionable Concrete Advice */}
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed">
                    <Lightbulb className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-purple-400 mr-1.5">{t("trigger_tracking.ai_advice_prefix", "Consiglio AI:")}</span>
                      <span>{actionAdvice}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {encouragement && (
              <div className="rounded-xl bg-[#4D87D9]/10 p-3.5 border border-[#4D87D9]/30 text-sm text-foreground/90 flex items-center gap-2.5">
                <Heart className="h-4 w-4 text-[#4D87D9] shrink-0" />
                <p className="italic">{display(encouragement)}</p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2">
              {canGenerateReport() ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateReport}
                  disabled={generating}
                  className="w-full h-10 text-sm font-semibold rounded-xl gap-2 border-[#4D87D9]/40 text-[#4D87D9] hover:bg-[#4D87D9]/10"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {t("common.generating")}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      {t("trigger_tracking.generate_new_report")}
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs text-[#4D87D9] py-1 font-mono">
                  <Clock className="h-4 w-4 text-[#4D87D9]" />
                  {t("trigger_tracking.next_report_in", { days: daysUntilNext })}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

