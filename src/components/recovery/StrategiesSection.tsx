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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const strategies = [
    {
      icon: Shield,
      title: t("strategies_section.remove_access_title"),
      description: t("strategies_section.remove_access_desc"),
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      icon: MapPin,
      title: t("strategies_section.change_env_title"),
      description: t("strategies_section.change_env_desc"),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Flame,
      title: t("strategies_section.track_streak_title"),
      description: t("strategies_section.track_streak_desc"),
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Dumbbell,
      title: t("strategies_section.exercise_title"),
      description: t("strategies_section.exercise_desc"),
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Brain,
      title: t("strategies_section.meditation_title"),
      description: t("strategies_section.meditation_desc"),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Dumbbell,
      title: t("strategies_section.cold_showers_title"),
      description: t("strategies_section.cold_showers_desc"),
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: PenLine,
      title: t("strategies_section.journaling_title"),
      description: t("strategies_section.journaling_desc"),
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: Users,
      title: t("strategies_section.social_title"),
      description: t("strategies_section.social_desc"),
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      icon: TreePine,
      title: t("strategies_section.nature_title"),
      description: t("strategies_section.nature_desc"),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Gamepad2,
      title: t("strategies_section.hobbies_title"),
      description: t("strategies_section.hobbies_desc"),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Moon,
      title: t("strategies_section.prioritize_sleep_title"),
      description: t("strategies_section.prioritize_sleep_desc"),
      color: "text-slate-500",
      bgColor: "bg-slate-500/10",
    },
    {
      icon: Heart,
      title: t("strategies_section.self_compassion_title"),
      description: t("strategies_section.self_compassion_desc"),
      color: "text-rose-400",
      bgColor: "bg-rose-400/10",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          {t("strategies_section.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          {t("strategies_section.description")}
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
