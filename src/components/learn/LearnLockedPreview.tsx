import { Lock, BookOpen, Clock, FileText, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
export function LearnLockedPreview() {
  const navigate = useNavigate();
  const features = [
    { icon: FileText, label: "Articoli scientifici sul recupero" },
    { icon: BookOpen, label: "Guide educative approfondite" },
    { icon: Clock, label: "Timeline e traguardi del recupero" },
  ];

  return (
    <div className="relative">
      <div className="select-none pointer-events-none blur-[3px] opacity-60" aria-hidden="true">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="grid w-full grid-cols-3 mb-6 bg-muted rounded-lg p-1 gap-1">
            <div className="flex items-center justify-center gap-2 rounded-md bg-background py-2 px-3 text-sm font-medium shadow-sm">
              <FileText className="h-4 w-4" /><span>{"Articoli"}</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-md py-2 px-3 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" /><span>{"Guide"}</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-md py-2 px-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /><span>{"Timeline"}</span>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((idx) => (
              <Card key={idx} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm mb-1">████████ ████ ████████</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">████████ ████ ████████ ████ ████████████</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <Card className="max-w-sm w-full bg-card/95 backdrop-blur-md border-border/60 shadow-lg">
          <CardContent className="pt-8 pb-6 text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">{"Centro Apprendimento"}</h2>
              <p className="text-muted-foreground text-sm">{"Articoli scientifici, guide educative e una timeline completa del recupero — tutto in un unico posto."}</p>
            </div>
            <div className="flex flex-col gap-2 py-2">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 text-sm">
                  <feature.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-lg font-bold text-foreground">€9.99</span>
                <span className="text-muted-foreground text-sm">/{"mese"}</span>
              </div>
              <Button onClick={() => navigate("/pricing")} className="w-full gap-2">
                <Crown className="h-4 w-4" />
                {"Sblocca Premium"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
