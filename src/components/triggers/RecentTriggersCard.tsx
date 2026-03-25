import { format } from "date-fns";
import { Trash2, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TriggerLog } from "@/hooks/useTriggerTracking";
import { useTranslation } from "react-i18next";

interface RecentTriggersCardProps {
  logs: TriggerLog[];
  onDelete: (id: string) => void;
}

const emotionEmojis: Record<string, string> = {
  stress: "😰", boredom: "😑", sadness: "😢", anxiety: "😟",
  anger: "😠", loneliness: "😔", tiredness: "😴", excitement: "🤩",
  noia: "😑", tristezza: "😢", ansia: "😟", rabbia: "😠",
  solitudine: "😔", stanchezza: "😴", eccitazione: "🤩",
};

const getIntensityColor = (intensity: number) => {
  if (intensity >= 7) return "text-red-500 bg-red-500/10";
  if (intensity >= 4) return "text-orange-500 bg-orange-500/10";
  return "text-yellow-500 bg-yellow-500/10";
};

export default function RecentTriggersCard({ logs, onDelete }: RecentTriggersCardProps) {
  const { t } = useTranslation();
  const recentLogs = logs.slice(0, 10);

  const getEmotionLabel = (emotion: string) => {
    const key = `trigger_tracking.emotions.${emotion}`;
    const translated = t(key);
    return translated !== key ? translated : emotion;
  };

  const getSituationLabel = (situation: string) => {
    const key = `trigger_tracking.situations.${situation}`;
    const translated = t(key);
    return translated !== key ? translated : situation;
  };

  if (recentLogs.length === 0) {
    return (
      <Card className="glass rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("trigger_tracking.recent_triggers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("trigger_tracking.no_triggers_yet")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{t("trigger_tracking.recent_triggers")}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {logs.length} {t("common.total")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentLogs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 group">
            <div className="text-2xl">{emotionEmojis[log.emotion] || "😐"}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium">{getEmotionLabel(log.emotion)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getIntensityColor(log.impulse_intensity)}`}>
                  {log.impulse_intensity}/10
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{getSituationLabel(log.situation)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(log.logged_at), "d MMM, HH:mm")}
                </span>
              </div>
              {log.notes && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{log.notes}</p>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(log.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
