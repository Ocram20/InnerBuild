import {
  Droplets,
  BookOpen,
  Footprints,
  Brain,
  Moon,
  Apple,
  Dumbbell,
  Smile,
  Clock,
  Sun,
} from "lucide-react";
import { useTranslation } from "react-i18next";
interface SuggestedHabit {
  title: string;
  description: string;
  category: string;
  frequency: string;
  difficulty: "easy" | "medium" | "hard";
  icon: React.ElementType;
}

interface HabitTemplate {
  id: string;
  category: string;
  frequency: string;
  difficulty: "easy" | "medium" | "hard";
  icon: React.ElementType;
}

const habitTemplates: HabitTemplate[] = [
  { id: "drink_water", category: "health", frequency: "daily", difficulty: "easy", icon: Droplets },
  { id: "deep_breaths", category: "mindfulness", frequency: "daily", difficulty: "easy", icon: Brain },
  { id: "make_bed", category: "productivity", frequency: "daily", difficulty: "easy", icon: Sun },
  { id: "read_10min", category: "learning", frequency: "daily", difficulty: "medium", icon: BookOpen },
  { id: "walk_10min", category: "fitness", frequency: "daily", difficulty: "medium", icon: Footprints },
  { id: "eat_fruit", category: "health", frequency: "daily", difficulty: "medium", icon: Apple },
  { id: "gratitude", category: "mindfulness", frequency: "daily", difficulty: "medium", icon: Smile },
  { id: "meditate_15min", category: "mindfulness", frequency: "daily", difficulty: "hard", icon: Brain },
  { id: "exercise_30min", category: "fitness", frequency: "daily", difficulty: "hard", icon: Dumbbell },
  { id: "sleep_8hrs", category: "health", frequency: "daily", difficulty: "hard", icon: Moon },
  { id: "no_phone_1hr", category: "productivity", frequency: "daily", difficulty: "hard", icon: Clock },
];

interface SuggestedHabitsProps {
  onSelect: (habit: { title: string; description: string; category: string; frequency: string }) => void;
}

const difficultyColors = {
  const { t } = useTranslation();
  easy: "bg-primary/10 text-primary border-primary/20",
  medium: "bg-accent/10 text-accent border-accent/20",
  hard: "bg-xp/10 text-xp border-xp/20",
};

const difficultyLabels = {
  easy: "suggested_habits.easy",
  medium: "suggested_habits.medium",
  hard: "suggested_habits.challenge",
};

export default function SuggestedHabits({ onSelect }: SuggestedHabitsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {"Inizia con abitudini suggerite:"}
      </p>
      
      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
        {habitTemplates.map((habit, index) => {
          const Icon = habit.icon;
          const title = t(`suggested_habits.items.${habit.id}.title`);
          const description = t(`suggested_habits.items.${habit.id}.description`);
          return (
            <button
              key={index}
              onClick={() => onSelect({
                title,
                description,
                category: habit.category,
                frequency: habit.frequency,
              })}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{title}</p>
                <p className="text-xs text-muted-foreground truncate">{description}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[habit.difficulty]}`}>
                {t(difficultyLabels[habit.difficulty])}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
