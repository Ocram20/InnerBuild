import { useNavigate } from "react-router-dom";
import { Flame, ChevronRight, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

interface Challenge {
  id: string;
  title: string;
  current_streak: number;
  duration_days: number;
  category: string;
}

interface ActiveChallengesCardProps {
  challenges: Challenge[];
}

export default function ActiveChallengesCard({ challenges }: ActiveChallengesCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  if (challenges.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Flame className="h-4 w-4 text-primary" />
          </div>
          <h2 className="truncate text-base font-semibold text-foreground">{t("recovery.active_challenges")}</h2>
        </div>
        <button
          onClick={() => navigate("/challenges")}
          className="flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-foreground sm:self-auto"
        >
          {t("common.view_all")}
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-2">
        {challenges.slice(0, 3).map((challenge) => {
          const progress = Math.round((challenge.current_streak / challenge.duration_days) * 100);
          
          return (
            <div
              key={challenge.id}
              className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate("/challenges")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground truncate flex-1">
                  {challenge.title}
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {challenge.current_streak}{t("common.days_short")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="h-1.5 flex-1" />
                <span className="text-[10px] text-muted-foreground">
                  {challenge.current_streak}/{challenge.duration_days}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
