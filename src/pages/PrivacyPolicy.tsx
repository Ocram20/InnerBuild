import { ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";
import { useTranslation } from "react-i18next";

const CONTENT = [
  "Torna alla Home",
  "Informativa Privacy",
  "Ultimo aggiornamento: Febbraio 2026",
  "1. Introduzione",
  "InnerBuild (\"noi\", \"nostro\") gestisce l'applicazione InnerBuild. Questa pagina ti informa sulle nostre politiche riguardanti la raccolta, l'uso e la divulgazione dei dati personali quando utilizzi il nostro servizio e sulle scelte che hai associate a quei dati.",
  "2. Raccolta e Utilizzo delle Informazioni",
  "Raccogliamo diversi tipi di informazioni per vari scopi per fornire e migliorare il nostro servizio.",
  "Indirizzo email per autenticazione e comunicazione",
  "Dati sulle abitudini e log personali che scegli di registrare",
  "Analisi sull'utilizzo per migliorare la nostra piattaforma",
  "Informazioni sul dispositivo per risolvere problemi",
  "3. Sicurezza",
  "La sicurezza dei tuoi dati è importante per noi, ma ricorda che nessun metodo di trasmissione su Internet o metodo di archiviazione elettronica è sicuro al 100%. Sebbene ci sforziamo di usare mezzi commercialmente accettabili per proteggere i tuoi dati personali, non possiamo garantirne la sicurezza assoluta.",
  "4. Modifiche a Questa Informativa Privacy",
  "Potremmo aggiornare la nostra Informativa Privacy di tanto in tanto. Ti notificheremo eventuali modifiche aggiornando la data \"Ultimo aggiornamento\" su questa pagina.",
  "5. Contattaci",
  "Se hai domande su questa Informativa Privacy, contattaci a"
];

export default function PrivacyPolicy() {
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
              <p className="text-muted-foreground leading-relaxed mb-3">
                {display(CONTENT[6])}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{display(CONTENT[7])}</li>
                <li>{display(CONTENT[8])}</li>
                <li>{display(CONTENT[9])}</li>
                <li>{display(CONTENT[10])}</li>
              </ul>
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
