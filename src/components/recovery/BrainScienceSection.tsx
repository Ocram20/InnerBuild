import { Brain, TrendingUp, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function BrainScienceSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {"Cosa accade nel cervello"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="wanting-liking">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                {"Desiderio vs Piacere"}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                {"Il tuo cervello ha due sistemi separati per la ricompensa:"}
              </p>
              <div className="grid gap-3">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="font-medium text-foreground mb-1">
                    <span className="text-amber-500">{"Desiderio"}</span> ({"Craving guidato dalla dopamina"})
                  </p>
                  <p>
                    {"È l'anticipazione, la ricerca, l'impulso. La dopamina ti spinge a cercare la ricompensa, non a godertela. Per questo puoi passare ore a cercare e cliccare, sentendoti insoddisfatto."}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="font-medium text-foreground mb-1">
                    <span className="text-emerald-500">{"Piacere"}</span> ({"Piacere reale"})
                  </p>
                  <p>
                    {"Vera soddisfazione e piacere. Con il porno, questo sistema si indebolisce — vuoi di più ma ne godi meno. I piaceri reali appaiono opachi al confronto."}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/80 italic">
                {"\"Il divario tra desiderio e piacere è la trappola. Stai inseguendo una soddisfazione che non arriva mai.\""}
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="escalation">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-500" />
                {"Perché la novità aumenta il craving"}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                {"Il tuo cervello è cablato per prestare attenzione alla"} <strong>{"novità"}</strong> {"Ogni nuova immagine o video scatena un picco di dopamina perché il tuo cervello pensa: \"Potrebbe essere importante!\""}
              </p>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <p className="font-medium text-foreground">{"Il ciclo di escalation:"}</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>{"Nuovi contenuti → Picco di dopamina → Soddisfazione temporanea"}</li>
                  <li>{"Stessi contenuti → Meno dopamina → Bisogno di più novità"}</li>
                  <li>{"Cerca contenuti più estremi/nuovi → Picco maggiore → Si sviluppa tolleranza"}</li>
                  <li>{"Il cervello richiede più intensità per provare qualcosa → La dipendenza si approfondisce"}</li>
                </ol>
              </div>
              <p>
                {"Ecco perché molti utenti si ritrovano a guardare contenuti che non avrebbero mai cercato all'inizio. Non è una questione di cosa vuoi — è una questione di ciò che il tuo sistema di ricompensa dirottato esige."}
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reboot">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-500" />
                {"Il reboot: come il tuo cervello guarisce"}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                {"L'astinenza dal porno permette al tuo cervello di"} <strong>{"resettare la sensibilità alla dopamina"}</strong> {"Questo processo, spesso chiamato \"reboot\", porta a miglioramenti misurabili:"}
              </p>
              <div className="grid gap-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/10">
                  <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{"Umore migliorato"}</p>
                    <p className="text-xs">{"Ansia e depressione ridotte mentre la dopamina si normalizza"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/10">
                  <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{"Migliore concentrazione"}</p>
                    <p className="text-xs">{"Attenzione e concentrazione tornano a livelli sani"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-500/10">
                  <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{"Risposta sessuale sana"}</p>
                    <p className="text-xs">{"L'eccitazione verso partner reali ritorna, i sintomi del PIED si risolvono"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/10">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{"Più energia e motivazione"}</p>
                    <p className="text-xs">{"La vita sembra più vibrante, i piaceri quotidiani tornano"}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/80 p-2 bg-muted/30 rounded-lg">
                <strong>{"Linea temporale:"}</strong> {"La maggior parte delle persone nota miglioramenti evidenti entro 30-90 giorni, anche se il recupero completo può richiedere più tempo a seconda della durata e dell'intensità dell'uso."}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
