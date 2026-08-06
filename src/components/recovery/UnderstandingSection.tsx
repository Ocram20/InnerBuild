import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, Brain, ChevronLeft, ChevronRight, Activity, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function UnderstandingSection() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: "super-stimulus",
      title: t("understanding_section.slide1_title", "Super-Stimolo Dopaminergico"),
      subtitle: t("understanding_section.slide1_subtitle", "Impatto Neurochimico"),
      badgeColor: "text-[#4D87D9] dark:text-[#619BF0] bg-[#4D87D9]/10 border-[#4D87D9]/30",
      icon: Zap,
      content: (
        <div className="space-y-5">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("understanding_section.slide1_desc", "Il cervello scambia l'iper-stimolazione digitale per un segnale biologico di massima priorità, alterando la nostra motivazione naturale.")}
          </p>

          {/* Visual Dopamine Comparison Bar */}
          <div className="space-y-4 bg-muted/40 dark:bg-[#0f1419]/90 p-4 rounded-2xl border border-border/60">
            {/* Natural Baseline */}
            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold mb-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-[#4b9b75] dark:text-[#5ec396]" />
                  {t("understanding_section.natural_stimuli", "Stimoli Naturali (Cibo, Sport, Relazioni)")}
                </span>
                <span className="text-[#4b9b75] dark:text-[#5ec396]">100% - 150%</span>
              </div>
              <div className="h-3.5 w-full bg-muted dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-[#4b9b75] dark:bg-[#5ec396] rounded-full w-[40%]" />
              </div>
            </div>

            {/* Super Stimulus Spike */}
            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold mb-1.5">
                <span className="text-[#4D87D9] dark:text-[#619BF0] flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-[#4D87D9] dark:text-[#619BF0]" />
                  {t("understanding_section.super_stimulus", "Super-Stimolo Digitale")}
                </span>
                <span className="text-[#4D87D9] dark:text-[#619BF0]">200% - 500%+</span>
              </div>
              <div className="h-3.5 w-full bg-muted dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-[#4D87D9] to-[#9B5BDB] rounded-full w-[92%]" />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#4D87D9]/10 border border-[#4D87D9]/20 text-xs sm:text-sm text-[#4D87D9] dark:text-[#619BF0] leading-relaxed">
            💡 <strong>{t("understanding_section.consequence_label", "Conseguenza:")}</strong> {t("understanding_section.consequence_text", "I recettori si desensibilizzano temporaneamente per proteggersi. Il tempo libero consente loro di ripristinare la normale sensibilità.")}
          </div>
        </div>
      ),
    },
    {
      id: "reboot-timeline",
      title: t("understanding_section.slide2_title", "Timeline di Neuroplasticità"),
      subtitle: t("understanding_section.slide2_subtitle", "Ripristino Naturale"),
      badgeColor: "text-[#4D87D9] dark:text-[#619BF0] bg-[#4D87D9]/10 border-[#4D87D9]/30",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("understanding_section.slide2_desc", "Il tuo sistema nervoso riorganizza e ripristina la naturale sensibilità dopaminergica a fasi graduali.")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Phase 1 */}
            <div className="p-4 rounded-2xl bg-card dark:bg-[#0f1419]/90 border border-[#4D87D9]/30 space-y-1.5 relative overflow-hidden">
              <div className="h-1 bg-[#4D87D9] dark:bg-[#619BF0] absolute top-0 left-0 right-0" />
              <span className="text-xs font-extrabold text-[#4D87D9] dark:text-[#619BF0] uppercase tracking-wider block">
                0-7 {t("common.days_upper", "GIORNI")}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-foreground">{t("understanding_section.phase1_title", "Reset Iniziale")}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t("understanding_section.phase1_desc", "Picco di craving e riposo iniziale per i recettori sovraccaricati.")}
              </p>
            </div>

            {/* Phase 2 */}
            <div className="p-4 rounded-2xl bg-card dark:bg-[#0f1419]/90 border border-[#9B5BDB]/30 space-y-1.5 relative overflow-hidden">
              <div className="h-1 bg-[#9B5BDB] dark:bg-[#C377D7] absolute top-0 left-0 right-0" />
              <span className="text-xs font-extrabold text-[#9B5BDB] dark:text-[#C377D7] uppercase tracking-wider block">
                8-30 {t("common.days_upper", "GIORNI")}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-foreground">{t("understanding_section.phase2_title", "Ricalibrazione")}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t("understanding_section.phase2_desc", "Chiarezza mentale, energia e stabilità emotiva in aumento.")}
              </p>
            </div>

            {/* Phase 3 */}
            <div className="p-4 rounded-2xl bg-card dark:bg-[#0f1419]/90 border border-[#4b9b75]/30 space-y-1.5 relative overflow-hidden">
              <div className="h-1 bg-[#4b9b75] dark:bg-[#5ec396] absolute top-0 left-0 right-0" />
              <span className="text-xs font-extrabold text-[#4b9b75] dark:text-[#5ec396] uppercase tracking-wider block">
                30-90 {t("common.days_upper", "GIORNI")}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-foreground">{t("understanding_section.phase3_title", "Rinascita")}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t("understanding_section.phase3_desc", "Ricablaggio profondo dei circuiti della motivazione reale.")}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "wanting-vs-liking",
      title: t("understanding_section.slide3_title", "Desiderio vs Piacere"),
      subtitle: "Wanting vs Liking",
      badgeColor: "text-[#9B5BDB] dark:text-[#C377D7] bg-[#9B5BDB]/10 border-[#9B5BDB]/30",
      icon: Brain,
      content: (
        <div className="space-y-4">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("understanding_section.slide3_desc", "Perché l'impulso sembra travolgente anche quando non offre alcun reale appagamento.")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Wanting Card */}
            <div className="p-4 rounded-2xl bg-[#4D87D9]/10 border border-[#4D87D9]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#4D87D9] dark:text-[#619BF0] flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  {t("understanding_section.wanting_title", "DESIDERIO (Wanting)")}
                </span>
                <span className="text-xs bg-[#4D87D9]/20 text-[#4D87D9] dark:text-[#619BF0] px-2 py-0.5 rounded font-mono font-bold">{t("understanding_section.wanting_tag", "Dopamina")}</span>
              </div>
              <p className="text-sm text-foreground font-semibold">{t("understanding_section.wanting_sub", "La spinta dell'anticipazione")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t("understanding_section.wanting_desc", "È il motore dell'impulso (\"devo averlo subito\"). Promette sollievo ma non genera appagamento duraturo.")}
              </p>
            </div>

            {/* Liking Card */}
            <div className="p-4 rounded-2xl bg-[#4b9b75]/10 border border-[#4b9b75]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#4b9b75] dark:text-[#5ec396] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("understanding_section.liking_title", "PIACERE (Liking)")}
                </span>
                <span className="text-xs bg-[#4b9b75]/20 text-[#4b9b75] dark:text-[#5ec396] px-2 py-0.5 rounded font-mono font-bold">{t("understanding_section.liking_tag", "Endorfine")}</span>
              </div>
              <p className="text-sm text-foreground font-semibold">{t("understanding_section.liking_sub", "Il reale appagamento")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t("understanding_section.liking_desc", "La gioia autentica di un'esperienza reale. Nella dipendenza, il Wanting domina soffocando il Liking.")}
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const current = slides[currentSlide];
  const IconComponent = current.icon;

  return (
    <div className="space-y-3">
      {/* Slide Navigation Controls */}
      <Card className="border-border/60 bg-card dark:bg-[#192028]/95 backdrop-blur-md shadow-xl overflow-hidden rounded-3xl relative">
        <CardContent className="p-5 sm:p-7 space-y-5">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#4D87D9]/10 text-[#4D87D9] dark:text-[#619BF0] border border-[#4D87D9]/20">
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                  {current.title}
                </h3>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border mt-1 ${current.badgeColor}`}>
                  {current.subtitle}
                </span>
              </div>
            </div>

            {/* Next / Prev Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="h-9 w-9 rounded-full border-border/60 bg-background hover:bg-muted dark:bg-slate-900/60 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="h-9 w-9 rounded-full border-border/60 bg-background hover:bg-muted dark:bg-slate-900/60 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>

          {/* Slide Content Animated */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {current.content}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Dot Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-[#4D87D9] dark:bg-[#619BF0]"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
