import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import LandingFooter from "@/components/LandingFooter";
import LandingAppPreview from "@/components/LandingAppPreview";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useToast } from "@/hooks/use-toast";
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
  Check,
  Lock,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { createCheckout } = useSubscription();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [isAnnual, setIsAnnual] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/auth?mode=signup");
      return;
    }
    setCheckoutLoading(true);
    try {
      await createCheckout({ isAnnual });
    } catch (error) {
      toast({
        title: t("common.error", "Errore"),
        description: t("pricing.checkout_failed", "Impossibile avviare il pagamento. Riprova più tardi."),
        variant: "destructive",
      });
      setCheckoutLoading(false);
    }
  };

  const mainFeatureDefs = [
    { icon: Target, titleKey: "landing.features.smart_habit_tracking", descKey: "landing.features.smart_habit_desc", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { icon: Flame, titleKey: "landing.features.detox_challenges", descKey: "landing.features.detox_challenges_desc", color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { icon: Eye, titleKey: "landing.features.the_forge", descKey: "landing.features.the_forge_desc", color: "text-violet-500", bgColor: "bg-violet-500/10" },
    { icon: Bot, titleKey: "landing.features.ai_coach", descKey: "landing.features.ai_coach_desc", color: "text-primary", bgColor: "bg-primary/10" },
    { icon: ShieldAlert, titleKey: "landing.features.trigger_tracking", descKey: "landing.features.trigger_tracking_desc", color: "text-rose-500", bgColor: "bg-rose-500/10" },
    { icon: CalendarCheck, titleKey: "landing.features.daily_planning", descKey: "landing.features.daily_planning_desc", color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  ];

  const additionalFeatureDefs = [
    { icon: Brain, titleKey: "landing.features.ai_habit_adaptation" },
    { icon: BookOpen, titleKey: "landing.features.learn_section" },
    { icon: Shield, titleKey: "landing.features.streak_tracking" },
    { icon: Zap, titleKey: "landing.features.micro_actions" },
    { icon: Ban, titleKey: "landing.features.not_to_do_list" },
    { icon: Clock, titleKey: "landing.features.recovery_timeline" },
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

  const freeFeatures = [
    t("pricing.free_features.habits", "Tracciamento Abitudini (base)"),
    t("pricing.free_features.challenges", "Sfide Detox (base)"),
    t("pricing.free_features.tracking", "Tracciamento Streak Base"),
    t("pricing.free_features.quotes", "Citazioni Motivazionali Giornaliere"),
    t("pricing.free_features.planning", "Pianificazione Task Giornaliera"),
    t("pricing.free_features.reflection", "Riflessione Serale Base"),
    t("pricing.free_features.profile", "Profilo Utente & Statistiche Base"),
  ];

  const premiumFeatures = [
    t("pricing.premium_features.unlimited_habits", "Abitudini Illimitate & Adattamento AI"),
    t("pricing.premium_features.unlimited_challenges", "Sfide Detox Illimitate"),
    t("pricing.premium_features.ai_coach", "AI Coach Personale H24"),
    t("pricing.premium_features.recovery", "The Forge: Programma di Recovery Scientifico"),
    t("pricing.premium_features.trigger_tracking", "Analisi & Heatmap Trigger con AI"),
    t("pricing.premium_features.habit_adaptation", "Raccomandazioni Personalizzate AI"),
    t("pricing.premium_features.learn", "Accesso Completo alla Sezione Impara"),
    t("pricing.premium_features.priority", "Supporto Prioritario"),
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
                  onClick={() => {
                    const el = document.getElementById("pricing");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
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
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-background ${p.color}`}
                    >
                      {p.initial}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-xs text-accent">
                    ★★★★★
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{t("landing.loved_by_people")}</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: App Preview mockup */}
            <ScrollReveal variant="left" delay={150}>
              <LandingAppPreview />
            </ScrollReveal>
          </div>
        </section>

        {/* Main Features — bento */}
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <ScrollReveal className="mb-14 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("landing.features_eyebrow", "Funzionalità")}</p>
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                {t("landing.everything_you_need", "Tutto ciò che serve per trasformarti")}
              </h2>
            </ScrollReveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mainFeatureDefs.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <ScrollReveal key={feat.titleKey} delay={idx * 60} variant="scale">
                    <div className="premium-card group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1">
                      <div>
                        <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${feat.bgColor}`}>
                          <Icon className={`h-6 w-6 ${feat.color}`} />
                        </div>
                        <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">{t(feat.titleKey)}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{t(feat.descKey)}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            {/* Additional features — elegant chips */}
            <ScrollReveal className="mt-12" delay={300}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {additionalFeatureDefs.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.titleKey}
                      className="premium-card flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">{t(feat.titleKey)}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-border/40 bg-card/30 py-12 backdrop-blur-md">
          <ScrollReveal className="mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              {statDefs.map((stat) => (
                <div key={stat.labelKey}>
                  <p className="mb-1 text-4xl font-extrabold tracking-tight text-gradient-primary md:text-5xl">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Testimonials Infinite Marquee */}
        <section className="relative overflow-hidden px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal className="mb-12 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">{t("landing.testimonials")}</p>
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">{t("landing.real_people")}</h2>
            </ScrollReveal>

            {/* Single Row Infinite Marquee Container with Alpha Mask */}
            <div className="relative overflow-hidden mask-marquee py-4">
              <div className="animate-marquee gap-4">
                {[...testimonialDefs, ...testimonialDefs].map((review, idx) => {
                  const avatar = socialProof.find((s) => review.author.startsWith(s.name));
                  return (
                    <div
                      key={idx}
                      className="premium-card flex w-80 shrink-0 flex-col gap-4 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 bg-card/60 backdrop-blur-xl border border-border/50"
                    >
                      <div className="flex gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.stars ? "" : "text-muted-foreground/30"}>★</span>
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
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Pricing Section with Monthly/Annual Toggle & Emerald Glow */}
        <section id="pricing" className="relative overflow-hidden px-4 py-20 md:py-28">
          <div className="relative max-w-5xl mx-auto">
            <ScrollReveal className="text-center mb-4">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Crown className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                {t("pricing.choose_plan", "Scegli il tuo piano")}
              </Badge>
            </ScrollReveal>
            <ScrollReveal className="text-center mb-10" delay={100}>
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
                {t("pricing.choose_plan_title", "Investi nel tuo potenziale")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base">
                {t("pricing.subtitle", "Sblocca tutti gli strumenti avanzati per la tua crescita e riconquista il controllo.")}
              </p>

              {/* Monthly / Annual Toggle */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                  {t("pricing.monthly_billing", "Mensile")}
                </span>
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  className="data-[state=checked]:bg-emerald-500"
                />
                <span className={`text-sm font-semibold flex items-center gap-2 transition-colors ${isAnnual ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                  {t("pricing.annual_billing", "Annuale")}
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold px-2 py-0.5 animate-pulse">
                    {t("pricing.save_badge", "Risparmi il 20% (2 mesi gratis)")}
                  </Badge>
                </span>
              </div>
            </ScrollReveal>

            {/* Pricing Cards Grid */}
            <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto mb-12">
              {/* Free Plan Card */}
              <ScrollReveal variant="scale" delay={150}>
                <div className="h-full rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold mb-4">
                      {t("pricing.free_plan", "Piano Base")}
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl md:text-5xl font-extrabold text-foreground">€0</span>
                      <span className="text-muted-foreground text-sm">/{t("pricing.forever", "per sempre")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6">{t("pricing.get_started_basics", "Perfetto per iniziare il tuo percorso.")}</p>

                    <div className="space-y-3 mb-8">
                      {freeFeatures.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 text-sm text-foreground/90">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
                    className="w-full h-12 rounded-2xl font-semibold border-border/80 hover:bg-card"
                  >
                    {user ? t("pricing.current_plan", "Il tuo piano attuale") : t("pricing.get_started_free", "Inizia Gratis")}
                  </Button>
                </div>
              </ScrollReveal>

              {/* Premium Plan Card with Emerald Glow */}
              <ScrollReveal variant="scale" delay={250}>
                <div className="h-full rounded-3xl border-2 border-emerald-500/60 bg-card dark:bg-gradient-to-b dark:from-emerald-950/30 dark:via-slate-900/80 dark:to-card/90 backdrop-blur-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-lg dark:shadow-[0_0_40px_-5px_rgba(16,185,129,0.35)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-[0_0_50px_0px_rgba(16,185,129,0.45)]">
                  {/* Più Popolare Badge */}
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black tracking-wide px-4 py-1.5 rounded-bl-2xl shadow-md flex items-center gap-1.5 uppercase">
                      <Sparkles className="h-3.5 w-3.5 fill-slate-950 text-slate-950" />
                      {t("pricing.most_popular", "Più Popolare")}
                    </div>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-4">
                      <Crown className="h-3.5 w-3.5" />
                      {t("pricing.premium_plan", "InnerBuild PRO")}
                    </div>
                    
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl md:text-5xl font-extrabold text-foreground">
                        {isAnnual ? "€7.99" : "€9.99"}
                      </span>
                      <span className="text-muted-foreground text-sm">/{t("common.month", "mese")}</span>
                    </div>
                    {isAnnual && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
                        {t("pricing.annual_billing_detail", "Fatturati €95.88/anno (Risparmi il 20%)")}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-6">{t("pricing.unlock_potential", "Sblocca tutto il potenziale senza limiti.")}</p>

                    <div className="space-y-3 mb-8">
                      {premiumFeatures.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 text-sm font-medium text-foreground">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Button
                      onClick={handleSubscribe}
                      disabled={checkoutLoading}
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base shadow-lg shadow-emerald-500/25 transition-all duration-300 active:scale-95 gap-2"
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>{t("common.loading", "Caricamento...")}</span>
                        </>
                      ) : (
                        <>
                          <Crown className="h-5 w-5" />
                          <span>{isAnnual ? t("pricing.get_annual_premium", "Passa a PRO Annuale") : t("pricing.get_monthly_premium", "Passa a PRO Mensile")}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Reassurance Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t("pricing.guarantee_30_days", "Garanzia di 30 Giorni")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t("pricing.cancel_anytime", "Annulla quando vuoi")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t("pricing.secure_stripe", "Pagamento Sicuro via Stripe")}</span>
              </div>
            </div>
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
