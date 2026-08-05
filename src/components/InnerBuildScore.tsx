import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ModuleBreakdown } from "@/hooks/useInnerBuildScore";
import { useTranslation } from "react-i18next";

interface InnerBuildScoreProps {
  score: number;
  breakdown?: ModuleBreakdown[];
}

const CATEGORY_ROUTES: Record<string, string> = {
  habits: "/habits",
  tasks: "/daily-planning",
  not_to_do: "/daily-planning",
  detox: "/challenges",
};

export default function InnerBuildScore({ score, breakdown = [] }: InnerBuildScoreProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const duration = 1000;
    const startTime = performance.now();
    const startScore = animatedScore;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setAnimatedScore(startScore + (score - startScore) * easeOutQuart);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      {/* Central Growth Ring */}
      <div className="relative">
        <svg width="160" height="160" className="transform -rotate-90">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted/40 dark:text-muted/30"
          />

          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            filter="url(#glow)"
          />
        </svg>

        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-foreground">
            {Math.round(animatedScore)}%
          </span>
        </div>
      </div>

      {/* Main Label */}
      <p className="mt-3 text-sm font-medium text-muted-foreground text-center">
        {t("dashboard.today_growth", "Crescita Odierna")}
      </p>

      {/* Dynamic Breakdown Pills */}
      {breakdown.length > 0 && (
        <div className="w-full mt-4 space-y-1.5 animate-fade-in">
          {breakdown.map((item) => {
            const targetRoute = CATEGORY_ROUTES[item.key];
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => targetRoute && navigate(targetRoute)}
                className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-card border border-border text-card-foreground dark:bg-[#131922] dark:border-white/10 shadow-sm backdrop-blur-sm ${
                  targetRoute ? "cursor-pointer hover:bg-muted/70 hover:border-border dark:hover:bg-[#1b222e] dark:hover:border-white/20 transition-all duration-200 active:scale-[0.99]" : ""
                }`}
                title={t("common.view_all", "Vedi tutto")}
              >
                {/* Left: Emoji + Title */}
                <div className="flex items-center gap-2 shrink-0 min-w-[92px]">
                  <span className="text-base select-none">{item.emoji}</span>
                  <span className="text-xs font-medium text-foreground truncate">
                    {t(item.titleKey, item.defaultTitle)}
                  </span>
                </div>

                {/* Center: Mini progressBar (4px height) + text counter */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <div className="flex-1 h-1 bg-muted dark:bg-emerald-950/60 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(item.progressRatio * 100)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                    {item.textCounter}
                  </span>
                </div>

                {/* Right: Percent contribution */}
                <div className="shrink-0 text-right min-w-[40px]">
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +{item.points}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

