import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Leaf, Check, ArrowLeft, Loader2, LogOut, Crown, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export default function Pricing() {
  const { user, signOut } = useAuth();
  const { subscription, loading, createCheckout } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const freeFeatures = [
    "Fino a 5 abitudini", "1 sfida detox attiva", "Tracciamento abitudini base con serie",
    "Citazioni motivazionali giornaliere", "Pianificazione giornaliera (Da Fare & Da Non Fare)", "Riflessione serale e gratitudine",
    "Profilo con calendario attività", "Insight Cosa Funziona", "Panoramica progressi (recente & annuale)",
  ];

  const premiumFeatures = [
    "Abitudini illimitate", "Sfide detox illimitate",
    "Coach AI Personale (24/7)", "Programma Porn Recovery con tracciamento serie",
    "Tracciamento trigger e analisi AI dei pattern", "Suggerimenti adattamento abitudini AI",
    "Sezione Impara (articoli, guide & timeline)", "Accesso prioritario a nuove funzionalità",
  ];

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Benvenuto su InnerBuild Premium!", description: "Il tuo abbonamento è ora attivo. Buon utilizzo!" });
      navigate("/dashboard", { replace: true });
    } else if (searchParams.get("canceled") === "true") {
      toast({ title: "Checkout annullato", description: "Nessun problema - puoi abbonarti in qualsiasi momento." });
    }
  }, [searchParams, toast, navigate, t]);

  useEffect(() => {
    if (!loading && subscription.subscribed) navigate("/dashboard", { replace: true });
  }, [subscription.subscribed, loading, navigate]);

  const handleSubscribe = async () => {
    if (!user) { navigate("/auth"); return; }
    setCheckoutLoading(true);
    try { await createCheckout(); } catch (error) {
      toast({ title: "Errore", description: "Avvio checkout fallito. Riprova.", variant: "destructive" });
      setCheckoutLoading(false);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between p-4 md:px-8 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => user ? navigate("/dashboard") : navigate("/")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">InnerBuild</span>
        </div>
        {user && (
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full">
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto animate-slide-up">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{"Scegli il Tuo Piano"}</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">{"Inizia gratis e aggiorna quando sei pronto. Nessun costo nascosto, annulla quando vuoi."}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="glass border-border/50 relative overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4 mx-auto">{"Piano Gratuito"}</div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{"€0"}</span>
                  <span className="text-muted-foreground">{"/per sempre"}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{"Inizia con le basi"}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  {freeFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0"><Check className="h-3 w-3 text-success" /></div>
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => navigate(user ? "/dashboard" : "/auth")} className="w-full h-12 rounded-xl font-medium">
                  {user ? "Piano Attuale" : "Inizia Gratis"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass border-2 border-primary/30 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />{"Più Popolare"}
                </div>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 mx-auto">
                  <Crown className="h-4 w-4" />{"Piano Premium"}
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{"€9.99"}</span>
                  <span className="text-muted-foreground">{"/mese"}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{"Sblocca il tuo pieno potenziale"}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-3 text-center">{"Tutto nel Gratuito, più:"}</p>
                <div className="space-y-3 mb-6">
                  {premiumFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0"><Check className="h-3 w-3 text-success" /></div>
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSubscribe} disabled={checkoutLoading} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium shadow-soft transition-transform duration-100 active:scale-95">
                  {checkoutLoading ? (<><Loader2 className="h-5 w-5 animate-spin" /><span>{"Caricamento..."}</span></>) : user ? "Abbonati Ora" : "Ottieni Premium"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">{"Garanzia di rimborso 30 giorni • Annulla quando vuoi • Pagamento sicuro via Stripe"}</p>
            {!user && (
              <p className="text-sm text-muted-foreground">
                {"Hai già un account?"}{" "}
                <button onClick={() => navigate("/auth")} className="text-primary font-medium hover:underline">{"Accedi"}</button>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
