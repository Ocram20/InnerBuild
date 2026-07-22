import { motion } from "framer-motion";
import { Zap, Clock, Brain, Flame, Activity, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function UnderstandingSection() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* CARD 1: Super-Stimolo Dopaminergico */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <Card className="border-amber-500/30 bg-slate-900/90 backdrop-blur-md shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Zap className="h-4 w-4" />
                </div>
                <span>Super-Stimolo Dopaminergico</span>
              </CardTitle>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Impatto Neurochimico
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Il cervello scambia l'iper-stimolazione digitale per un segnale biologico di massima priorità.
            </p>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-4 pt-2 space-y-3">
            {/* Visual Dopamine Comparison Bar */}
            <div className="space-y-2.5 bg-slate-950/70 p-3.5 rounded-2xl border border-border/50">
              {/* Baseline Natural Reward */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3 text-cyan-400" />
                    Stimoli Naturali (Cibo, Sport, Socialità)
                  </span>
                  <span className="text-cyan-400 font-bold">100% - 150%</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "40%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                  />
                </div>
              </div>

              {/* Super Stimulus Spike */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Flame className="h-3 w-3 text-rose-500" />
                    Super-Stimolo Digitale (Pornografia)
                  </span>
                  <span className="text-rose-400 font-bold">200% - 500%+ (Spike)</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "95%" }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
                    className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-200/90 leading-tight">
              ⚡ <strong>Conseguenza:</strong> I recettori della dopamina si desensibilizzano ("down-regulation") per proteggersi dal sovraccarico, riducendo l'entusiasmo per le attività quotidiane.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* CARD 2: Timeline di Reboot del Cervello */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.05 }}
      >
        <Card className="border-purple-500/30 bg-slate-900/90 backdrop-blur-md shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
                <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Clock className="h-4 w-4" />
                </div>
                <span>Timeline di Reboot del Cervello</span>
              </CardTitle>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Fasi di Neuroplasticità
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Come il tuo sistema nervoso ripristina la normale sensibilità dopaminergica nel tempo.
            </p>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-4 pt-2">
            <div className="grid grid-cols-3 gap-2">
              {/* Phase 1 */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500" />
                <div>
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
                    0-7 GIORNI
                  </span>
                  <h4 className="text-xs font-bold text-foreground leading-tight">Reset Iniziale</h4>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
                  Astinenza acuta & picco di craving. I recettori iniziano a riposare.
                </p>
              </div>

              {/* Phase 2 */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-blue-500/30 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1 bg-blue-500" />
                <div>
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider block mb-1">
                    8-30 GIORNI
                  </span>
                  <h4 className="text-xs font-bold text-foreground leading-tight">Ricalibrazione</h4>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
                  Aumento della chiarezza mentale, energia e stabilità dell'umore.
                </p>
              </div>

              {/* Phase 3 */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">
                    30-90 GIORNI
                  </span>
                  <h4 className="text-xs font-bold text-foreground leading-tight">Rinascita</h4>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
                  Rewiring completo dei circuiti di ricompensa e motivazione naturale.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CARD 3: Desiderio vs Piacere */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.1 }}
      >
        <Card className="border-emerald-500/30 bg-slate-900/90 backdrop-blur-md shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Brain className="h-4 w-4" />
                </div>
                <span>Desiderio vs Piacere</span>
              </CardTitle>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Liking vs Wanting
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Comprendere perché l'impulso sembra fortissimo anche quando non stai provando reale appagamento.
            </p>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Wanting Pill */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    DESIDERIO (Wanting)
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">Dopamina</span>
                </div>
                <p className="text-xs text-foreground/90 font-medium">La spinta dell'anticipazione</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  È il motore dell'impulso ("devo averlo ora"). Promette sollievo ma non genera vera felicità.
                </p>
              </div>

              {/* Liking Pill */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    PIACERE (Liking)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Endorfine</span>
                </div>
                <p className="text-xs text-foreground/90 font-medium">Il reale appagamento</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  La reale gioia di un'esperienza. Nella dipendenza, il "Wanting" cresce a dismisura mentre il "Liking" crolla.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

