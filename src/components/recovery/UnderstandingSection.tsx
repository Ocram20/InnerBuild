import { BookOpen, ChevronDown, AlertTriangle, Brain, Zap, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function UnderstandingSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {"Comprendere il Problema"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {"La pornografia online moderna è progettata per dirottare il sistema di ricompensa del tuo cervello. Comprendere la scienza dietro questo è il primo passo verso la libertà."}
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="super-stimulus">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                {"L'Effetto Super-Stimolo"}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                {"La pornografia su Internet agisce come un"} <strong>{"super-stimolo"}</strong> {"— una versione artificialmente potenziata di una ricompensa naturale che il tuo cervello non è mai evoluto per gestire:"}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>{"Novità illimitata:"}</strong> {"Contenuti infiniti provocano picchi di dopamina ben oltre ciò che le esperienze naturali forniscono"}</li>
                <li><strong>{"Accesso istantaneo:"}</strong> {"Nessuno sforzo richiesto significa nessun ritardo naturale tra desiderio e ricompensa"}</li>
                <li><strong>{"Contenuti estremi:"}</strong> {"Materiale sempre più estremo spinge la soglia di ricompensa del tuo cervello sempre più in alto"}</li>
              </ul>
              <p>
                {"Il tuo cervello rilascia più dopamina prevedendo e cercando che durante l'esperienza reale, creando un potente ciclo di desiderio."}
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="effects">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                {"Effetti Comuni"}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <div className="grid gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">{"Desensibilizzazione"}</p>
                  <p>{"Il tuo cervello diventa meno reattivo alla dopamina, richiedendo stimoli più intensi per provare lo stesso piacere."}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">{"Escalation"}</p>
                  <p>{"Nel tempo, potresti cercare contenuti più estremi o nuovi per ottenere lo stesso effetto."}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">{"Ansia e Bassa Autostima"}</p>
                  <p>{"Il ciclo di uso e rimorso può alimentare ansia, vergogna e autopercezione negativa."}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">{"Problemi di concentrazione"}</p>
                  <p>{"La disregolazione della dopamina influisce sulla concentrazione, motivazione e capacità di apprezzare le attività quotidiane."}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pied">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                {"Effetti Sessuali ed Emotivi"}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="font-medium text-foreground mb-2">{"Disfunzione Erettile Indotta da Porno (PIED)"}</p>
                <p>
                  {"Molti uomini sperimentano difficoltà con l'eccitazione durante incontri intimi reali. Questo accade perché il cervello è stato condizionato a rispondere solo alla stimolazione artificiale del porno, non ai partner reali."}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-foreground mb-2">{"Disconnessione Emotiva"}</p>
                <p>
                  {"L'uso regolare del porno può rendere più difficile formare legami emotivi profondi. L'intimità reale richiede vulnerabilità e connessione che il porno ti allena a bypassare."}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="young-brains">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                {"Perché i Cervelli Giovani Sono Più Vulnerabili"}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                {"I cervelli adolescenziali e dei giovani adulti sono particolarmente suscettibili a causa della"} <strong>{"neuroplasticità"}</strong> {"— l'alta capacità del cervello di formare nuove vie neurali."}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{"La corteccia prefrontale (controllo degli impulsi) non è completamente sviluppata fino ai 25 anni"}</li>
                <li>{"La sensibilità alla dopamina è al suo picco durante l'adolescenza"}</li>
                <li>{"Le vie neurali formate durante questo periodo diventano profondamente radicate"}</li>
                <li>{"L'esposizione precoce può modellare i modelli di eccitazione sessuale per la vita"}</li>
              </ul>
              <p className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-2">
                <strong>{"La buona notizia:"}</strong> {"La stessa neuroplasticità che rende i cervelli giovani vulnerabili significa anche che possono ricollegarsi più velocemente durante il recupero."}
              
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
