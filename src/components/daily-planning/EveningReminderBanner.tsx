import { useState, useEffect } from "react";import { useTranslation } from "react-i18next";import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EveningReminderBannerProps {
  userId: string | undefined;
}

export function EveningReminderBanner({ userId }: EveningReminderBannerProps) {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    // Check localStorage for reminder preference
    const savedPreference = localStorage.getItem(`evening_reminder_${userId}`);
    if (savedPreference) {
      setReminderEnabled(savedPreference === "true");
    }
    
    // Check if user dismissed the banner today
    const dismissedToday = localStorage.getItem(`reminder_dismissed_${userId}`);
    if (dismissedToday === new Date().toISOString().spli"T"[0]) {
      setDismissed(true);
    }
  }, [userId]);

  const toggleReminder = () => {
    const newValue = !reminderEnabled;
    setReminderEnabled(newValue);
    localStorage.setItem(`evening_reminder_${userId}`, String(newValue));
    
    if (newValue) {
      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            toast({
              title: "Promemoria abilitato!",
              description: "Riceverai una notifica alle 20 per pianificare domani.",
            });
          }
        });
      } else {
        toast({
          title: "Promemoria abilitato!",
          description: "Riceverai una notifica alle 20 per pianificare domani.",
        });
      }
    } else {
      toast({
        title: "Promemoria disabilitato",
        description: "Non riceverai promemoria serali.",
      });
    }
  };

  const dismissBanner = () => {
    setDismissed(true);
    localStorage.setItem(`reminder_dismissed_${userId}`, new Date().toISOString().spli"T"[0]);
  };

  // Check if it's evening time (6 PM - 10 PM)
  const currentHour = new Date().getHours();
  const isEveningTime = currentHour >= 18 && currentHour < 22;

  if (dismissed || !isEveningTime) return null;

  return (
    <Card className="p-4 glass shadow-card border-l-4 border-l-primary animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{"È tempo di pianificare la sera"}</p>
            <p className="text-xs text-muted-foreground">
              {"Prenditi un momento per pianificare domani e riflettere su oggi"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleReminder}
            className="gap-2"
          >
            {reminderEnabled ? (
              <>
                <BellOff className="h-4 w-4" />
                <span className="hidden sm:inline">{"Disabilita"}</span>
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">{"Ricordamelo"}</span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={dismissBanner}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
