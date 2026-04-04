import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateFnsLocale } from "@/lib/dateFnsLocale";
import type { TriggerProgressDetail } from "@/hooks/useProgressData";

function normalizeTriggerKey(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

interface Props {
  data: TriggerProgressDetail;
  days?: number;
}

export function TriggersProgressSection({ data, days = 14 }: Props) {
  const { t, i18n } = useTranslation();
  const dfLocale = dateFnsLocale(i18n.language);
  const totalTriggers = data.dailyData.reduce((sum, d) => sum + d.count, 0);

  const labelTimeContext = (key: string) =>
    t(`trigger_tracking.time_periods.${normalizeTriggerKey(key)}`, { defaultValue: key });
  const labelEmotion = (key: string) =>
    t(`trigger_tracking.emotions.${normalizeTriggerKey(key)}`, { defaultValue: key });
  // For annual view, group data by week
  const chartData = useMemo(() => {
    if (days <= 30) return data.dailyData;
    const weeks: { date: string; count: number }[] = [];
    for (let i = 0; i < data.dailyData.length; i += 7) {
      const chunk = data.dailyData.slice(i, i + 7);
      const total = chunk.reduce((s, d) => s + d.count, 0);
      weeks.push({ date: chunk[0].date, count: total });
    }
    return weeks;
  }, [data.dailyData, days]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  const hasAnyData = chartData.some(d => d.count > 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Bar chart - 14 days */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">{t("triggers_progress_section.trigger_frequency", { days })}</p>
          {hasAnyData && (
            <p className="text-xs text-muted-foreground">{t("triggers_progress_section.total", { count: totalTriggers })}</p>
          )}
        </div>

        {hasAnyData ? (
          <>
            <div className="flex items-end gap-[2px] h-24 overflow-x-auto">
              {chartData.map((day, i) => {
                const height = day.count > 0
                  ? Math.max((day.count / maxCount) * 100, 20)
                  : 6;
                return (
                  <div key={day.date} className="flex flex-col items-center gap-0.5" style={{ minWidth: days > 30 ? "8px" : undefined, flex: days <= 30 ? 1 : undefined }}>
                    {day.count > 0 && days <= 30 && (
                      <span className="text-[9px] font-medium text-foreground/70">{day.count}</span>
                    )}
                    <div
                      className={cn(
                        "w-full rounded-t transition-all duration-500",
                        day.count > 0
                          ? "bg-amber-400 dark:bg-amber-500/70"
                          : "bg-muted/30"
                      )}
                      style={{
                        height: `${height}%`,
                        minHeight: day.count > 0 ? "12px" : "3px",
                      }}
                    />
                    {days <= 30 && (
                      <span className="text-[7px] text-muted-foreground/60">
                        {format(new Date(day.date), "d", { locale: dfLocale })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">
                {format(new Date(chartData[0]?.date), "MMM d", { locale: dfLocale })}
              </span>
              <span className="text-[9px] text-muted-foreground">
                {format(new Date(chartData[chartData.length - 1]?.date), "MMM d", { locale: dfLocale })}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Zap className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t("triggers_progress_section.no_triggers_last_days", { days })}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{t("triggers_progress_section.older_triggers_hint")}</p>
          </div>
        )}
      </div>

      {/* Common patterns */}
      <div className="flex gap-3">
        {data.commonTimes.length > 0 && (
          <div className="flex-1 glass rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground mb-1">{t("triggers_progress_section.common_moments")}</p>
            <div className="flex flex-wrap gap-1">
              {data.commonTimes.map(timeKey => (
                <span key={timeKey} className="text-xs font-medium bg-muted/60 px-2 py-0.5 rounded-md">
                  {labelTimeContext(timeKey)}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.commonEmotions.length > 0 && (
          <div className="flex-1 glass rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground mb-1">{t("triggers_progress_section.common_emotions")}</p>
            <div className="flex flex-wrap gap-1">
              {data.commonEmotions.map(emotionKey => (
                <span key={emotionKey} className="text-xs font-medium bg-muted/60 px-2 py-0.5 rounded-md">
                  {labelEmotion(emotionKey)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI insight */}
      {data.aiInsight && (
        <div className="glass rounded-xl p-4 border-l-2 border-primary/40">
          <p className="text-xs text-foreground/80 italic leading-relaxed">
            "{data.aiInsight}"
          </p>
        </div>
      )}
    </div>
  );
}
