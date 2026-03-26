import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-foreground">{"Termini di Servizio"}</h1>
          <p className="text-muted-foreground mt-2">{"Ultimo aggiornamento: Febbraio 2026"}</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"1. Accettazione dei Termini"}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {"Accedendo e utilizzando l'applicazione InnerBuild, accetti e accetti di essere vincolato dai termini e dalle disposizioni di questo accordo. Se non accetti di rispettare quanto sopra, non utilizzare questo servizio."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"2. Licenza di Utilizzo"}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {"È concessa l'autorizzazione a scaricare temporaneamente una copia dei materiali (informazioni o software) su InnerBuild solo per la visione transitoria personale e non commerciale. Questa è la concessione di una licenza, non un trasferimento di titolo, e in base a questa licenza non puoi:"}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{"Modificare o copiare i materiali"}</li>
                <li>{"Utilizzare i materiali per qualsiasi scopo commerciale o per qualsiasi display pubblico"}</li>
                <li>{"Tentare di decompilare o decodificare qualsiasi software contenuto su InnerBuild"}</li>
                <li>{"Rimuovere qualsiasi nota di copyright o altre notazioni di proprietà dai materiali"}</li>
                <li>{"Trasferire i materiali a un'altra persona o \"mirroring\" i materiali su qualsiasi altro server"}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"3. Disclaimer"}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {"I materiali su InnerBuild sono forniti \"così come sono\". InnerBuild non rilascia garanzie, espresse o implicite, e con il presente nega e invalida tutte le altre garanzie, inclusi, senza limitazione, garanzie o condizioni implicite di commerciabilità, idoneità per uno scopo particolare, o non violazione di proprietà intellettuale o altra violazione di diritti."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"4. Limitazioni"}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {"In nessun caso InnerBuild o i suoi fornitori saranno responsabili per qualsiasi danno (inclusi, senza limitazione, danni per perdita di dati o profitto, o dovuti a interruzione di attività) derivanti dall'uso o dall'impossibilità di utilizzare i materiali su InnerBuild."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"5. Accuratezza dei Materiali"}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {"I materiali che appaiono su InnerBuild potrebbero includere errori tecnici, tipografici o fotografici. InnerBuild non garantisce che qualsiasi dei materiali sul suo sito web sia accurato, completo o attuale. InnerBuild può apportare modifiche ai materiali contenuti sul suo sito web in qualsiasi momento senza preavviso."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{"6. Contattaci"}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {"Se hai domande su questi Termini di Servizio, contattaci a"}{" "}
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
