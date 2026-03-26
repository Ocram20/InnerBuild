import { X, Leaf, Zap, Shield, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitsProgressSection } from "./HabitsProgressSection";
import { TriggersProgressSection } from "./TriggersProgressSection";
import { ChallengesProgressSection } from "./ChallengesProgressSection";
import { MoodProgressSection } from "./MoodProgressSection";
import type {
  HabitProgressDetail,
  TriggerProgressDetail,
  ChallengeProgressDetail,
  MoodProgressDetail,
} from "@/hooks/useProgressData";
import { useTranslation } from "react-i18next";

type Section = "habits" | "triggers" | "challenges" | "mood";

interface Props {
  section: Section;
  onClose: () => void;
  habitDetails: HabitProgressDetail[];
  triggerDetails: TriggerProgressDetail | null;
  challengeDetails: ChallengeProgressDetail[];
  moodDetails: MoodProgressDetail | null;
  days?: number;
}

const sectionMeta: Record<Section, { key: string; icon: typeof Leaf }> = {
  habits: { key: "progress_deep_dive.habits", icon: Leaf },
  triggers: { key: "progress_deep_dive.triggers", icon: Zap },
  challenges: { key: "progress_deep_dive.challenges", icon: Shield },
  mood: { key: "progress_deep_dive.mood", icon: Heart },
};

export function ProgressDeepDive({
  const { t } = useTranslation();
  section,
  onClose,
  habitDetails,
  triggerDetails,
  challengeDetails,
  moodDetails,
  days = 14,
}: Props) {
  const meta = sectionMeta[section];
  const Icon = meta.icon;

  return (
    <div className="glass rounded-2xl overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">{t(meta.key)}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {section === "habits" && <HabitsProgressSection habits={habitDetails} days={days} />}
        {section === "triggers" && triggerDetails && <TriggersProgressSection data={triggerDetails} days={days} />}
        {section === "challenges" && <ChallengesProgressSection challenges={challengeDetails} />}
        {section === "mood" && moodDetails && <MoodProgressSection data={moodDetails} />}
      </div>
    </div>
  );
}
