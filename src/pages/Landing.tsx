import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFirstLoad } from "@/hooks/useFirstLoad";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LandingFooter from "@/components/LandingFooter";
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
      {/* Header */}
      <header className="sticky top-0 safe-area-header z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="flex items-center justify-between px-3 py-2.5 md:px-8 md:py-4 max-w-7xl mx-auto w-full overflow-x-auto">
          <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl gradient-primary flex items-center justify-center shadow-soft flex-shrink-0">
              <Leaf className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base md:text-xl text-foreground truncate notranslate" translate="no">InnerBuild</span>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-9 w-9 md:h-10 md:w-10"
            >
              {isDark ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
            </Button>
            {user ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="gradient-primary text-primary-foreground rounded-lg md:rounded-xl shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-xs md:text-sm px-3 md:px-4 h-9 md:h-10"
              >
                {t("landing.dashboard")}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="hidden sm:inline-flex rounded-lg transition-all duration-300 text-xs md:text-sm px-2 md:px-3 h-9 md:h-10 active:scale-95"
                >
                  {t("auth.sign_in")}
                </Button>
                <Button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="gradient-primary text-primary-foreground rounded-lg md:rounded-xl shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-xs md:text-sm px-3 md:px-4 h-9 md:h-10"
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
        <section className="px-4 py-16 md:py-24">
          <ScrollReveal className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              {t("landing.your_companion")}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              {t("landing.hero_title_1")}{" "}
              <span className="relative inline-block">
                <span className="text-primary">{t("landing.hero_title_2")}</span>
                <span className="absolute -bottom-2 left-0 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full animate-underline-slide"></span>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("landing.hero_description")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
                className="gradient-primary text-primary-foreground rounded-xl h-14 px-8 text-lg shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {t("landing.start_your_journey")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/pricing")}
                className="rounded-xl h-14 px-8 text-lg transition-all duration-300 hover:scale-105 active:scale-95 border-primary/20 hover:border-primary/50"
              >
                {t("landing.view_pricing")}
              </Button>
            </div>
          </ScrollReveal>
        </section>

        {/* Main Features */}
        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t("landing.everything_transform")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("landing.complete_toolkit")}
              </p>
            </ScrollReveal>

            {/* Mobile: carousel */}
            <ScrollReveal className="md:hidden" delay={150}>
              <Carousel opts={{ align: "center", loop: true }}>
                <CarouselContent>
                  {mainFeatureDefs.map((feature) => (
                    <CarouselItem key={feature.titleKey} className="basis-[85%]">
                      <Card className="glass border-border/50 overflow-hidden group h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0`}>
                              <feature.icon className={`h-7 w-7 ${feature.color}`} />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-foreground mb-2">{t(feature.titleKey)}</h3>
                              <p className="text-muted-foreground">{t(feature.descKey)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <span>←</span> {t("common.swipe_explore")} <span>→</span>
              </p>
            </ScrollReveal>

            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainFeatureDefs.map((feature, index) => (
                <ScrollReveal key={feature.titleKey} delay={index * 100} variant="scale">
                  <Card className="glass border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden group h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <feature.icon className={`h-7 w-7 ${feature.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">{t(feature.titleKey)}</h3>
                          <p className="text-muted-foreground">{t(feature.descKey)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t("landing.and_more")}
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {additionalFeatureDefs.map((feature, index) => (
                <ScrollReveal key={feature.titleKey} delay={index * 80} variant="scale">
                  <div className="glass rounded-xl p-5 text-center hover:bg-muted/50 transition-colors h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{t(feature.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground">{t(feature.descKey)}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 py-16 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statDefs.map((stat, index) => (
                <ScrollReveal key={stat.labelKey} delay={index * 120}>
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{t("landing.testimonials")}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t("landing.real_people")}</h2>
            </ScrollReveal>

            {/* Mobile: swipeable carousel — Desktop: grid */}
            <ScrollReveal className="md:hidden" delay={100}>
              <Carousel opts={{ align: "center", loop: true }}>
                <CarouselContent>
                  {testimonialDefs.map((review, index) => (
                    <CarouselItem key={review.quoteKey} className="basis-[85%]">
                      <Card className="glass border-border/50 p-6 flex flex-col gap-4 h-full">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.stars ? "text-yellow-400" : "text-muted"}>★</span>
                          ))}
                        </div>
                        <p className="text-foreground text-sm leading-relaxed flex-1">&ldquo;{t(review.quoteKey)}&rdquo;</p>
                        <p className="text-muted-foreground text-sm font-medium">— {review.author}</p>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <span>←</span> {t("common.swipe_read_more")} <span>→</span>
              </p>
            </ScrollReveal>

            {/* Desktop: grid layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {testimonialDefs.map((review, index) => (
                <ScrollReveal key={review.quoteKey} delay={index * 80} variant="scale">
                  <Card className="glass border-border/50 p-6 flex flex-col gap-4 h-full">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.stars ? "text-yellow-400" : "text-muted"}>★</span>
                      ))}
                    </div>
                    <p className="text-foreground text-sm leading-relaxed flex-1">&ldquo;{t(review.quoteKey)}&rdquo;</p>
                    <p className="text-muted-foreground text-sm font-medium">— {review.author}</p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Features Deep Dive */}
        <section className="px-4 py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal className="text-center mb-4">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
                <Crown className="h-3.5 w-3.5 mr-2 text-accent" />
                {t("common.premium")}
              </Badge>
            </ScrollReveal>
            <ScrollReveal className="text-center mb-14" delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t("landing.tools_change_lives")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base">
                {t("landing.tools_description")}
              </p>
            </ScrollReveal>

            {/* Mobile: swipeable carousel */}
            <ScrollReveal className="md:hidden" delay={200}>
              <Carousel opts={{ align: "center", loop: true }}>
                <CarouselContent>
                  {/* The Forge */}
                  <CarouselItem className="basis-[90%]">
                    <div className="glass rounded-2xl border border-border/60 p-6 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                          <Eye className="h-6 w-6 text-violet-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{t("landing.features.the_forge")}</h3>
                          <Badge className="text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/20 border">{t("landing.most_impactful")}</Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {t("landing.premium_deep_dive.the_forge_mobile_desc")}
                      </p>
                      <div className="space-y-1.5">
                        {(t("landing.premium_deep_dive.the_forge_mobile_features", { returnObjects: true }) as string[]).map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Trigger Tracking */}
                  <CarouselItem className="basis-[90%]">
                    <div className="glass rounded-2xl border border-border/60 p-6 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="h-6 w-6 text-rose-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t("landing.features.trigger_tracking")}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {t("landing.premium_deep_dive.trigger_tracking_mobile_desc")}
                      </p>
                      <div className="space-y-1.5">
                        {(t("landing.premium_deep_dive.trigger_tracking_mobile_features", { returnObjects: true }) as string[]).map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* AI Coach */}
                  <CarouselItem className="basis-[90%]">
                    <div className="glass rounded-2xl border border-border/60 p-6 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t("landing.features.ai_coach")}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {t("landing.premium_deep_dive.ai_coach_mobile_desc")}
                      </p>
                      <div className="space-y-1.5">
                        {(t("landing.premium_deep_dive.ai_coach_mobile_features", { returnObjects: true }) as string[]).map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Learn Section */}
                  <CarouselItem className="basis-[90%]">
                    <div className="glass rounded-2xl border border-border/60 p-6 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-6 w-6 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t("landing.features.learn_section")}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {t("landing.premium_deep_dive.learn_mobile_desc")}
                      </p>
                      <div className="space-y-1.5">
                        {(t("landing.premium_deep_dive.learn_mobile_features", { returnObjects: true }) as string[]).map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Adaptive Habit Suggestions */}
                  <CarouselItem className="basis-[90%]">
                    <div className="glass rounded-2xl border border-border/60 p-6 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Brain className="h-6 w-6 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t("landing.features.ai_habit_adaptation")}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {t("landing.premium_deep_dive.habit_adaptation_mobile_desc")}
                      </p>
                      <div className="space-y-1.5">
                        {(t("landing.premium_deep_dive.habit_adaptation_mobile_features", { returnObjects: true }) as string[]).map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <span>←</span> {t("common.swipe_explore")} <span>→</span>
              </p>
            </ScrollReveal>

            {/* Desktop: stacked layout */}
            <div className="hidden md:block space-y-6">
              {/* The Forge Program */}
              <ScrollReveal variant="left">
                <div className="glass rounded-2xl border border-border/60 p-6 md:p-8 hover:border-violet-500/30 transition-all duration-300 group">
                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Eye className="h-7 w-7 text-violet-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{t("landing.features.the_forge")}</h3>
                        <Badge className="text-xs bg-violet-500/10 text-violet-600 border-violet-500/20 border">{t("landing.most_impactful")}</Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {t("landing.premium_deep_dive.the_forge_desc")}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(t("landing.premium_deep_dive.the_forge_features", { returnObjects: true }) as string[]).map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-violet-500 flex-shrink-0" />{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Trigger Tracking */}
              <ScrollReveal variant="left" delay={100}>
                <div className="glass rounded-2xl border border-border/60 p-6 md:p-8 hover:border-rose-500/30 transition-all duration-300 group">
                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <BarChart3 className="h-7 w-7 text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">{t("landing.features.trigger_tracking")}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {t("landing.premium_deep_dive.trigger_tracking_desc")}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(t("landing.premium_deep_dive.trigger_tracking_features", { returnObjects: true }) as string[]).map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-rose-500 flex-shrink-0" />{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* AI Coach */}
              <ScrollReveal variant="left" delay={200}>
                <div className="glass rounded-2xl border border-border/60 p-6 md:p-8 hover:border-primary/30 transition-all duration-300 group">
                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Bot className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">{t("landing.features.ai_coach")}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {t("landing.premium_deep_dive.ai_coach_desc")}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(t("landing.premium_deep_dive.ai_coach_features", { returnObjects: true }) as string[]).map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Learn Section + Habit Analysis — side by side */}
              <div className="grid md:grid-cols-2 gap-6">
                <ScrollReveal variant="scale" delay={100}>
                  <div className="glass rounded-2xl border border-border/60 p-6 hover:border-indigo-500/30 transition-all duration-300 group h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <BookOpen className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{t("landing.features.learn_section")}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          {t("landing.premium_deep_dive.learn_desc")}
                        </p>
                        <div className="space-y-1.5">
                          {(t("landing.premium_deep_dive.learn_features", { returnObjects: true }) as string[]).map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />{item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal variant="scale" delay={200}>
                  <div className="glass rounded-2xl border border-border/60 p-6 hover:border-emerald-500/30 transition-all duration-300 group h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Brain className="h-6 w-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{t("landing.features.ai_habit_adaptation")}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          {t("landing.premium_deep_dive.habit_adaptation_desc")}
                        </p>
                        <div className="space-y-1.5">
                          {(t("landing.premium_deep_dive.habit_adaptation_features", { returnObjects: true }) as string[]).map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />{item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>

            {/* Pricing CTA inside premium section */}
            <ScrollReveal className="text-center mt-14" delay={300}>
              <p className="text-sm text-muted-foreground mb-2">{t("landing.all_premium_for")}</p>
              <p className="text-4xl font-bold text-foreground mb-1">
                €9.99
                <span className="text-lg text-muted-foreground font-normal">/{t("common.month")}</span>
              </p>
              <Button
                size="lg"
                onClick={() => navigate(user ? "/pricing" : "/auth?mode=signup")}
                className="mt-4 gradient-accent text-accent-foreground rounded-xl h-14 px-10 text-lg shadow-soft hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <Crown className="h-5 w-5 mr-2" />
                {t("landing.unlock_premium")}
              </Button>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-20">
          <ScrollReveal className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("landing.ready_to_start")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("landing.join_thousands")}
            </p>
            <Button
              size="lg"
              onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
              className="gradient-primary text-primary-foreground rounded-xl h-14 px-10 text-lg shadow-soft hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {t("landing.get_started_free")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </ScrollReveal>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
