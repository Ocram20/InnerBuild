import { Lock, Bot, Target, Flame, Lightbulb, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
export function CoachLockedPreview() {
  const navigate = useNavigate();
  const features = [
    { icon: Target, label: "Suggerimenti abitudini personalizzati" },
    { icon: Flame, label: "Creazione sfide personalizzate" },
    { icon: Lightbulb, label: "Guida all'auto-riflessione" },
    { icon: Zap, label: "Motivazione giornaliera" },
  ];

  const previewMessages = [
    { role: "user", text: "Puoi suggerirmi un'abitudine sana..." },
    { role: "assistant", text: "In base ai tuoi pattern, ti consiglierei..." },
    { role: "user", text: "Aiutami a restare motivato oggi..." },
  ];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 space-y-8">
      <div className="w-full max-w-md space-y-3 relative">
        <p className="text-sm text-muted-foreground text-center mb-4">
          {"Anteprima del tuo Coach AI:"}
        </p>
        {previewMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card className={`max-w-[80%] bg-card/30 backdrop-blur border-border/50 overflow-hidden ${msg.role === "user" ? "bg-primary/20" : ""}`}>
              <CardContent className="p-3 blur-[2px] select-none">
                <p className="text-sm text-foreground/80">{msg.text}</p>
              </CardContent>
            </Card>
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <Card className="max-w-md w-full bg-card/50 backdrop-blur border-border/50">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{"Coach AI"}</h2>
            <p className="text-muted-foreground text-sm">{"Ricevi guida personalizzata, suggerimenti sulle abitudini e motivazione dal tuo coach AI personale."}</p>
          </div>
          <div className="flex flex-col gap-2 py-4">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm">
                <feature.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold">€9.99</span>
              <span className="text-muted-foreground text-sm">/{"mese"}</span>
            </div>
            <Button onClick={() => navigate("/pricing")} className="w-full">
              {"Sblocca Premium"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
