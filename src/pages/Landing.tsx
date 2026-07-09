import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFirstLoad } from "@/hooks/useFirstLoad";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LandingFooter from "@/components/LandingFooter";
import LandingAppPreview from "@/components/LandingAppPreview";
import { ScrollReveal } from "@/components/ScrollReveal";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { 
  Leaf, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Moon,
  Sun,
  Flame,
  Bot,
  BookOpen,
  Brain,
  Shield,
  Zap,
  Clock,
  Ban,
  ShieldAlert,
  Eye,
  Target,
  CalendarCheck,
  Crown,
  BarChart3,
} from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isFirstLoad = useFirstLoad();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const noRedirect = params.get("no_redirect") === "true";
    
    if (!loading && user && !noRedirect) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow animate-pulse">
          <Leaf className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>
    );
  }

  const params = new URLSearchParams(window.location.search);
  const noRedirect = params.get("no_redirect") === "true";

  if (user && !noRedirect) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  const mainFeatureDefs = [
    { icon: Target, titleKey: "landing.features.smart_habit_tracking", descKey: "landing.features.smart_habit_desc", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { icon: Flame, titleKey: "landing.features.detox_challenges", descKey: "landing.features.detox_challenges_desc", color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { icon: Eye, titleKey: "landing.features.the_forge", descKey: "landing.features.the_forge_desc", color: "text-violet-500", bgColor: "bg-violet-500/10" },
    { icon: Bot, titleKey: "landing.features.ai_coach", descKey: "landing.features.ai_coach_desc", color: "text-primary", bgColor: "bg-primary/10" },
    { icon: ShieldAlert, titleKey: "landing.features.trigger_tracking", descKey: "landing.features.trigger_tracking_desc", color: "text-rose-500", bgColor: "bg-rose-500/10" },
    { icon: CalendarCheck, titleKey: "landing.features.daily_planning", descKey: "landing.features.daily_planning_desc", color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  ];

  const additionalFeatureDefs = [
    { icon: Brain, titleKey: "landing.features.ai_habit_adaptation", descKey: "landing.features.ai_habit_adaptation_desc" },
    { icon: BookOpen, titleKey: "landing.features.learn_section", descKey: "landing.features.learn_section_desc" },
    { icon: Shield, titleKey: "landing.features.streak_tracking", descKey: "landing.features.streak_tracking_desc" },
    { icon: Zap, titleKey: "landing.features.micro_actions", descKey: "landing.features.micro_actions_desc" },
    { icon: Ban, titleKey: "landing.features.not_to_do_list", descKey: "landing.features.not_to_do_desc" },
    { icon: Clock, titleKey: "landing.features.recovery_timeline", descKey: "landing.features.recovery_timeline_desc" },
  ];

  const statDefs = [
    { value: "90+", labelKey: "landing.stats.recovery_days" },
    { value: "50+", labelKey: "landing.stats.suggested_habits" },
    { value: "12+", labelKey: "landing.stats.challenge_templates" },
    { value: "24/7", labelKey: "landing.stats.ai_coach_available" },
  ];

  const socialProof = [
    { initial: "M", name: "Marco", color: "bg-primary" },
    { initial: "S", name: "Sara", color: "bg-accent" },
    { initial: "L", name: "Luca", color: "bg-indigo-500" },
    { initial: "A", name: "Alex", color: "bg-rose-500" },
    { initial: "D", name: "Davide", color: "bg-emerald-600" },
  ];

  const testimonialDefs = [
    { stars: 5, quoteKey: "landing.testimonials_data.t1", author: "Marco B." },
    { stars: 5, quoteKey: "landing.testimonials_data.t2", author: "Sara L." },
    { stars: 5, quoteKey: "landing.testimonials_data.t3", author: "Luca M." },
    { stars: 4, quoteKey: "landing.testimonials_data.t4", author: "Alex R." },
    { stars: 5, quoteKey: "landing.testimonials_data.t5", author: "Davide F." },
    { stars: 4, quoteKey: "landing.testimonials_data.t6", author: "Giulia T." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — floating pill nav */}
      <header className="sticky top-0 safe-area-header z-50 px-3 pt-3 md:pt-4">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-2 pl-4 shadow-lg backdrop-blur-xl md:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full gradient-primary shadow-soft md:h-9 md:w-9">
              <Leaf className="h-4 w-4 text-primary-foreground md:h-[18px] md:w-[18px]" />
            </div>
            <span className="notranslate truncate text-base font-bold tracking-tight text-foreground md:text-lg" translate="no">InnerBuild</span>
          </div>

          <div className="flex items-center gap-1">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full"
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>
            {user ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="h-9 rounded-full gradient-primary px-4 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:shadow-lg active:scale-95 md:text-sm"
              >
                {t("landing.dashboard")}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="hidden h-9 rounded-full px-3 text-xs font-medium sm:inline-flex md:text-sm"
                >
                  {t("auth.sign_in")}
                </Button>
                <Button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="h-9 rounded-full gradient-primary px-4 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:shadow-lg active:scale-95 md:text-sm"
                >
                  {t("landing.get_started")}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-12 pb-16 md:pt-20 md:pb-24">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0 grid-pattern" />
          <div className="glow-blob left-1/4 top-0 h-72 w-72 gradient-primary" />
          <div className="glow-blob right-1/4 top-20 h-72 w-72 gradient-accent animate-float-slow" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Left: copy */}
            <ScrollReveal className="text-center lg:text-left">
              <Badge
                variant="secondary"
                className="mb-6 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-medium backdrop-blur"
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {t("landing.your_companion")}
              </Badge>

              <h1 className="mb-6 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
                {t("landing.hero_title_1")}{" "}
                <span className="text-gradient-primary">{t("landing.hero_title_2")}</span>
              </h1>

              <p className="mx-auto mb-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground lg:mx-0">
                {t("landing.hero_description")}
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
                  className="group h-14 rounded-full gradient-primary px-8 text-base font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95"
                >
                  {t("landing.start_your_journey")}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/pricing")}
                  className="h-14 rounded-full border-border/70 bg-card/40 px-8 text-base font-medium backdrop-blur transition-all duration-300 hover:bg-card hover:scale-[1.02] active:scale-95"
                >
                  {t("landing.view_pricing")}
                </Button>
              </div>

              {/* Social proof */}
              <div className="mt-10 flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex -space-x-2.5">
                  {socialProof.map((p) => (
                    <div
                      key={p.name}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-background text-[11px] font-bold text-white ${p.color}`}
                    >
                      {p.initial}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-0.5 text-accent">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xs">★</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("landing.trusted_by_people", "Loved by people building better habits")}</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: app preview */}
            <ScrollReveal variant="scale" delay={150} className="flex justify-center lg:justify-end">
              <LandingAppPreview />
            </ScrollReveal>
          </div>
        </section>

        {/* Main Features — bento */}
        <section className="px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal className="mb-12 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {t("landing.features_eyebrow", "Features")}
              </p>
              <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                {t("landing.everything_transform")}
              </h2>
              <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
                {t("landing.complete_toolkit")}
              </p>
            </ScrollReveal>

            {/* Mobile: carousel */}
            <ScrollReveal className="md:hidden" delay={150}>
              <Carousel opts={{ align: "center", loop: true }}>
                <CarouselContent>
                  {mainFeatureDefs.map((feature) => (
                    <CarouselItem key={feature.titleKey} className="basis-[85%]">
                      <div className="premium-card h-full rounded-3xl p-6">
                        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bgColor}`}>
                          <feature.icon className={`h-6 w-6 ${feature.color}`} />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">{t(feature.titleKey)}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{t(feature.descKey)}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                <span>←</span> {t("common.swipe_explore")} <span>→</span>
              </p>
            </ScrollReveal>

            {/* Desktop: bento grid */}
            <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
              {mainFeatureDefs.map((feature, index) => {
                const wide = index === 0 || index === 5;
                return (
                  <ScrollReveal
                    key={feature.titleKey}
                    delay={index * 80}
                    variant="scale"
                    className={wide ? "md:col-span-2" : ""}
                  >
                    <div className="premium-card group relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:premium-ring">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bgColor} transition-transform group-hover:scale-110`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">{t(feature.titleKey)}</h3>
                      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{t(feature.descKey)}</p>
                      {wide && (
                        <div className="mt-5 flex items-end gap-1.5">
                          {[40, 65, 50, 80, 60, 95, 72].map((h, i) => (
                            <div
                              key={i}
                              className={`w-full rounded-full ${feature.bgColor}`}
                              style={{ height: `${h * 0.4}px` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            {/* Additional features — elegant chips */}
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {additionalFeatureDefs.map((feature, index) => (
                <ScrollReveal key={feature.titleKey} delay={index * 60} variant="scale">
                  <div className="premium-card flex h-full flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xs font-semibold text-foreground">{t(feature.titleKey)}</h3>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 pb-16 md:pb-24">
          <ScrollReveal className="mx-auto max-w-5xl">
            <div className="premium-card grid grid-cols-2 gap-y-8 rounded-3xl px-6 py-10 md:grid-cols-4 md:divide-x md:divide-border/60">
              {statDefs.map((stat) => (
                <div key={stat.labelKey} className="px-4 text-center">
                  <p className="mb-1 text-4xl font-extrabold tracking-tight text-gradient-primary md:text-5xl">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Testimonials */}
        <section className="px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal className="mb-12 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("landing.testimonials")}</p>
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">{t("landing.real_people")}</h2>
            </ScrollReveal>

            {/* Mobile: swipeable carousel — Desktop: grid */}
            <ScrollReveal className="md:hidden" delay={100}>
              <Carousel opts={{ align: "center", loop: true }}>
                <CarouselContent>
                  {testimonialDefs.map((review) => {
                    const avatar = socialProof.find((s) => review.author.startsWith(s.name));
                    return (
                      <CarouselItem key={review.quoteKey} className="basis-[85%]">
                        <div className="premium-card flex h-full flex-col gap-4 rounded-3xl p-6">
                          <div className="flex gap-0.5 text-accent">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.stars ? "" : "text-muted"}>★</span>
                            ))}
                          </div>
                          <p className="flex-1 text-sm leading-relaxed text-foreground">&ldquo;{t(review.quoteKey)}&rdquo;</p>
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${avatar?.color ?? "bg-primary"}`}>
                              {review.author.charAt(0)}
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{review.author}</p>
                          </div>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
              </Carousel>
              <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                <span>←</span> {t("common.swipe_read_more")} <span>→</span>
              </p>
            </ScrollReveal>

            {/* Desktop: grid layout */}
            <div className="hidden gap-4 md:grid md:grid-cols-3">
              {testimonialDefs.map((review, index) => {
                const avatar = socialProof.find((s) => review.author.startsWith(s.name));
                return (
                  <ScrollReveal key={review.quoteKey} delay={index * 80} variant="scale">
                    <div className="premium-card flex h-full flex-col gap-4 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex gap-0.5 text-accent">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.stars ? "" : "text-muted"}>★</span>
                        ))}
                      </div>
                      <p className="flex-1 text-sm leading-relaxed text-foreground">&ldquo;{t(review.quoteKey)}&rdquo;</p>
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${avatar?.color ?? "bg-primary"}`}>
                          {review.author.charAt(0)}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{review.author}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* How InnerBuild Works — 3 steps */}
        <section className="relative overflow-hidden px-4 py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0 grid-pattern" />
          <div className="glow-blob left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 gradient-primary" />
          <div className="relative mx-auto max-w-4xl">
            <ScrollReveal className="mb-14 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {t("landing.how_it_works.eyebrow", "How it works")}
              </p>
              <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                {t("landing.how_it_works.title", "How InnerBuild Works")}
              </h2>
              <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
                {t("landing.how_it_works.subtitle", "Three simple steps to break bad habits, understand your triggers, and build lasting self-mastery.")}
              </p>
            </ScrollReveal>

            <div className="flex flex-col gap-5">
              {howItWorks.map((step, index) => (
                <ScrollReveal key={step.number} variant="left" delay={index * 120}>
                  <div className="premium-card group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:premium-ring md:p-8">
                    {/* Green accent glow */}
                    <div className="glow-blob -left-10 top-1/2 h-40 w-40 -translate-y-1/2 gradient-primary opacity-0 transition-opacity duration-500 group-hover:opacity-40" />
                    <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                      {/* Number + icon */}
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-extrabold tabular-nums text-primary/25 transition-colors group-hover:text-primary/50 md:text-4xl">
                          {step.number}
                        </span>
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 transition-transform group-hover:scale-110">
                          <step.icon className="h-7 w-7 text-primary" />
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="mb-1.5 text-lg font-bold text-foreground md:text-xl">
                          {t(step.titleKey, step.titleFallback)}
                        </h3>
                        <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                          {t(step.descKey, step.descFallback)}
                        </p>
                      </div>
                      <ArrowRight className="hidden h-5 w-5 flex-shrink-0 text-primary/40 transition-all group-hover:translate-x-1 group-hover:text-primary sm:block" />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="relative overflow-hidden px-4 py-16 md:py-24">
          <div className="pointer-events-none absolute inset-0 grid-pattern" />
          <div className="relative mx-auto max-w-md">
            <ScrollReveal className="mb-10 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {t("landing.pricing_eyebrow", "Pricing")}
              </p>
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                {t("landing.pricing_title", "One plan, everything unlocked")}
              </h2>
            </ScrollReveal>

            <ScrollReveal variant="scale" delay={150}>
              <div className="premium-card group relative overflow-hidden rounded-[2rem] p-8 text-center premium-ring transition-all duration-300 hover:-translate-y-1">
                <div className="glow-blob left-1/2 top-0 h-48 w-48 -translate-x-1/2 gradient-accent opacity-30 transition-opacity duration-500 group-hover:opacity-60" />
                <div className="relative">
                  <Badge className="mb-5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <Crown className="mr-1.5 h-3.5 w-3.5 text-accent" />
                    {t("common.premium")}
                  </Badge>
                  <p className="mb-1 text-sm text-muted-foreground">{t("landing.all_premium_for")}</p>
                  <p className="mb-6 flex items-end justify-center gap-1 font-extrabold tracking-tight text-foreground">
                    <span className="text-6xl text-gradient-primary">€9.99</span>
                    <span className="mb-1.5 text-base font-normal text-muted-foreground">/{t("common.month")}</span>
                  </p>

                  <div className="mb-7 space-y-2.5 text-left">
                    {pricingHighlights.map((item) => (
                      <div key={item.key} className="flex items-center gap-3">
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{t(item.key, item.fallback)}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="lg"
                    onClick={() => navigate(user ? "/pricing" : "/auth?mode=signup")}
                    className="h-14 w-full rounded-full gradient-accent px-10 text-base font-semibold text-accent-foreground shadow-soft transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95"
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    {t("landing.unlock_premium")}
                  </Button>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {t("landing.pricing_reassurance", "Cancel anytime. No hidden fees.")}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-16 md:py-24">
          <ScrollReveal className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[2.5rem] gradient-primary px-6 py-16 text-center shadow-glow md:px-12 md:py-20">
              <div className="glow-blob left-1/2 top-0 h-64 w-64 -translate-x-1/2 bg-primary-foreground/30" />
              <div className="relative">
                <h2 className="mx-auto mb-4 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-primary-foreground md:text-5xl">
                  {t("landing.ready_to_start")}
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-pretty text-primary-foreground/90">
                  {t("landing.join_thousands")}
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
                  className="group h-14 rounded-full bg-background px-10 text-base font-semibold text-foreground shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl active:scale-95"
                >
                  {t("landing.get_started_free")}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
