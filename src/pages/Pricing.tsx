import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import LandingFooter from "@/components/LandingFooter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { 
  Leaf, 
  Check, 
  ArrowLeft, 
  Loader2, 
  LogOut, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Gift, 
  Zap, 
  Brain, 
  Clock, 
  Target, 
  Flame, 
  TrendingUp,
  Sun,
  Moon,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

export default function Pricing() {
  const { user, signOut } = useAuth();
  const { createCheckout } = useSubscription();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [isAnnual, setIsAnnual] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const freeFeatures = [
    t("pricing.free_features_list.0", "Fino a 5 abitudini quotidiane"),
    t("pricing.free_features_list.1", "1 sfida detox attiva"),
    t("pricing.free_features_list.2", "Tracciamento base con serie"),
    t("pricing.free_features_list.3", "Pianificazione giornaliera (To-Do & Not To-Do)"),
    t("pricing.free_features_list.4", "Riflessione serale e gratitudine"),
    t("pricing.free_features_list.5", "Calendario attività base"),
  ];

  const proFeatures = [
    {
      icon: <Zap className="h-4 w-4 text-primary flex-shrink-0" />,
      title: t("pricing.pro_features_list.0.title", "Pulsante SOS Anti-Ricaduta (Coach AI 24/7)"),
      desc: t("pricing.pro_features_list.0.desc", "Disinnesca gli impulsi in 90 secondi a tarda notte."),
    },
    {
      icon: <Brain className="h-4 w-4 text-primary flex-shrink-0" />,
      title: t("pricing.pro_features_list.1.title", "Radar Predittivo dei Trigger"),
      desc: t("pricing.pro_features_list.1.desc", "L'AI incrocia umore, energia e orari per avvisarti PRIMA del momento di debolezza."),
    },
    {
      icon: <Flame className="h-4 w-4 text-primary flex-shrink-0" />,
      title: t("pricing.pro_features_list.2.title", "Protocollo Neuro-Reset \"La Rinascita\""),
      desc: t("pricing.pro_features_list.2.desc", "Porn Recovery con serie e milestone (Giorni 3, 7, 14, 30, 90)."),
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />,
      title: t("pricing.pro_features_list.3.title", "Routine Auto-Adattiva AI"),
      desc: t("pricing.pro_features_list.3.desc", "Ricalibra le abitudini nei giorni pesanti per non farti perdere lo slancio."),
    },
    {
      icon: <Target className="h-4 w-4 text-primary flex-shrink-0" />,
      title: t("pricing.pro_features_list.4.title", "Abitudini e Sfide Detox Illimitate"),
      desc: t("pricing.pro_features_list.4.desc", "Nessun limite alla tua trasformazione personale."),
    },
    {
      icon: <Clock className="h-4 w-4 text-primary flex-shrink-0" />,
      title: t("pricing.pro_features_list.5.title", "Analisi Settimanale \"Cosa sta funzionando\""),
      desc: t("pricing.pro_features_list.5.desc", "Report sui tuoi pattern ogni 7 giorni."),
    },
  ];

  const bonuses = [
    {
      title: t("pricing.bonus_box.bonus_1_title", "Protocollo d'Emergenza \"Primi 7 Giorni Senza Ricadute\""),
      value: t("pricing.bonus_box.bonus_1_value", "€97"),
    },
    {
      title: t("pricing.bonus_box.bonus_2_title", "Kit \"Schermo Blindato\" Setup Anti-Trigger"),
      value: t("pricing.bonus_box.bonus_2_value", "€97"),
    },
    {
      title: t("pricing.bonus_box.bonus_3_title", "Template Routine Pre-Sonno \"Dopamina Pulita\""),
      value: t("pricing.bonus_box.bonus_3_value", "€53"),
    },
  ];

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
        description: t("pricing.checkout_failed", "Avvio checkout fallito. Riprova."),
        variant: "destructive",
      });
      setCheckoutLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Split the hero title so the second half gets the primary gradient text treatment just like Landing
  const fullHeroTitle = t("pricing.hero_title", "Riprendi il Controllo della Tua Mente");
  const titleWords = fullHeroTitle.split(" ");
  const splitIdx = Math.ceil(titleWords.length / 2);
  const heroTitlePart1 = titleWords.slice(0, splitIdx).join(" ");
  const heroTitlePart2 = titleWords.slice(splitIdx).join(" ");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — floating pill nav matching Landing */}
      <header className="sticky top-0 safe-area-header z-50 px-3 pt-3 md:pt-4">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-2 pl-2.5 sm:pl-4 shadow-lg backdrop-blur-xl md:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (user ? navigate("/dashboard") : navigate("/"))}
              className="h-8 w-8 rounded-full text-foreground hover:bg-muted/60 md:h-9 md:w-9"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4 md:h-[18px] md:w-[18px]" />
            </Button>
            <div
              className="flex min-w-0 items-center gap-2 cursor-pointer"
              onClick={() => navigate(user ? "/dashboard" : "/")}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full gradient-primary shadow-soft md:h-9 md:w-9">
                <Leaf className="h-4 w-4 text-primary-foreground md:h-[18px] md:w-[18px]" />
              </div>
              <span className="notranslate hidden sm:inline truncate text-base font-bold tracking-tight text-foreground md:text-lg" translate="no">
                InnerBuild
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>
            {user ? (
              <>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="h-9 rounded-full gradient-primary px-4 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:shadow-lg active:scale-95 md:text-sm"
                >
                  {t("landing.dashboard", "Dashboard")}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive"
                  title={t("auth.sign_out", "Esci")}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="hidden h-9 rounded-full px-3 text-xs font-medium text-foreground sm:inline-flex md:text-sm"
                >
                  {t("auth.sign_in", "Accedi")}
                </Button>
                <Button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="h-9 rounded-full gradient-primary px-4 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:shadow-lg active:scale-95 md:text-sm"
                >
                  {t("landing.get_started", "Inizia Ora")}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero + Pricing Section with Landing background effects */}
        <section className="relative overflow-hidden px-4 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="pointer-events-none absolute inset-0 grid-pattern" />
          <div className="glow-blob left-1/4 top-0 h-72 w-72 gradient-primary" />
          <div className="glow-blob right-1/4 top-20 h-72 w-72 gradient-accent animate-float-slow" />

          <div className="relative mx-auto max-w-5xl">
            {/* Hero Copy matching Landing.tsx */}
            <ScrollReveal className="text-center mb-10 md:mb-14">
              <Badge
                variant="secondary"
                className="mb-6 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-medium backdrop-blur"
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
                {t("pricing.header_badge", "👑 SISTEMA DI RESET DOPAMINICO & CRESCITA AI")}
              </Badge>

              <h1 className="mx-auto mb-6 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                {heroTitlePart1}{" "}
                <span className="text-gradient-primary">{heroTitlePart2}</span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                {t("pricing.hero_subtitle", "Sblocca il motore predittivo AI per spezzare le dipendenze digitali, azzerare le ricadute e costruire una disciplina d'acciaio senza usare la sola forza di volontà.")}
              </p>

              {/* Monthly / Annual Toggle */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                  {t("pricing.monthly_billing", "Mensile")}
                </span>
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  className="data-[state=checked]:bg-primary"
                />
                <span className={`text-sm font-semibold flex items-center gap-2 transition-colors ${isAnnual ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                  {t("pricing.annual_billing", "Annuale")}
                  <Badge variant="secondary" className="rounded-full border border-primary/30 bg-primary/15 text-primary text-[11px] font-bold px-2.5 py-0.5">
                    {t("pricing.save_badge", "Risparmi 20%")}
                  </Badge>
                </span>
              </div>
            </ScrollReveal>

            {/* Pricing Cards Grid — using Landing premium-card style */}
            <div className="grid md:grid-cols-2 gap-8 items-stretch mb-8">
              {/* Free Plan Card */}
              <ScrollReveal className="flex">
                <div className="premium-card w-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 bg-card/60 backdrop-blur-xl border border-border/50">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-muted/80 border border-border/60 text-foreground text-xs font-semibold mb-4">
                      {t("pricing.free_plan", "Piano Base")}
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                        {t("pricing.free_price", "€0")}
                      </span>
                      <span className="text-muted-foreground text-sm font-medium">
                        /{t("pricing.forever", "per sempre")}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                      {t("pricing.free_subtitle", "Per iniziare a tracciare le basi in autonomia.")}
                    </p>

                    <div className="space-y-3 mb-8">
                      {freeFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm text-foreground/90">
                          <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
                    className="w-full h-12 rounded-full font-semibold border-border/80 bg-card/80 hover:bg-muted text-foreground transition-all duration-300"
                  >
                    {user ? t("pricing.current_plan", "Piano Attuale") : t("pricing.get_started_free", "Inizia Gratis")}
                  </Button>
                </div>
              </ScrollReveal>

              {/* InnerBuild PRO Plan Card */}
              <ScrollReveal delay={100} className="flex">
                <div className="premium-card premium-ring w-full rounded-3xl border-2 border-primary/60 bg-card/80 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
                  {/* Popular Badge */}
                  <div className="absolute top-0 right-0">
                    <div className="gradient-primary text-primary-foreground text-xs font-bold tracking-wide px-4 py-1.5 rounded-bl-2xl shadow-soft flex items-center gap-1.5 uppercase">
                      <Sparkles className="h-3.5 w-3.5" />
                      {t("pricing.most_popular", "Più Popolare")}
                    </div>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold mb-4">
                      <Crown className="h-3.5 w-3.5" />
                      {t("pricing.premium_plan", "InnerBuild PRO")}
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient-primary">
                        {isAnnual ? t("pricing.annual_price", "€7.99") : t("pricing.monthly_price", "€9.99")}
                      </span>
                      <span className="text-muted-foreground text-sm font-medium">
                        {t("pricing.per_month", "/mese")}
                      </span>
                    </div>

                    {isAnnual && (
                      <p className="text-xs text-primary font-semibold mb-2">
                        {t("pricing.annual_billing_detail", "Fatturati €95.88/anno (Risparmi il 20%)")}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-muted-foreground mb-6 font-medium">
                      {t("pricing.pro_subtitle", "Il sistema completo 'Fatto con Te' dall'AI per eliminare i trigger alla radice.")}
                    </p>

                    {/* Core PRO Features */}
                    <div className="space-y-3.5 mb-6">
                      {proFeatures.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="text-xs sm:text-sm leading-snug">
                            <span className="font-bold text-foreground">{item.title}: </span>
                            <span className="text-muted-foreground">{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Box Bonus Dentro la Card PRO */}
                    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/30 rounded-2xl p-4 sm:p-5 my-6 relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <Gift className="h-4 w-4 text-primary" />
                        <h3 className="text-xs sm:text-sm font-extrabold text-foreground tracking-wide">
                          {t("pricing.bonus_box.title", "🎁 INCLUSI GRATIS OGGI (Valore Totale: €247)")}
                        </h3>
                      </div>

                      <div className="space-y-2.5">
                        {bonuses.map((bonus, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 text-xs sm:text-sm py-1 border-b border-border/50 last:border-b-0">
                            <div className="flex items-center gap-2 text-foreground/90">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <span className="font-medium">{bonus.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="line-through text-muted-foreground text-xs">{bonus.value}</span>
                              <span className="bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full text-[11px] border border-primary/30 tracking-wider">
                                {t("pricing.bonus_box.free_badge", "GRATIS")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div>
                    <div className="text-center text-xs sm:text-sm font-semibold text-primary mb-3 flex items-center justify-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      <span>{t("pricing.value_summary", "Valore totale oltre €340+ — Oggi a meno di €0,27 al giorno.")}</span>
                    </div>

                    <Button
                      onClick={handleSubscribe}
                      disabled={checkoutLoading}
                      className="w-full h-14 rounded-full gradient-primary text-primary-foreground font-bold text-base sm:text-lg shadow-soft transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 gap-2"
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>{t("common.loading", "Caricamento...")}</span>
                        </>
                      ) : (
                        <span>{t("pricing.cta_button", "👑 Sblocca InnerBuild PRO + 3 Bonus")}</span>
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* TWO SIDE-BY-SIDE INFORMATIONAL BOXES BELOW PLANS — matching Landing card style */}
            <div className="grid md:grid-cols-2 gap-6 mt-8 mb-8">
              {/* BOX 1: GARANZIA (Inversione del Rischio) */}
              <ScrollReveal className="flex">
                <div className="premium-card w-full rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 bg-card/60 backdrop-blur-xl border border-border/50">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 text-primary shadow-soft">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-foreground leading-snug">
                        {t("pricing.guarantee_box.title", "Garanzia \"Svolta in 14 Giorni o Rimborsato al 100%\"")}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {t("pricing.guarantee_box.desc", "Prova InnerBuild PRO per 14 giorni. Se il Coach AI 24/7 e l'analisi predittiva dei trigger non ti aiutano a spezzare le cattive abitudini più velocemente di qualsiasi altra app provata finora, ti rimborsiamo ogni centesimo con un clic. Zero domande.")}
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* BOX 2: PRIVACY PWA ("Zero-Trace Architecture") */}
              <ScrollReveal delay={100} className="flex">
                <div className="premium-card w-full rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 bg-card/60 backdrop-blur-xl border border-border/50">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 text-accent shadow-soft">
                        <EyeOff className="h-6 w-6" />
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-foreground leading-snug">
                        {t("pricing.privacy_box.title", "100% Invisibile su App Store & Google Play (Tecnologia Zero-Trace PWA)")}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {t("pricing.privacy_box.desc", "Il tuo percorso di recupero è strettamente privato. InnerBuild usa un'architettura Web-App criptata: si installa in 1 clic sul telefono ma NON lascia alcuna traccia nella cronologia acquisti di Apple o Google, sull'estratto conto dello store o nei suggerimenti condivisi in famiglia.")}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {!user && (
              <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4">
                {t("pricing.have_account", "Hai già un account?")}{" "}
                <button 
                  onClick={() => navigate("/auth")} 
                  className="text-primary font-semibold hover:underline"
                >
                  {t("auth.sign_in", "Accedi")}
                </button>
              </p>
            )}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
