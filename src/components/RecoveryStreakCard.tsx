import { useNavigate } from "react-router-dom";
import { Shield, ChevronRight, CheckCircle2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecoveryStreakCardProps {
  journey: {
    id: string;
    started_at: string;
  } | null;
  checkIns: {
    checkin_date: string;
    status: "success" | "failed";
  }[];
  hasCheckedInToday: boolean;
  onCheckIn: (status: "success" | "failed") => void;
}

export default function RecoveryStreakCard({ 
  journey, 
  checkIns, 
  hasCheckedInToday,
  onCheckIn 
}: RecoveryStreakCardProps) {
  const navigate = useNavigate();
  if (!journey) {
    return null;
  }

  let currentStreak = 0;
  const sortedCheckIns = [...checkIns].sort(
    (a, b) => new Date(b.checkin_date).getTime() - new Date(a.checkin_date).getTime()
  );
  
  for (const checkIn of sortedCheckIns) {
    if (checkIn.status === "success") {
      currentStreak++;
    } else {
      break;
    }
  }

  // Journey day = number of successful check-ins (aligned with challenge progression)
  const successDays = checkIns.filter(c => c.status === "success").length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex items-center gap-3 sm:block">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="flex-1 sm:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                {"Serie Recovery"}
              </h2>
              <button
                onClick={() => navigate("/porn-recovery")}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {"Dettagli"}
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="hidden sm:flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-foreground">
              {"Serie Recovery"}
            </h2>
            <button
              onClick={() => navigate("/porn-recovery")}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {"Dettagli"}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-xl sm:text-2xl font-bold text-foreground">
                {currentStreak}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">{"giorni"}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {`Giorno ${successDays} del percorso`}
            </div>
          </div>

          {!hasCheckedInToday && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                size="sm"
                className="h-8 w-full text-xs sm:flex-1 sm:text-sm"
                onClick={() => onCheckIn("success")}
              >
                <Check className="h-3 w-3 mr-1" />
                {"Giorno pulito"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-full px-2 text-xs sm:w-auto sm:px-3 sm:text-sm"
                onClick={() => onCheckIn("failed")}
              >
                <X className="h-3 w-3 mr-1" />
                {"Ricaduta"}
              </Button>
            </div>
          )}
          
          {hasCheckedInToday && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              {"Check-in fatto oggi. Continua così!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
