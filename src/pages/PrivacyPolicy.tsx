import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 hover:bg-muted transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {"Torna alla Home"}
          </Button>
          <h1 className="text-4xl font-bold text-foreground">{"Informativa Privacy"}</h1>
          <p className="text-muted-foreground mt-2">{"Ultimo aggiornamento: Febbraio 2026"}</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"1. Introduzione"}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {"InnerBuild (\"noi\", \"nostro\") gestisce l'applicazione InnerBuild. Questa pagina ti informa sulle nostre politiche riguardanti la raccolta, l'uso e la divulgazione dei dati personali quando utilizzi il nostro servizio e sulle scelte che hai associate a quei dati."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"2. Raccolta e Utilizzo delle Informazioni"}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {"Raccogliamo diversi tipi di informazioni per vari scopi per fornire e migliorare il nostro servizio."}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{"Indirizzo email per autenticazione e comunicazione"}</li>
                <li>{"Dati sulle abitudini e log personali che scegli di registrare"}</li>
                <li>{"Analisi sull'utilizzo per migliorare la nostra piattaforma"}</li>
                <li>{"Informazioni sul dispositivo per risolvere problemi"}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"3. Sicurezza"}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {"La sicurezza dei tuoi dati è importante per noi, ma ricorda che nessun metodo di trasmissione su Internet o metodo di archiviazione elettronica è sicuro al 100%. Sebbene ci sforziamo di usare mezzi commercialmente accettabili per proteggere i tuoi dati personali, non possiamo garantirne la sicurezza assoluta."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"4. Modifiche a Questa Informativa Privacy"}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {"Potremmo aggiornare la nostra Informativa Privacy di tanto in tanto. Ti notificheremo eventuali modifiche aggiornando la data \"Ultimo aggiornamento\" su questa pagina."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"5. Contattaci"}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {"Se hai domande su questa Informativa Privacy, contattaci a"}{" "}
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
