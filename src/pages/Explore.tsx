import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { 
  Brain, Bot, ChevronRight, Sparkles, Lock, Zap, Calendar, Flame, ArrowLeft, Target, Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import BottomNavigation from "@/components/BottomNavigation";
import PaywallModal from "@/components/PaywallModal";
import { Button } from "@/components/ui/button";



const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { hasAdminRole } = useAdminAccess();
  const [showPaywall, setShowPaywall] = useState(false);
  const isPremium = hasAdminRole || subscription.subscribed;

  const freeTools = [
    { id: "habits", title: "Abitudini", description: "Traccia e costruisci abitudini quotidiane", icon: Target, path: "/habits", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-500" },
    { id: "challenges", title: "Sfide Detox", description: "Sfide per rompere le cattive abitudini", icon: Flame, path: "/challenges", iconBg: "bg-amber-500/15", iconColor: "text-amber-500" },
    { id: "evening-reflection", title: "Riflessione Serale", description: "Check-in giornaliero e gratitudine", icon: Moon, path: "/evening-reflection", iconBg: "bg-indigo-500/15", iconColor: "text-indigo-500" },
    { id: "daily-planning", title: "Pianificazione Giornaliera", description: "Lista cose da fare e obiettivi", icon: Calendar, path: "/daily-planning", iconBg: "bg-primary/15", iconColor: "text-primary" },
  ];

  const premiumTools = [
    { id: "trigger-tracking", title: "Tracciamento Trigger", description: "Registra impulsi e analisi AI dei pattern", icon: Zap, path: "/trigger-tracking", iconBg: "bg-orange-500/15", iconColor: "text-orange-500", premium: true },
    { id: "porn-recovery", title: "Porn Recovery", description: "Percorso scientifico verso la libertà", icon: Brain, path: "/porn-recovery", iconBg: "bg-violet-500/15", iconColor: "text-violet-500", premium: true },
    { id: "coach", title: "Coach AI", description: "Guida personale basata sull'AI", icon: Bot, path: "/coach", iconBg: "bg-blue-500/15", iconColor: "text-blue-500", premium: true },
  ];

  const handleNavigate = (path: string, premium: boolean) => {
    if (premium && !isPremium) {
      setShowPaywall(true);
    } else {
      navigate(path, { state: { from: "explore" } });
    }
  };

  const ToolCard = ({ item, premium = false }: { item: typeof premiumTools[0]; premium?: boolean }) => {
    const Icon = item.icon;
    const isLocked = premium && !isPremium;
    
    return (
      <button
        onClick={() => handleNavigate(item.path, premium)}
        className={cn(
          "w-full text-left rounded-2xl border border-border/60 bg-card p-4",
          "transition-all duration-200 active:scale-[0.98]",
          "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
          isLocked && "opacity-80"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.iconBg)}>
              <Icon className={cn("h-6 w-6", item.iconColor)} />
            </div>
            {isLocked && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                <Lock className="h-2.5 w-2.5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm mb-0.5">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-snug">{item.description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-foreground">{"Strumenti"}</h1>
            <p className="text-xs text-muted-foreground">{"Tutto ciò che serve per crescere"}</p>
          </div>
        </div>
      </header>

      <div className="w-full max-w-lg mx-auto px-4 pt-6 space-y-6">
        <section className="animate-fade-in" style={{ animationDelay: "50ms" }}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">{"Strumenti Gratuiti"}</h2>
          <div className="space-y-3">
            {freeTools.map((item) => (
              <ToolCard key={item.id} item={item as any} premium={false} />
            ))}
          </div>
        </section>

        <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 mb-3 px-1">
            <h2 className="text-sm font-medium text-muted-foreground">{"Strumenti Premium"}</h2>
            {!isPremium && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {"Pro"}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {premiumTools.map((item) => (
              <ToolCard key={item.id} item={item} premium={true} />
            ))}
          </div>
        </section>

        {!isPremium && (
          <section className="pt-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
            <button
              onClick={() => navigate("/pricing")}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium text-sm">{"Sblocca tutti gli strumenti con Premium"}</span>
              </div>
            </button>
          </section>
        )}
      </div>

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} reason="general" />
      <BottomNavigation />
    </div>
  );
};

export default Explore;
