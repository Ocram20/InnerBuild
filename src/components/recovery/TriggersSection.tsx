import { Search, Clock, MapPin, Smartphone, Monitor, Bed, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const guidedQuestions = [
  {
    icon: MessageSquare,
    question: "What emotion was I feeling?",
    examples: "Bored, lonely, stressed, anxious, tired, rejected, frustrated",
  },
  {
    icon: Clock,
    question: "What time of day was it?",
    examples: "Late night, early morning, after work, weekend afternoon",
  },
  {
    icon: MapPin,
    question: "Where was I?",
    examples: "Bedroom, bathroom, home alone, hotel room",
  },
  {
    icon: Smartphone,
    question: "What was I doing before?",
    examples: "Scrolling social media, watching TV, working, arguing with someone",
  },
];

const commonTriggers = [
  {
    icon: Monitor,
    trigger: "Alone at the computer",
    tip: "Work in public spaces or with the door open",
  },
  {
    icon: Bed,
    trigger: "Phone in bed at night",
    tip: "Charge your phone in another room",
  },
  {
    icon: Smartphone,
    trigger: "Social media browsing",
    tip: "Limit or delete triggering apps",
  },
  {
    icon: Clock,
    trigger: "Late nights when tired",
    tip: "Set a strict bedtime and stick to it",
  },
];

export function TriggersSection() {
  const guidedQuestions = [
    {
      icon: MessageSquare,
      question: "Quale emozione provavo?",
      examples: "Noia, solitudine, stress, ansia, stanchezza, rifiuto, frustrazione",
    },
    {
      icon: Clock,
      question: "A che ora era?",
      examples: "Tardi la notte, primo mattino, dopo il lavoro, pomeriggio del weekend",
    },
    {
      icon: MapPin,
      question: "Dove ero?",
      examples: "Camera da letto, bagno, a casa da solo, camera d'albergo",
    },
    {
      icon: Smartphone,
      question: "Cosa stavo facendo prima?",
      examples: "Scorrendo i social media, guardando la TV, lavorando, litigando con qualcuno",
    },
  ];

  const commonTriggers = [
    {
      icon: Monitor,
      trigger: "Solo al computer",
      tip: "Lavora in spazi pubblici o con la porta aperta",
    },
    {
      icon: Bed,
      trigger: "Telefono a letto di notte",
      tip: "Carica il telefono in un'altra stanza",
    },
    {
      icon: Smartphone,
      trigger: "Navigazione sui social media",
      tip: "Limita o elimina le app scatenanti",
    },
    {
      icon: Clock,
      trigger: "Notte fonda quando sei stanco",
      tip: "Stabilisci un orario di andare a letto rigido e rispettalo",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          {"Identificare i Trigger"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-muted-foreground text-sm mb-4">
            {"I trigger sono le situazioni, le emozioni e i contesti che portano agli impulsi. Comprendere i tuoi trigger personali è essenziale per la prevenzione."}
          </p>
          
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{"Portati queste domande dopo ogni impulso:"}</p>
            {guidedQuestions.map((item) => (
              <div 
                key={item.question}
                className="p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="h-4 w-4 text-primary" />
                  <p className="font-medium text-foreground text-sm">{item.question}</p>
                </div>
                <p className="text-xs text-muted-foreground pl-6">{item.examples}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-3">{"Trigger Comuni e Soluzioni"}</p>
          <div className="grid gap-2">
            {commonTriggers.map((item) => (
              <div 
                key={item.trigger}
                className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
              >
                <item.icon className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">{item.trigger}</p>
                  <p className="text-xs text-muted-foreground">→ {item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
