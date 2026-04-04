import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatmapData } from "@/hooks/useTriggerTracking";
import { useTranslation } from "react-i18next";

interface TriggerHeatmapProps {
  data: HeatmapData[];
}

const HOURS = [
  "00", "01", "02", "03", "04", "05",
  "06", "07", "08", "09", "10", "11",
  "12", "13", "14", "15", "16", "17",
  "18", "19", "20", "21", "22", "23",
];

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const PERIOD_KEYS = ["night", "morning", "afternoon", "evening"] as const;

const PERIOD_HOURS: Record<(typeof PERIOD_KEYS)[number], number[]> = {
  night: [0, 1, 2, 3, 4, 5],
  morning: [6, 7, 8, 9, 10, 11],
  afternoon: [12, 13, 14, 15, 16, 17],
  evening: [18, 19, 20, 21, 22, 23],
};

export default function TriggerHeatmap({ data }: TriggerHeatmapProps) {
  const { t } = useTranslation();

  const dayLabels = DAY_KEYS.map((k) => t(`trigger_tracking.days.${k}`));

  const hourGroups = PERIOD_KEYS.map((key) => ({
    key,
    label: t(`trigger_tracking.time_periods.${key}`),
    hours: PERIOD_HOURS[key],
  }));

  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  const getCell = (day: number, hour: number) => {
    const cell = data.find((d) => d.day === day && d.hour === hour);
    return cell || { count: 0, avgIntensity: 0 };
  };

  const getGroupedCell = (day: number, hourGroup: number[]) => {
    const cells = hourGroup.map((h) => getCell(day, h));
    const totalCount = cells.reduce((a, b) => a + b.count, 0);
    const avgIntensity =
      totalCount > 0
        ? cells.reduce((a, b) => a + b.avgIntensity * b.count, 0) / totalCount
        : 0;
    return { count: totalCount, avgIntensity };
  };

  const getCellStyle = (count: number, avgIntensity: number) => {
    if (count === 0) return { backgroundColor: "hsl(var(--muted) / 0.3)" };
    const opacity = Math.min(0.3 + (count / maxCount) * 0.7, 1);
    if (avgIntensity >= 7) return { backgroundColor: `rgba(239, 68, 68, ${opacity})` };
    if (avgIntensity >= 4) return { backgroundColor: `rgba(249, 115, 22, ${opacity})` };
    return { backgroundColor: `rgba(234, 179, 8, ${opacity})` };
  };

  if (data.length === 0) {
    return (
      <Card className="glass rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("trigger_tracking.heatmap_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">{t("trigger_tracking.heatmap_empty")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{t("trigger_tracking.heatmap_title")}</span>
          <span className="text-xs font-normal text-muted-foreground">{t("trigger_tracking.last_30_days")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="block sm:hidden">
          <div className="grid grid-cols-5 gap-1">
            <div className="text-[10px] text-muted-foreground" />
            {hourGroups.map((group) => (
              <div key={group.key} className="text-[10px] text-muted-foreground text-center">
                {group.label}
              </div>
            ))}
            {dayLabels.map((dayLabel, dayIndex) => (
              <div key={dayLabel} className="contents">
                <div className="text-[10px] text-muted-foreground flex items-center">{dayLabel}</div>
                {hourGroups.map((group) => {
                  const cell = getGroupedCell(dayIndex, group.hours);
                  return (
                    <div
                      key={`${dayIndex}-${group.key}`}
                      className="aspect-square rounded-md relative group cursor-pointer"
                      style={getCellStyle(cell.count, cell.avgIntensity)}
                      title={`${dayLabel} ${group.label}: ${cell.count}`}
                    >
                      {cell.count > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white drop-shadow-sm">
                          {cell.count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden sm:block overflow-x-auto trigger-tracking-scroll">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-0.5 mb-1">
              <div />
              {HOURS.map((hour) => (
                <div key={hour} className="text-[8px] text-muted-foreground text-center">
                  {parseInt(hour, 10) % 3 === 0 ? hour : ""}
                </div>
              ))}
            </div>
            {dayLabels.map((dayLabel, dayIndex) => (
              <div key={dayLabel} className="grid grid-cols-[40px_repeat(24,1fr)] gap-0.5 mb-0.5">
                <div className="text-[10px] text-muted-foreground flex items-center">{dayLabel}</div>
                {HOURS.map((_, hourIndex) => {
                  const cell = getCell(dayIndex, hourIndex);
                  return (
                    <div
                      key={`${dayIndex}-${hourIndex}`}
                      className="aspect-square rounded-sm relative group cursor-pointer transition-transform hover:scale-150 hover:z-10"
                      style={getCellStyle(cell.count, cell.avgIntensity)}
                      title={`${dayLabel} ${hourIndex}:00 — ${cell.count}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-yellow-500/70" />
            <span>{t("trigger_tracking.heatmap_legend.mild")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-orange-500/70" />
            <span>{t("trigger_tracking.heatmap_legend.medium")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500/70" />
            <span>{t("trigger_tracking.heatmap_legend.strong")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
