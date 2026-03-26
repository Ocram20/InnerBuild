import {
  Smartphone,
  Brain,
  Shield,
  Flame,
  Clock,
  Users,
  Sparkles,
  Moon,
  Eye,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export interface SuggestedChallenge {
  id: string;
  title: string;
  description: string;
  category: "digital_detox" | "mental_reset" | "porn_detox" | "general";
  duration_days: number;
  science_note: string;
  daily_steps: string[];
  participants: number;
  icon: React.ElementType;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface ChallengeTemplate {
  id: string;
  category: "digital_detox" | "mental_reset" | "porn_detox" | "general";
  duration_days: number;
  participants: number;
  icon: React.ElementType;
  difficulty: "beginner" | "intermediate" | "advanced";
}

const challengeTemplates: ChallengeTemplate[] = [
  { id: "social-media-7", category: "digital_detox", duration_days: 7, participants: 2847, icon: Smartphone, difficulty: "beginner" },
  { id: "screen-time-21", category: "digital_detox", duration_days: 21, participants: 1523, icon: Clock, difficulty: "intermediate" },
  { id: "dopamine-detox-3", category: "digital_detox", duration_days: 3, participants: 4201, icon: Zap, difficulty: "advanced" },
  { id: "mindfulness-30", category: "mental_reset", duration_days: 30, participants: 3156, icon: Brain, difficulty: "intermediate" },
  { id: "negativity-fast-7", category: "mental_reset", duration_days: 7, participants: 2089, icon: Sparkles, difficulty: "intermediate" },
  { id: "sleep-reset-14", category: "mental_reset", duration_days: 14, participants: 1834, icon: Moon, difficulty: "beginner" },
  { id: "nofap-30", category: "porn_detox", duration_days: 30, participants: 5672, icon: Shield, difficulty: "advanced" },
  { id: "recovery-90", category: "porn_detox", duration_days: 90, participants: 3421, icon: Flame, difficulty: "advanced" },
  { id: "awareness-week-7", category: "porn_detox", duration_days: 7, participants: 2156, icon: Eye, difficulty: "beginner" },
];

function useSuggestedChallenges(): SuggestedChallenge[] {
  const { t } = useTranslation();
  return challengeTemplates.map((tmpl) => ({
    ...tmpl,
    title: t(`suggested_challenges_content.${tmpl.id}.title`),
    description: t(`suggested_challenges_content.${tmpl.id}.description`),
    science_note: t(`suggested_challenges_content.${tmpl.id}.science_note`),
    daily_steps: (t(`suggested_challenges_content.${tmpl.id}.daily_steps`, { returnObjects: true }) as string[]),
  }));
}

interface SuggestedChallengesListProps {
  category: string;
  onStartChallenge: (challenge: SuggestedChallenge) => void;
  disabled?: boolean;
}

const difficultyColors = {
  beginner: "bg-primary/10 text-primary",
  intermediate: "bg-accent/10 text-accent",
  advanced: "bg-xp/10 text-xp",
};

const categoryColors = {
  digital_detox: "text-level bg-level/10",
  mental_reset: "text-xp bg-xp/10",
  porn_detox: "text-accent bg-accent/10",
  general: "text-muted-foreground bg-muted",
};

export default function SuggestedChallengesList({ category, onStartChallenge, disabled }: SuggestedChallengesListProps) {
  const { t } = useTranslation();
  const suggestedChallenges = useSuggestedChallenges();

  const filteredChallenges = category === "all" 
    ? suggestedChallenges 
    : suggestedChallenges.filter(c => c.category === category);

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-60' : ''}`}>
      {filteredChallenges.map((challenge) => {
        const Icon = challenge.icon;
        return (
          <button
            key={challenge.id}
            onClick={() => !disabled && onStartChallenge(challenge)}
            disabled={disabled}
            className={`w-full glass rounded-2xl p-4 text-left shadow-card transition-all group ${disabled ? 'cursor-not-allowed' : 'hover:shadow-soft'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[challenge.category]}`}>
                <Icon className="h-6 w-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {challenge.title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${difficultyColors[challenge.difficulty]}`}>
                    {t(`suggested_challenges.${challenge.difficulty}`)}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {challenge.description}
                </p>
                
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {`${challenge.duration_days} giorni`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {`${challenge.participants} iscritti`}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
