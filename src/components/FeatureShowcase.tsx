import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarCheck,
  Bot,
  Flame,
  Shield,
  Target,
  Brain,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export interface ColorTheme {
  accentHex: string;
  iconBg: string;
  borderActive: string;
  bgActive: string;
  glowClass: string;
  badgeBg: string;
  badgeText: string;
  activePillBg: string;
}

export interface FeatureItem {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  fallbackTitle: string;
  fallbackDesc: string;
  videos: string[];
  labels?: string[];
  theme: ColorTheme;
}

export const FEATURES_DATA: FeatureItem[] = [
  {
    id: "daily_planning",
    icon: CalendarCheck,
    titleKey: "landing.features.daily_planning",
    descKey: "landing.features.daily_planning_desc",
    fallbackTitle: "Daily Planning & Reflection",
    fallbackDesc: "Pianifica la tua giornata con liste da fare/non fare e concludi con gratitudine e auto-riflessione.",
    videos: ["/daily planning innerbuild.mp4", "/evening innerbuild.mp4"],
    labels: ["Daily Planning", "Evening Reflection"],
    theme: {
      accentHex: "#4b9b75",
      iconBg: "bg-gradient-to-br from-[#4b9b75] to-[#C377D7] text-white shadow-md",
      borderActive: "border-l-4 border-l-[#4b9b75] border-t border-r border-b border-[#C377D7]/30",
      bgActive: "bg-gradient-to-r from-[#4b9b75]/10 via-card to-[#C377D7]/10 dark:from-[#4b9b75]/15 dark:to-[#C377D7]/15",
      glowClass: "bg-gradient-to-br from-[#4b9b75]/25 via-[#8A67B8]/20 to-[#C377D7]/25",
      badgeBg: "bg-gradient-to-r from-[#4b9b75]/20 to-[#C377D7]/20",
      badgeText: "text-[#4b9b75] dark:text-[#D28CE4]",
      activePillBg: "bg-gradient-to-r from-[#4b9b75] to-[#C377D7] text-white",
    },
  },
  {
    id: "ai_coach",
    icon: Bot,
    titleKey: "landing.features.ai_coach",
    descKey: "landing.features.ai_coach_desc",
    fallbackTitle: "Personal AI Coach",
    fallbackDesc: "Compagno AI disponibile 24/7 che ti motiva, suggerisce abitudini personalizzate e guida la tua trasformazione.",
    videos: ["/ai coach.mp4"],
    labels: ["AI Coach H24"],
    theme: {
      accentHex: "#C377D7",
      iconBg: "bg-[#C377D7] text-white shadow-md",
      borderActive: "border-l-4 border-l-[#C377D7] border-t border-r border-b border-[#C377D7]/30",
      bgActive: "bg-[#C377D7]/10 dark:bg-[#C377D7]/15",
      glowClass: "bg-[#C377D7]/25",
      badgeBg: "bg-[#C377D7]/15",
      badgeText: "text-[#C377D7] dark:text-[#D28CE4]",
      activePillBg: "bg-[#C377D7] text-white",
    },
  },
  {
    id: "detox_challenges",
    icon: Flame,
    titleKey: "landing.features.detox_challenges",
    descKey: "landing.features.detox_challenges_desc",
    fallbackTitle: "Detox Challenges",
    fallbackDesc: "Liberati dalle cattive abitudini con sfide basate sulla scienza da 3 a 90 giorni.",
    videos: ["/detox.mp4"],
    labels: ["Detox Program"],
    theme: {
      accentHex: "#4b9b75",
      iconBg: "bg-[#4b9b75] text-white shadow-md",
      borderActive: "border-l-4 border-l-[#4b9b75] border-t border-r border-b border-[#4b9b75]/30",
      bgActive: "bg-[#4b9b75]/10 dark:bg-[#4b9b75]/15",
      glowClass: "bg-[#4b9b75]/25",
      badgeBg: "bg-[#4b9b75]/15",
      badgeText: "text-[#4b9b75] dark:text-[#5ec396]",
      activePillBg: "bg-[#4b9b75] text-white",
    },
  },
  {
    id: "the_forge",
    icon: Shield,
    titleKey: "landing.features.the_forge",
    descKey: "landing.features.the_forge_desc",
    fallbackTitle: "The Renewal (Porn Recovery)",
    fallbackDesc: "Un percorso basato sulle neuroscienze per il recupero, il self-mastery e supporto guidato.",
    videos: ["/the renewal innerbuild.mp4"],
    labels: ["The Renewal Program"],
    theme: {
      accentHex: "#4D87D9",
      iconBg: "bg-[#4D87D9] text-white shadow-md",
      borderActive: "border-l-4 border-l-[#4D87D9] border-t border-r border-b border-[#4D87D9]/30",
      bgActive: "bg-[#4D87D9]/10 dark:bg-[#4D87D9]/15",
      glowClass: "bg-[#4D87D9]/25",
      badgeBg: "bg-[#4D87D9]/15",
      badgeText: "text-[#4D87D9] dark:text-[#619BF0]",
      activePillBg: "bg-[#4D87D9] text-white",
    },
  },
  {
    id: "smart_habit_tracking",
    icon: Target,
    titleKey: "landing.features.smart_habit_tracking",
    descKey: "landing.features.smart_habit_desc",
    fallbackTitle: "Smart Habit Tracking",
    fallbackDesc: "Traccia le tue abitudini quotidiane con progressi visivi, serie e adattamento AI automatico.",
    videos: [],
    labels: ["Smart Habit Tracking"],
    theme: {
      accentHex: "#4b9b75",
      iconBg: "bg-[#4b9b75] text-white shadow-md",
      borderActive: "border-l-4 border-l-[#4b9b75] border-t border-r border-b border-[#4b9b75]/30",
      bgActive: "bg-[#4b9b75]/10 dark:bg-[#4b9b75]/15",
      glowClass: "bg-[#4b9b75]/25",
      badgeBg: "bg-[#4b9b75]/15",
      badgeText: "text-[#4b9b75] dark:text-[#5ec396]",
      activePillBg: "bg-[#4b9b75] text-white",
    },
  },
  {
    id: "trigger_tracking",
    icon: Brain,
    titleKey: "landing.features.trigger_tracking",
    descKey: "landing.features.trigger_tracking_desc",
    fallbackTitle: "Trigger Tracking & Analysis",
    fallbackDesc: "Identifica cosa scatena i tuoi impulsi, scopri pattern e costruisci strategie di difesa efficaci.",
    videos: [],
    labels: ["Trigger Analytics"],
    theme: {
      accentHex: "#4D87D9",
      iconBg: "bg-[#4D87D9] text-white shadow-md",
      borderActive: "border-l-4 border-l-[#4D87D9] border-t border-r border-b border-[#4D87D9]/30",
      bgActive: "bg-[#4D87D9]/10 dark:bg-[#4D87D9]/15",
      glowClass: "bg-[#4D87D9]/25",
      badgeBg: "bg-[#4D87D9]/15",
      badgeText: "text-[#4D87D9] dark:text-[#619BF0]",
      activePillBg: "bg-[#4D87D9] text-white",
    },
  },
];

export default function FeatureShowcase() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string>("daily_planning");
  const [videoIndex, setVideoIndex] = useState<number>(0);

  // Dual video player references for smooth cross-fade
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [player1Src, setPlayer1Src] = useState<string>("");
  const [player2Src, setPlayer2Src] = useState<string>("");

  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);

  const selectedFeature = FEATURES_DATA.find((f) => f.id === selectedId) || FEATURES_DATA[0];
  const currentVideoSrc = selectedFeature.videos[videoIndex] || "";

  // Reset video sequence index on tab change
  useEffect(() => {
    setVideoIndex(0);
  }, [selectedId]);

  // Handle video source change & smooth cross-fade
  useEffect(() => {
    if (!currentVideoSrc) return;

    const encodedSrc = encodeURI(currentVideoSrc);

    if (activePlayer === 1) {
      setPlayer2Src(encodedSrc);
      setTimeout(() => {
        if (video2Ref.current) {
          video2Ref.current.currentTime = 0;
          video2Ref.current
            .play()
            .then(() => setActivePlayer(2))
            .catch(() => setActivePlayer(2));
        } else {
          setActivePlayer(2);
        }
      }, 50);
    } else {
      setPlayer1Src(encodedSrc);
      setTimeout(() => {
        if (video1Ref.current) {
          video1Ref.current.currentTime = 0;
          video1Ref.current
            .play()
            .then(() => setActivePlayer(1))
            .catch(() => setActivePlayer(1));
        } else {
          setActivePlayer(1);
        }
      }, 50);
    }
  }, [currentVideoSrc]);

  // Initial load
  useEffect(() => {
    if (selectedFeature.videos.length > 0) {
      const src = encodeURI(selectedFeature.videos[0]);
      setPlayer1Src(src);
      setActivePlayer(1);
      if (video1Ref.current) {
        video1Ref.current.play().catch(() => {});
      }
    }
  }, []);

  const handleVideoEnd = () => {
    if (selectedFeature.videos.length > 1) {
      setVideoIndex((prevIndex) => (prevIndex + 1) % selectedFeature.videos.length);
    } else if (selectedFeature.videos.length === 1) {
      const activeRef = activePlayer === 1 ? video1Ref.current : video2Ref.current;
      if (activeRef) {
        activeRef.currentTime = 0;
        activeRef.play().catch(() => {});
      }
    }
  };

  const SelectedIcon = selectedFeature.icon;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Clickable Feature List */}
        <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
          {FEATURES_DATA.map((feature) => {
            const isSelected = feature.id === selectedId;
            const Icon = feature.icon;
            const title = t(feature.titleKey, feature.fallbackTitle);
            const description = t(feature.descKey, feature.fallbackDesc);
            const theme = feature.theme;

            return (
              <button
                key={feature.id}
                onClick={() => setSelectedId(feature.id)}
                type="button"
                className={`group relative w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 flex items-start gap-4 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? `${theme.bgActive} ${theme.borderActive} shadow-lg scale-[1.01]`
                    : "bg-card/40 hover:bg-card/80 border border-border/60 text-foreground/70 hover:text-foreground"
                }`}
              >
                <div
                  className={`p-2.5 sm:p-3 rounded-xl shrink-0 transition-all duration-300 ${
                    isSelected
                      ? `${theme.iconBg} scale-105`
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`font-bold text-base sm:text-lg tracking-tight transition-colors duration-200 ${
                        isSelected ? "text-foreground opacity-100" : "text-foreground/80 opacity-80 group-hover:opacity-100"
                      }`}
                    >
                      {title}
                    </h3>
                    {isSelected && (
                      <span
                        className={`inline-flex items-center text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}
                      >
                        Attivo
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed transition-colors duration-200 line-clamp-2 ${
                      isSelected ? "text-muted-foreground opacity-100" : "text-muted-foreground/70 opacity-70 group-hover:opacity-90"
                    }`}
                  >
                    {description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: iPhone-style Mockup + Video */}
        <div className="lg:col-span-6 flex justify-center items-center relative py-4 sm:py-8">
          {/* Dynamic Ambient Glow matching selected feature theme */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`w-[260px] sm:w-[320px] h-[520px] sm:h-[620px] rounded-full blur-[140px] transition-all duration-700 ease-in-out ${selectedFeature.theme.glowClass}`}
            />
          </div>

          {/* iPhone Mockup Container - ratio 9:19.5 matching modern smartphones so full screen video fits without vertical crop */}
          <div className="relative z-10 w-[270px] sm:w-[295px] md:w-[315px] aspect-[9/19.5] rounded-[44px] border-[2px] border-foreground/15 dark:border-white/15 bg-black shadow-2xl overflow-hidden flex flex-col p-1.5 sm:p-2 ring-1 ring-black/20">
            {/* Dynamic Island Notch */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 w-24 h-4 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
            </div>

            {/* Inner Phone Screen */}
            <div className="relative w-full h-full rounded-[36px] overflow-hidden bg-black flex flex-col items-center justify-center">
              {selectedFeature.videos.length > 0 ? (
                <>
                  {/* Player 1 */}
                  <video
                    ref={video1Ref}
                    src={player1Src}
                    muted
                    playsInline
                    onEnded={handleVideoEnd}
                    className={`absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-500 ease-in-out ${
                      activePlayer === 1 ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  />

                  {/* Player 2 */}
                  <video
                    ref={video2Ref}
                    src={player2Src}
                    muted
                    playsInline
                    onEnded={handleVideoEnd}
                    className={`absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-500 ease-in-out ${
                      activePlayer === 2 ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  />

                  {/* Multi-video label pill indicator - compact, centered, no text overflow */}
                  {selectedFeature.labels && selectedFeature.labels.length > 0 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 max-w-[90%] px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium tracking-wide flex items-center justify-center gap-1.5 shadow-xl">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary animate-ping" />
                      <span className="truncate">{selectedFeature.labels[videoIndex] || selectedFeature.labels[0]}</span>
                      {selectedFeature.videos.length > 1 && (
                        <span className="opacity-70 text-[9px] shrink-0 font-bold">
                          ({videoIndex + 1}/{selectedFeature.videos.length})
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Fallback for features without video yet */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-card to-background">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-soft ${selectedFeature.theme.iconBg}`}
                  >
                    <SelectedIcon className="h-8 w-8 text-white animate-pulse" />
                  </div>
                  <h4 className="text-base font-bold text-foreground mb-2">
                    {t(selectedFeature.titleKey, selectedFeature.fallbackTitle)}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-[200px]">
                    {t(selectedFeature.descKey, selectedFeature.fallbackDesc)}
                  </p>

                  <div
                    className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 ${selectedFeature.theme.badgeBg} ${selectedFeature.theme.badgeText}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    Preview Video In Arrivo
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
