import { ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";
import { useTranslation } from "react-i18next";

const CONTENT = [
  "Torna alla Home",
  "Termini di Servizio",
  "Ultimo aggiornamento: Febbraio 2026",
  "1. Accettazione dei Termini",
  "Accedendo o utilizzando l'applicazione InnerBuild, accetti di essere vincolato da questi Termini di Servizio. Se non accetti una qualsiasi parte dei termini, non puoi accedere al servizio.",
  "2. Utilizzo del Servizio",
  "Il nostro servizio ti permette di monitorare abitudini, impostare obiettivi e analizzare i tuoi progressi. Ti impegni a utilizzare il servizio in modo responsabile e nel rispetto delle leggi vigenti.",
  "3. Account Utente",
  "Quando crei un account con noi, devi fornire informazioni accurate e complete. Sei responsabile della protezione della tua password e di qualsiasi attività sotto il tuo account.",
  "4. Limitazione di Responsabilità",
  "InnerBuild non sarà responsabile per eventuali danni indiretti, incidentali, speciali, consequenziali o punitivi derivanti dal tuo accesso o utilizzo del servizio.",
  "5. Risoluzione",
  "Possiamo interrompere o sospendere il tuo accesso immediatamente, senza preavviso o responsabilità, per qualsiasi motivo, inclusa la violazione dei Termini.",
  "6. Legge Applicabile",
  "Questi Termini saranno regolati e interpretati in conformità con le leggi italiane, senza riguardo alle disposizioni sui conflitti di legge.",
  "7. Contattaci",
  "Se hai domande su questi Termini, contattaci a"
];

export default function TermsOfService() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { display, ready } = useUiBatchTranslation(CONTENT, true);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/?no_redirect=true")}
            className="mb-4 hover:bg-muted transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {display(CONTENT[0])}
          </Button>
          <h1 className="text-4xl font-bold text-foreground">{display(CONTENT[1])}</h1>
          <p className="text-muted-foreground mt-2">{display(CONTENT[2])}</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{display(CONTENT[3])}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {display(CONTENT[4])}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{display(CONTENT[5])}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {display(CONTENT[6])}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{display(CONTENT[7])}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {display(CONTENT[8])}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{display(CONTENT[9])}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {display(CONTENT[10])}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{display(CONTENT[11])}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {display(CONTENT[12])}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{display(CONTENT[13])}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {display(CONTENT[14])}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{display(CONTENT[15])}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {display(CONTENT[16])}{" "}
                <a href="mailto:inner.build07@gmail.com" className="text-primary hover:underline transition-colors">
                  inner.build07@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
