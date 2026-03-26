import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { z } from "zod";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const emailSchema = z.string().email("Inserisci un indirizzo email valido");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) { setError(emailResult.error.errors[0].message); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) {
        if (error.message.includes("rate limit")) {
          toast({ title: "Too many requests", description: "Please wait a few minutes before trying again.", variant: "destructive" });
        } else {
          toast({ title: "Errore", description: error.message, variant: "destructive" });
        }
      } else { setIsSuccess(true); }
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />{"Torna al login"}
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 pb-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
              {isSuccess ? <CheckCircle className="h-8 w-8 text-primary-foreground" /> : <Leaf className="h-8 w-8 text-primary-foreground" />}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isSuccess ? "Controlla la tua email" : "Password Dimenticata"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSuccess ? "Abbiamo inviato un link per reimpostare la password a" : "Inserisci il tuo indirizzo email e ti invieremo un link per reimpostare la password."}
            </p>
          </div>

          {isSuccess ? (
            <div className="glass rounded-2xl p-6 space-y-4 shadow-card text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/10"><Mail className="h-6 w-6 text-primary" /></div>
              <p className="text-sm text-muted-foreground">
                {"Controlla la posta in arrivo e la cartella spam."}{" "}
                <button type="button" onClick={() => setIsSuccess(false)} className="text-primary font-medium hover:underline">try again</button>
              </p>
              <Button onClick={() => navigate("/auth")} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium shadow-soft">
                {"Torna all'accesso"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="glass rounded-2xl p-6 space-y-4 shadow-card">
                <div className="space-y-2">
                  <Label htmlFor="email">{"Email"}</Label>
                  <Input id="email" type="email" placeholder={"tu@esempio.com"} value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                    className={`h-12 rounded-xl ${error ? "border-destructive" : ""}`} />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium shadow-soft" disabled={isLoading}>
                {isLoading ? "Invio..." : "Invia Link di Reset"}
              </Button>
            </form>
          )}

          {!isSuccess && (
            <p className="text-center mt-6 text-muted-foreground">
              Remember your password?{" "}
              <button type="button" onClick={() => navigate("/auth")} className="text-primary font-medium hover:underline">{"Accedi"}</button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
