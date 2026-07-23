import { useMemo, useState } from "react";
import { format, subDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeatmapData } from "@/hooks/useTriggerTracking";
import { useTranslation } from "react-i18next";
import { dateFnsLocale } from "@/lib/dateFnsLocale";

interface TriggerHeatmapProps {
  data: HeatmapData[];
  allLogs?: any[];
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

export default function TriggerHeatmap({ data, allLogs }: TriggerHeatmapProps) {
  const { t, i18n } = useTranslation();
  const dfLocale = dateFnsLocale(i18n.resolvedLanguage || i18n.language);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const handlePrevMonth = () => {
    const prevMonth = addMonths(currentMonth, -1);
    if (availableMonths.some(m => isSameMonth(m, prevMonth))) {
      setCurrentMonth(prevMonth);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    if (availableMonths.some(m => isSameMonth(m, nextMonth))) {
      setCurrentMonth(nextMonth);
    }
  };

  // Generate months from first log to current month
  const availableMonths = useMemo(() => {
    if (!allLogs || allLogs.length === 0) {
      return [new Date()];
    }
    const firstLogDate = new Date(allLogs[allLogs.length - 1].created_at);
    const months = [];
    let current = startOfMonth(firstLogDate);
    const now = new Date();
    while (current <= now) {
      months.push(new Date(current));
      current = addMonths(current, 1);
    }
    return months.reverse();
  }, [allLogs]);

  // Get days for current month
  const currentMonthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Get trigger count for a specific date
  const getTriggerCountForDate = (date: Date) => {
    if (!allLogs) return 0;
    return allLogs.filter((log: any) => {
      const logDate = new Date(log.created_at);
      return isSameDay(logDate, date);
    }).length;
  };

  const getAvgIntensityForDate = (date: Date) => {
    if (!allLogs) return 0;
    const dayLogs = allLogs.filter((log: any) => {
      const logDate = new Date(log.created_at);
      return isSameDay(logDate, date);
    });
    if (dayLogs.length === 0) return 0;
    return dayLogs.reduce((sum: number, log: any) => sum + (log.impulse_intensity || 0), 0) / dayLogs.length;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDateModal(true);
  };

  const getLogsForDate = (date: Date) => {
    if (!allLogs) return [];
    return allLogs.filter((log: any) => {
      const logDate = new Date(log.created_at);
      return isSameDay(logDate, date);
    });
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
    <>
      <Card className="glass rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>{t("trigger_tracking.heatmap_title")}</span>
            <span className="text-xs font-normal text-muted-foreground">{t("trigger_tracking.all_time")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              disabled={!availableMonths.some(m => isSameMonth(m, addMonths(currentMonth, -1)))}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: dfLocale })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {availableMonths.findIndex(m => isSameMonth(m, currentMonth)) + 1} / {availableMonths.length}
              </p>
            </div>
            <button
              onClick={handleNextMonth}
              disabled={!availableMonths.some(m => isSameMonth(m, addMonths(currentMonth, 1)))}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-2 max-w-[290px] mx-auto text-center text-[10px] font-semibold text-muted-foreground uppercase">
              {dayLabels.map((label, idx) => (
                <span key={idx}>{label ? label.slice(0, 3) : ""}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 max-w-[290px] mx-auto justify-items-center">
              {currentMonthDays.map((date, index) => {
                const count = getTriggerCountForDate(date);
                const avgIntensity = getAvgIntensityForDate(date);
                const style = getCellStyle(count, avgIntensity);
                const isToday = isSameDay(date, new Date());
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={`w-8 h-8 rounded-full shrink-0 relative flex items-center justify-center transition-transform hover:scale-110 hover:z-10 ${
                      isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    }`}
                    style={style}
                    title={`${format(date, 'MMM d', { locale: dfLocale })}: ${count} trigger${count !== 1 ? 's' : ''}`}
                  >
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-white drop-shadow-sm leading-none pointer-events-none">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span>{t("trigger_tracking.heatmap_legend.mild")}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500/70" />
              <span>{t("trigger_tracking.heatmap_legend.medium")}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <span>{t("trigger_tracking.heatmap_legend.strong")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDateModal} onOpenChange={setShowDateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: dfLocale })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDate && (
              <>
                <div className="text-sm text-muted-foreground">
                  {t("trigger_tracking.triggers_on_date", { count: getLogsForDate(selectedDate).length })}
                </div>
                {getLogsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {getLogsForDate(selectedDate).map((log: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-xs font-medium">
                            Intensità: {log.impulse_intensity}/10
                          </span>
                        </div>
                        <div className="text-sm">
                          {t(`trigger_tracking.emotions.${log.emotion}`)} • {t(`trigger_tracking.situations.${log.situation}`)}
                        </div>
                        {log.notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    {t("trigger_tracking.no_triggers_this_day")}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
