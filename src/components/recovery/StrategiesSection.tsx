import { 
  Lightbulb, 
  Shield, 
  MapPin, 
  Flame, 
  Dumbbell, 
  Brain, 
  PenLine, 
  Users, 
  TreePine, 
  Gamepad2,
  Moon,
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const strategies = [
  {
    icon: Shield,
    title: "Remove Access",
    description: "Install blockers on all devices. Delete saved content. Make access difficult.",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    icon: MapPin,
    title: "Change Environment",
    description: "Move devices to public areas. Avoid being alone with screens. Change your routine.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Flame,
    title: "Track Your Streak",
    description: "Use a day counter. Celebrate milestones. Visualize your progress daily.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Dumbbell,
    title: "Exercise Regularly",
    description: "Physical activity releases healthy dopamine and reduces urges. Even 20 minutes helps.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Brain,
    title: "Meditation & Mindfulness",
    description: "Practice observing urges without acting. Even 5-10 minutes daily builds mental control.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Dumbbell,
    title: "Cold Showers",
    description: "Builds discipline and willpower. Shocks the system during cravings. Start with 30 seconds.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: PenLine,
    title: "Journaling",
    description: "Write about triggers, feelings, and victories. Self-awareness is crucial for recovery.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Users,
    title: "Social Connection",
    description: "Spend time with people. Isolation fuels addiction. Real connection heals.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: TreePine,
    title: "Time in Nature",
    description: "Nature calms the nervous system and provides healthy dopamine through beauty and awe.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Gamepad2,
    title: "Healthy Hobbies",
    description: "Replace the habit with something engaging: music, sports, learning, creating.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Moon,
    title: "Prioritize Sleep",
    description: "Fatigue weakens willpower. No screens 1 hour before bed. Aim for 7-9 hours.",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
  },
  {
    icon: Heart,
    title: "Self-Compassion",
    description: "Slips happen. Guilt fuels relapse. Treat yourself with the kindness you'd show a friend.",
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
  },
];

export function StrategiesSection() {
  const strategies = [
    {
      icon: Shield,
      title: "Rimuovi l'accesso",
      description: "Installa blocchi su tutti i dispositivi. Elimina i contenuti salvati. Rendi difficile l'accesso.",
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      icon: MapPin,
      title: "Cambia ambiente",
      description: "Sposta i dispositivi in aree pubbliche. Evita di essere da solo con gli schermi. Cambia la tua routine.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Flame,
      title: "Traccia la tua serie",
      description: "Usa un contatore giornaliero. Celebra i traguardi. Visualizza i tuoi progressi ogni giorno.",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Dumbbell,
      title: "Esercizio regolare",
      description: "L'attività fisica rilascia dopamina sana e riduce gli impulsi. Anche 20 minuti aiutano.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Brain,
      title: "Meditazione e Consapevolezza",
      description: "Pratica l'osservazione degli impulsi senza agire. Anche 5-10 minuti al giorno rafforzano il controllo mentale.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Dumbbell,
      title: "Docce fredde",
      description: "Costruisce disciplina e forza di volontà. Scuote il sistema durante i desideri. Inizia con 30 secondi.",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: PenLine,
      title: "Diario",
      description: "Scrivi di trigger, sentimenti e vittorie. La consapevolezza di sé è fondamentale per il recupero.",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: Users,
      title: "Connessione sociale",
      description: "Passa tempo con le persone. L'isolamento alimenta la dipendenza. La connessione reale guarisce.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      icon: TreePine,
      title: "Tempo nella natura",
      description: "La natura calma il sistema nervoso e fornisce dopamina sana attraverso la bellezza e lo stupore.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Gamepad2,
      title: "Hobby sani",
      description: "Sostituisci l'abitudine con qualcosa di coinvolgente: musica, sport, apprendimento, creazione.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Moon,
      title: "Dai priorità al sonno",
      description: "La stanchezza indebolisce la forza di volontà. Niente schermi un'ora prima di dormire. Mira a 7-9 ore.",
      color: "text-slate-500",
      bgColor: "bg-slate-500/10",
    },
    {
      icon: Heart,
      title: "Auto-compassione",
      description: "Gli inciampi accadono. La colpa alimenta le ricadute. Trattati con la gentilezza che riserveresti a un amico.",
      color: "text-rose-400",
      bgColor: "bg-rose-400/10",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          {"Strategie di Recupero Pratiche"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          {"Il recupero non riguarda solo smettere: riguarda costruire una vita in cui non hai bisogno della fuga. Queste strategie affrontano sia il comportamento che i bisogni sottostanti."}
        </p>
        
        <div className="grid gap-3">
          {strategies.map((strategy) => (
            <div 
              key={strategy.title}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${strategy.bgColor} shrink-0`}>
                <strategy.icon className={`h-4 w-4 ${strategy.color}`} />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{strategy.title}</p>
                <p className="text-xs text-muted-foreground">{strategy.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
