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
    if (!loading && user && isFirstLoad) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, isFirstLoad, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow animate-pulse">
          <Leaf className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>
    );
  }

  if (user && isFirstLoad) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  const mainFeatures = [
    {
      icon: Target,
      title: "Tracciamento Abitudini Smart",
      description: "Traccia le abitudini quotidiane con progressi visivi, serie e suggerimenti AI intelligenti che si adattano ai tuoi schemi reali.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Flame,
      title: "Sfide Detox",
      description: "Liberati dalla dipendenza digitale, dalle cattive abitudini e dai pattern negativi con sfide basate sulla scienza (da 3 a 90 giorni).",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Eye,
      title: "Programma Porn Recovery",
      description: "Un programma dedicato e basato sulla scienza con tracciamento serie, check-in giornalieri, analisi trigger e supporto specializzato.",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: Bot,
      title: "Coach AI Personale",
      description: "Compagno AI disponibile 24/7 che ti motiva, suggerisce abitudini personalizzate, aiuta con le voglie e guida la tua trasformazione.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: ShieldAlert,
      title: "Tracciamento & Analisi Trigger",
      description: "Registra e analizza cosa scatena i tuoi impulsi. Identifica pattern e ottieni insight AI per costruire difese più forti.",
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      icon: CalendarCheck,
      title: "Pianificazione & Riflessione Quotidiana",
      description: "Pianifica la tua giornata con liste di cose da fare e da non fare. Concludi ogni giorno con gratitudine, check-in dell'umore e auto-riflessione.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  const additionalFeatures = [
    { icon: Brain, title: "Adattamento Abitudini AI", description: "Suggerisce versioni più facili quando fai fatica" },
    { icon: BookOpen, title: "Sezione Impara", description: "Educazione su dopamina e ricablaggio cerebrale" },
    { icon: Shield, title: "Tracciamento Serie", description: "Progressi visivi e traguardi" },
    { icon: Zap, title: "Micro-Azioni", description: "Piccole vittorie quotidiane in pochi secondi" },
    { icon: Ban, title: "Lista Non-Fare", description: "Traccia i comportamenti da evitare" },
    { icon: Clock, title: "Timeline Recovery", description: "Vedi i progressi di guarigione del cervello" },
  ];

  const stats = [
    { value: "90+", label: "Giorni di contenuti recovery" },
    { value: "50+", label: "Abitudini suggerite" },
    { value: "12+", label: "Template sfide" },
    { value: "24/7", label: "Coach AI disponibile" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
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
                {"Dashboard"}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="hidden sm:inline-flex hover:bg-muted transition-all duration-300 text-xs md:text-sm px-2 md:px-3 h-9 md:h-10"
                >
                  {"Accedi"}
                </Button>
                <Button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="gradient-primary text-primary-foreground rounded-lg md:rounded-xl shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-xs md:text-sm px-3 md:px-4 h-9 md:h-10"
                >
                  {"Inizia Ora"}
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
              {"Il tuo compagno completo per la crescita personale"}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              {"Costruisci la vita che meriti,"}{" "}
              <span className="relative inline-block">
                <span className="text-primary">{"un'abitudine alla volta"}</span>
                <span className="absolute -bottom-2 left-0 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full animate-underline-slide"></span>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {"InnerBuild combina tracciamento abitudini, sfide detox, strumenti di recovery e un coach AI per aiutarti a liberarti da ciò che ti trattiene e diventare la versione migliore di te."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
                className="gradient-primary text-primary-foreground rounded-xl h-14 px-8 text-lg shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {"Inizia il Tuo Percorso"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/pricing")}
                className="rounded-xl h-14 px-8 text-lg hover:bg-muted transition-all duration-300 hover:scale-105 active:scale-95 border-primary/20 hover:border-primary/50"
              >
                {"Vedi Prezzi"}
              </Button>
            </div>
          </ScrollReveal>
        </section>

        {/* Main Features */}
        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {"Tutto ciò che serve per trasformarti"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {"Un toolkit completo progettato per supportare il tuo percorso dal primo giorno"}
              </p>
            </ScrollReveal>

            {/* Mobile: carousel */}
            <ScrollReveal className="md:hidden" delay={150}>
              <Carousel opts={{ align: "center", loop: true }}>
                <CarouselContent>
                  {mainFeatures.map((feature) => (
                    <CarouselItem key={feature.title} className="basis-[85%]">
                      <Card className="glass border-border/50 overflow-hidden group h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0`}>
                              <feature.icon className={`h-7 w-7 ${feature.color}`} />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                              <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <span>←</span> {"scorri per esplorare"} <span>→</span>
              </p>
            </ScrollReveal>

            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainFeatures.map((feature, index) => (
                <ScrollReveal key={feature.title} delay={index * 100} variant="scale">
                  <Card className="glass border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden group h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <feature.icon className={`h-7 w-7 ${feature.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground">{feature.description}</p>
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
                {"E molto altro ancora"}
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {additionalFeatures.map((feature, index) => (
                <ScrollReveal key={feature.title} delay={index * 80} variant="scale">
                  <div className="glass rounded-xl p-5 text-center hover:bg-muted/50 transition-colors h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
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
              {stats.map((stat, index) => (
                <ScrollReveal key={stat.label} delay={index * 120}>
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
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
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{"Testimonianze"}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{"Persone reali, progressi reali"}</h2>
            </ScrollReveal>

            {/* Mobile: swipeable carousel — Desktop: grid */}
            <ScrollReveal className="md:hidden" delay={100}>
              <Carousel opts={{ align: "center", loop: true }}>
                <CarouselContent>
                  {[
                    { stars: 5, quote: "Il coach AI è come avere un terapeuta in tasca. Mi ha davvero aiutato a capire perché continuavo a ricadere.", author: "Marco B." },
                    { stars: 5, quote: "Finalmente un'app che tratta il recovery seriamente con la scienza, non solo con la forza di volontà. La sezione sulla scienza del cervello ha cambiato la mia prospettiva.", author: "Sara L." },
                    { stars: 5, quote: "Il tracciamento dei trigger mi ha aiutato a notare pattern che non avevo mai visto prima. Ora posso davvero anticipare i giorni difficili.", author: "Luca M." },
                    { stars: 4, quote: "Ho provato molte app per le abitudini. Questa funziona perché la pianificazione giornaliera è naturale, non un peso.", author: "Alex R." },
                    { stars: 5, quote: "58 giorni pulito. Il tracciamento delle serie mi ha tenuto responsabile anche quando diventa difficile.", author: "Davide F." },
                    { stars: 4, quote: "Le sfide detox sono ben strutturate. Ho fatto il detox social media di 30 giorni e mi sono sentito davvero più calmo dopo due settimane.", author: "Giulia T." },
                  ].map((review, index) => (
                    <CarouselItem key={index} className="basis-[85%]">
                      <Card className="glass border-border/50 p-6 flex flex-col gap-4 h-full">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.stars ? "text-yellow-400" : "text-muted"}>★</span>
                          ))}
                        </div>
                        <p className="text-foreground text-sm leading-relaxed flex-1">"{review.quote}"</p>
                        <p className="text-muted-foreground text-sm font-medium">— {review.author}</p>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <span>←</span> {"scorri per leggere"} <span>→</span>
              </p>
            </ScrollReveal>

            {/* Desktop: grid layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {[
                { stars: 5, quote: "Il coach AI è come avere un terapeuta in tasca. Mi ha davvero aiutato a capire perché continuavo a ricadere.", author: "Marco B." },
                { stars: 5, quote: "Finalmente un'app che tratta il recovery seriamente con la scienza, non solo con la forza di volontà. La sezione sulla scienza del cervello ha cambiato la mia prospettiva.", author: "Sara L." },
                { stars: 5, quote: "Il tracciamento dei trigger mi ha aiutato a notare pattern che non avevo mai visto prima. Ora posso davvero anticipare i giorni difficili.", author: "Luca M." },
                { stars: 4, quote: "Ho provato molte app per le abitudini. Questa funziona perché la pianificazione giornaliera è naturale, non un peso.", author: "Alex R." },
                { stars: 5, quote: "58 giorni pulito. Il tracciamento delle serie mi ha tenuto responsabile anche quando diventa difficile.", author: "Davide F." },
                { stars: 4, quote: "Le sfide detox sono ben strutturate. Ho fatto il detox social media di 30 giorni e mi sono sentito davvero più calmo dopo due settimane.", author: "Giulia T." },
              ].map((review, index) => (
                <ScrollReveal key={index} delay={index * 80} variant="scale">
                  <Card className="glass border-border/50 p-6 flex flex-col gap-4 h-full">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.stars ? "text-yellow-400" : "text-muted"}>★</span>
                      ))}
                    </div>
                    <p className="text-foreground text-sm leading-relaxed flex-1">"{review.quote}"</p>
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
                {"Premium"}
              </Badge>
            </ScrollReveal>
            <ScrollReveal className="text-center mb-14" delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {"Strumenti che cambiano davvero la vita"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base">
                {"Non sono solo funzionalità. Sono gli strumenti che fanno la differenza tra provare e trasformarsi davvero."}
              </p>
            </ScrollReveal>

            {/* Mobile: swipeable carousel */}
            <ScrollReveal className="md:hidden" delay={200}>
              <Carousel opts={{ align: "center", loop: true }}>
                <CarouselContent>
                  {/* Porn Recovery */}
                  <CarouselItem className="basis-[90%]">
                    <div className="glass rounded-2xl border border-border/60 p-6 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                          <Eye className="h-6 w-6 text-violet-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{"Programma Porn Recovery"}</h3>
                          <Badge className="text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/20 border">{"Più Impattante"}</Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {"Basato sulle neuroscienze — capisci perché il tuo cervello si è agganciato e ricablalo passo dopo passo."}
                      </p>
                      <div className="space-y-1.5">
                        {(t("landing.premium_deep_dive.porn_recovery_mobile_features", { returnObjects: true }) as string[]).map((item) => (
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
                        <h3 className="text-lg font-bold text-foreground">{"Tracciamento & Analisi Trigger"}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {"Le ricadute sembrano casuali — ma non lo sono. Rivela pattern nascosti e ottieni report AI per prevedere e prevenire."}
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
                        <h3 className="text-lg font-bold text-foreground">{"Coach AI Personale"}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {"Un coach disponibile alle 3 di notte quando arriva una voglia. Non giudica — ti guida e ti fa andare avanti."}
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
                        <h3 className="text-lg font-bold text-foreground">{"Sezione Impara"}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {"La scienza dietro le abitudini, la dopamina e il recupero cerebrale. La conoscenza rende ogni sforzo significativo."}
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
                        <h3 className="text-lg font-bold text-foreground">{"Adattamento Abitudini AI"}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {"L'AI analizza i tuoi pattern reali di completamento e suggerisce aggiustamenti più intelligenti."}
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
                <span>←</span> {"scorri per esplorare"} <span>→</span>
              </p>
            </ScrollReveal>

            {/* Desktop: stacked layout */}
            <div className="hidden md:block space-y-6">
              {/* Porn Recovery Program */}
              <ScrollReveal variant="left">
                <div className="glass rounded-2xl border border-border/60 p-6 md:p-8 hover:border-violet-500/30 transition-all duration-300 group">
                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Eye className="h-7 w-7 text-violet-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{"Programma Porn Recovery"}</h3>
                        <Badge className="text-xs bg-violet-500/10 text-violet-600 border-violet-500/20 border">{"Più Impattante"}</Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {"Non si tratta di forza di volontà. Il programma è basato sulle neuroscienze — ti aiuta a capire esattamente perché il tuo cervello si è agganciato, e come ricablarlo passo dopo passo."}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(t("landing.premium_deep_dive.porn_recovery_features", { returnObjects: true }) as string[]).map((item) => (
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
                      <h3 className="text-xl font-bold text-foreground mb-2">{"Tracciamento & Analisi Trigger"}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {"La maggior parte delle ricadute sembra casuale — ma non lo è. Il Tracciamento Trigger rivela i pattern nascosti dietro i tuoi momenti peggiori."}
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
                      <h3 className="text-xl font-bold text-foreground mb-2">{"Coach AI Personale"}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {"Immagina di avere un coach che conosce le tue abitudini, le tue difficoltà e i tuoi obiettivi — disponibile alle 3 di notte quando arriva una voglia."}
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
                        <h3 className="text-lg font-bold text-foreground mb-2">{"Sezione Impara"}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          {"Comprendi la scienza dietro le tue abitudini, la dopamina e il recupero cerebrale."}
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
                        <h3 className="text-lg font-bold text-foreground mb-2">{"Adattamento Abitudini AI"}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          {"L'AI analizza i tuoi pattern reali di completamento e suggerisce aggiustamenti più intelligenti."}
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
              <p className="text-sm text-muted-foreground mb-2">{"Tutte le funzionalità premium per"}</p>
              <p className="text-4xl font-bold text-foreground mb-1">€9.99<span className="text-lg text-muted-foreground font-normal">/{"mese"}</span></p>
              <Button
                size="lg"
                onClick={() => navigate(user ? "/pricing" : "/auth?mode=signup")}
                className="mt-4 gradient-accent text-accent-foreground rounded-xl h-14 px-10 text-lg shadow-soft hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <Crown className="h-5 w-5 mr-2" />
                {"Sblocca Premium"}
              </Button>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-20">
          <ScrollReveal className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {"Pronto per iniziare a costruire?"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {"Unisciti a migliaia di persone che stanno trasformando la propria vita con InnerBuild. Il tuo percorso verso abitudini migliori inizia oggi."}
            </p>
            <Button
              size="lg"
              onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
              className="gradient-primary text-primary-foreground rounded-xl h-14 px-10 text-lg shadow-soft hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {"Inizia Gratis"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </ScrollReveal>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
