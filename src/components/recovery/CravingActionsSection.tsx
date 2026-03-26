import { useState } from "react";
import { Zap, Droplets, Footprints, Dumbbell, Phone, Users, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const actions = [
  {
    id: "cold-shower",
    icon: Droplets,
    title: "Take a cold shower",
    description: "30 seconds to 2 minutes. Shocks your system out of the craving.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    id: "walk",
    icon: Footprints,
    title: "Go for a walk or run",
    description: "Leave your phone. Get outside. Movement redirects energy.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "exercise",
    icon: Dumbbell,
    title: "Do physical exercise",
    description: "Push-ups, squats, jumping jacks. Exhaust the urge physically.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "contact",
    icon: Phone,
    title: "Contact someone you trust",
    description: "Text or call a friend, family member, or accountability partner.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "people",
    icon: Users,
    title: "Be around other people",
    description: "Go to a public space. Isolation feeds the urge. Connection breaks it.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

export function CravingActionsSection() {
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const actions = [
    {
      id: "cold-shower",
      icon: Droplets,
      title: "Fai una doccia fredda",
      description: "30 secondi‑2 minuti. Scuoti il sistema dal desiderio.",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      id: "walk",
      icon: Footprints,
      title: "Vai a fare una passeggiata o corsa",
      description: "Lascia il telefono. Esci fuori. Il movimento reindirizza l’energia.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: "exercise",
      icon: Dumbbell,
      title: "Fai esercizio fisico",
      description: "Flessioni, squat, jumping jacks. Esaurisci fisicamente l’impulso.",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      id: "contact",
      icon: Phone,
      title: "Contatta qualcuno di fiducia",
      description: "Invia un messaggio o chiama un amico, un familiare o un partner di responsabilità.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "people",
      icon: Users,
      title: "Stai tra altre persone",
      description: "Vai in uno spazio pubblico. L’isolamento alimenta l’impulso. La connessione lo spezza.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];
  const toggleAction = (actionId: string) => {
    setCompletedActions(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const resetActions = () => {
    setCompletedActions([]);
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {"Cosa fare durante un desiderio"}
          </CardTitle>
          {completedActions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={resetActions} className="text-xs">
              {"Reset"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          {"I desideri sono intensi ma temporanei – solitamente 15-20 minuti. Usa queste azioni per cavalcare l’onda finché passa."}
        </p>
        
        <div className="space-y-2">
          {actions.map((action) => {
            const isCompleted = completedActions.includes(action.id);
            return (
              <button
                key={action.id}
                onClick={() => toggleAction(action.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                  isCompleted 
                    ? "bg-primary/20 border border-primary/30" 
                    : "bg-background/50 hover:bg-background/80 border border-transparent"
                }`}
              >
                <div className={`p-2 rounded-lg ${isCompleted ? "bg-primary/30" : action.bgColor} shrink-0`}>
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${isCompleted ? "text-primary line-through" : "text-foreground"}`}>
                    {action.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
        
        <p className="text-xs text-muted-foreground/70 mt-4 text-center italic">
          {"Tocca ogni azione man mano che la completi. Il desiderio passerà."}
        </p>
      </CardContent>
    </Card>
  );
}
