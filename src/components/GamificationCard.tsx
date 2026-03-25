import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Star, Zap, Target, Flame, Award, Medal, Crown, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  earned: boolean;
  earnedDate?: string;
}

interface Stats {
  totalHabitsCompleted: number;
  totalChallengesDone: number;
  longestStreak: number;
  reflectionsWritten: number;
}

export default function GamificationCard() {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [stats, setStats] = useState<Stats>({
    totalHabitsCompleted: 0,
    totalChallengesDone: 0,
    longestStreak: 0,
    reflectionsWritten: 0,
  });
  const [loading, setLoading] = useState(true);

  // XP required for each level (exponential growth)
  const xpForLevel = (lvl: number) => Math.floor(100 * Math.pow(1.5, lvl - 1));
  const currentLevelXp = xpForLevel(level);
  const prevLevelXp = level > 1 ? xpForLevel(level - 1) : 0;
  const xpInCurrentLevel = xp - prevLevelXp;
  const xpNeededForNextLevel = currentLevelXp - prevLevelXp;
  const levelProgress = Math.min((xpInCurrentLevel / xpNeededForNextLevel) * 100, 100);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch total habit completions
      const { count: habitCount } = await supabase
        .from("habit_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch completed challenges
      const { data: challenges } = await supabase
        .from("detox_challenges")
        .select("status, longest_streak")
        .eq("user_id", user.id);

      const completedChallenges = challenges?.filter(c => c.status === "completed").length || 0;
      const longestStreak = challenges?.reduce((max, c) => Math.max(max, c.longest_streak || 0), 0) || 0;

      // Fetch reflections count
      const { count: reflectionCount } = await supabase
        .from("reflections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        totalHabitsCompleted: habitCount || 0,
        totalChallengesDone: completedChallenges,
        longestStreak,
        reflectionsWritten: reflectionCount || 0,
      });

      // Calculate XP
      const totalXp = 
        (habitCount || 0) * 10 + // 10 XP per habit completion
        completedChallenges * 100 + // 100 XP per challenge
        (reflectionCount || 0) * 15 + // 15 XP per reflection
        longestStreak * 5; // 5 XP per day of longest streak

      setXp(totalXp);

      // Calculate level
      let lvl = 1;
      while (totalXp >= xpForLevel(lvl)) {
        lvl++;
      }
      setLevel(lvl);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Badge definitions based on stats
  const badges: Badge[] = [
    {
      id: "first-step",
      name: "First Step",
      description: "Complete your first habit",
      icon: Star,
      color: "text-badge-gold",
      earned: stats.totalHabitsCompleted >= 1,
    },
    {
      id: "streak-starter",
      name: "Streak Starter",
      description: "Reach a 7-day streak",
      icon: Flame,
      color: "text-accent",
      earned: stats.longestStreak >= 7,
    },
    {
      id: "habit-hero",
      name: "Habit Hero",
      description: "Complete 50 habits",
      icon: Target,
      color: "text-primary",
      earned: stats.totalHabitsCompleted >= 50,
    },
    {
      id: "challenge-champion",
      name: "Challenge Champion",
      description: "Complete a detox challenge",
      icon: Trophy,
      color: "text-badge-gold",
      earned: stats.totalChallengesDone >= 1,
    },
    {
      id: "reflective",
      name: "Reflective Soul",
      description: "Write 10 reflections",
      icon: Award,
      color: "text-xp",
      earned: stats.reflectionsWritten >= 10,
    },
    {
      id: "legend",
      name: "Living Legend",
      description: "Reach a 30-day streak",
      icon: Crown,
      color: "text-badge-gold",
      earned: stats.longestStreak >= 30,
    },
  ];

  const earnedBadges = badges.filter(b => b.earned);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-card">
      {/* XP Header */}
      <div className="gradient-xp p-4 text-xp-foreground">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs opacity-80">Level {level}</p>
              <p className="font-bold text-lg">{xp.toLocaleString()} XP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Next level</p>
            <p className="font-semibold">{Math.ceil(currentLevelXp - xp)} XP</p>
          </div>
        </div>
        <Progress 
          value={levelProgress} 
          className="h-2 bg-white/20" 
        />
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.totalHabitsCompleted}</p>
          <p className="text-xs text-muted-foreground">Habits Done</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.longestStreak}</p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.totalChallengesDone}</p>
          <p className="text-xs text-muted-foreground">Challenges Won</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.reflectionsWritten}</p>
          <p className="text-xs text-muted-foreground">Reflections</p>
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Medal className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">Badges ({earnedBadges.length}/{badges.length})</h4>
        </div>
        <div className="flex flex-wrap gap-2 pt-8">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`relative group ${!badge.earned && "opacity-30 grayscale"}`}
              >
                <div className={`w-10 h-10 rounded-xl ${
                  badge.earned ? "bg-muted" : "bg-muted/50"
                } flex items-center justify-center transition-transform hover:scale-110`}>
                  <Icon className={`h-5 w-5 ${badge.earned ? badge.color : "text-muted-foreground"}`} />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
                  {badge.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
