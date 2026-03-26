import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  RotateCcw,
  LogOut,
  ShieldAlert,
  Play
} from "lucide-react";
import { format } from "date-fns";
import { enUS, it } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface CheckIn {
  id: string;
  checkin_date: string;
  status: "success" | "failed";
}

interface RecoveryTrackerProps {
  startedAt: string;
  checkIns: CheckIn[];
  onCheckIn: (status: "success" | "failed") => void;
  onReset: () => void;
  onAbandon: () => void;
  onResume?: () => void;
  hasCheckedInToday: boolean;
  currentStreak: number;
  longestStreak: number;
  jokersRemaining: number;
  status: string;
}

export function RecoveryTracker({ 
  const { i18n } = useTranslation();
  startedAt, 
  checkIns, 
  onCheckIn, 
  onReset,
  onAbandon,
  onResume,
  hasCheckedInToday,
  currentStreak,
  longestStreak,
  jokersRemaining,
  status,
}: RecoveryTrackerProps) {
  const dateLocale = i18n.language === "it" ? it : enUS;
  const successDays = checkIns.filter(c => c.status === "success").length;
  const failedDays = checkIns.filter(c => c.status === "failed").length;
  const jokers = jokersRemaining;
  const isPausedByJokers = status === "paused" && jokers <= 0;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{"Sfida di Recovery"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {`Iniziato ${format(new Date(startedAt), "dd MMM yyyy", { locale: it })}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Jokers dots */}
            <div className="flex items-center gap-0.5 mr-1" title={`${jokers} joker${jokers !== 1 ? 's' : ''}`}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < jokers ? "bg-accent" : "bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
            <Badge variant="secondary">{`Giorno ${successDays}`}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">{"Serie corrente"}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">{"Serie più lunga"}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{successDays}</p>
            <p className="text-xs text-muted-foreground">{"Giorni di successo"}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{failedDays}</p>
            <p className="text-xs text-muted-foreground">{"Giorni falliti"}</p>
          </div>
        </div>

        {/* Paused by jokers */}
        {isPausedByJokers && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <p className="text-sm font-medium text-foreground">{"Tutti i jolly usati"}</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {`In pausa al giorno ${currentStreak}. Riprendi senza jolly o ricomincia.`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onResume}
                className="flex-1 px-4 py-2.5 rounded-xl gradient-accent text-accent-foreground text-sm font-medium"
              >
                {"Riprendi"}
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium">
                    {"Reset"}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{"Partire da zero?"}</AlertDialogTitle>
                    <AlertDialogDescription>{"Questo reimposterà il tuo percorso attuale e ne inizierà uno nuovo. I tuoi dati precedenti saranno archiviati."}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{"Annulla"}</AlertDialogCancel>
                    <AlertDialogAction onClick={onReset}>{"Parti da zero"}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <p className="text-[10px] text-muted-foreground/70">
              {"La ripresa continua senza jolly — qualsiasi ricaduta metterà di nuovo in pausa."}
            </p>
          </div>
        )}

        {/* Today's Check-in */}
        {!isPausedByJokers && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{"Check-in di oggi"}</span>
            </div>
            
            {hasCheckedInToday ? (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{"Hai già fatto il check-in oggi"}</p>
              </div>
            ) : status === "active" ? (
              <div className="flex gap-3">
                <Button 
                  onClick={() => onCheckIn("success")} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {"Successo"}
                </Button>
                <Button 
                  onClick={() => onCheckIn("failed")} 
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {"Fallito"}
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <RotateCcw className="h-4 w-4 mr-2" />
                {"Parti da zero"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{"Partire da zero?"}</AlertDialogTitle>
                <AlertDialogDescription>
                  {"Questo reimposterà il tuo percorso attuale e ne inizierà uno nuovo. I tuoi dati precedenti saranno archiviati."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{"Annulla"}</AlertDialogCancel>
                <AlertDialogAction onClick={onReset}>{"Parti da zero"}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                {"Abbandona"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{"Abbandonare la sfida?"}</AlertDialogTitle>
                <AlertDialogDescription>
                  {"Questo terminerà la tua sfida attuale. Puoi iniziarne una nuova in qualsiasi momento."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{"Annulla"}</AlertDialogCancel>
                <AlertDialogAction onClick={onAbandon} className="bg-destructive hover:bg-destructive/90">
                  {"Abbandona"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
