import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LandingFooter from "@/components/LandingFooter";
import LandingAppPreview from "@/components/LandingAppPreview";
import FeatureShowcase from "@/components/FeatureShowcase";
import { ScrollReveal } from "@/components/ScrollReveal";
import { 
  Leaf, 
  Sparkles, 
  ArrowRight,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (window.location.hash === "#pricing") {
      navigate("/pricing", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasAuthToken = params.has("code") || hashParams.has("access_token") || hashParams.get("type") === "signup" || hashParams.get("type") === "email_confirmation";

    if (hasAuthToken) {
      navigate(`/auth/callback${window.location.search}${window.location.hash}`, { replace: true });
      return;
    }

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
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-2 pl-3 sm:pl-4 shadow-lg backdrop-blur-xl md:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full gradient-primary shadow-soft md:h-9 md:w-9">
              <Leaf className="h-4 w-4 text-primary-foreground md:h-[18px] md:w-[18px]" />
            </div>
            <span className="notranslate hidden sm:inline truncate text-base font-bold tracking-tight text-foreground md:text-lg" translate="no">
              InnerBuild
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => navigate("/pricing")}
              className="hidden h-9 rounded-full px-3 text-xs font-medium text-foreground sm:inline-flex md:text-sm"
            >
              {t("nav.pricing", "Prezzi")}
            </Button>
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
                  className="hidden h-9 rounded-full px-3 text-xs font-medium text-foreground sm:inline-flex md:text-sm"
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
                  onClick={() => navigate("/pricing")}
                  className="h-14 rounded-full border border-[#C377D7]/40 bg-[#f4e6f8]/80 dark:bg-[#C377D7]/20 px-8 text-base font-bold text-[#8A3DB8] dark:text-[#D28CE4] backdrop-blur shadow-sm transition-all duration-300 hover:bg-[#C377D7] hover:text-white dark:hover:bg-[#C377D7] dark:hover:text-white hover:border-[#C377D7] hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-95"
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
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("landing.loved_by_people", "Amato da migliaia di persone")}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: App Preview mockup */}
            <ScrollReveal variant="left" delay={150}>
              <LandingAppPreview />
            </ScrollReveal>
          </div>
        </section>

        {/* Interactive Feature Showcase Section */}
        <section className="px-4 py-12 md:py-20 overflow-hidden">
          <ScrollReveal className="mb-8 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("landing.features_eyebrow", "Funzionalità")}</p>
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
              {t("landing.everything_you_need", "Tutto ciò che serve per trasformarti")}
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto">
              {t("landing.features_sub", "Esplora gli strumenti interattivi di InnerBuild e guarda come funzionano in anteprima.")}
            </p>
          </ScrollReveal>

          <FeatureShowcase />
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
