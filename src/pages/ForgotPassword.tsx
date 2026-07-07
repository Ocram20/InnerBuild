import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { z } from "zod";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailSchema = z.string().email(t("auth_validation.invalid_email"));
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return;
    }
    setIsLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (resetError) {
        if (resetError.message.includes("rate limit")) {
          toast({
            title: t("forgot_password.rate_limit_title"),
            description: t("forgot_password.rate_limit_desc"),
            variant: "destructive",
          });
        } else {
          toast({ title: t("common.error"), description: resetError.message, variant: "destructive" });
        }
      } else {
        setIsSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("forgot_password.back_to_login")}
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 pb-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
              {isSuccess ? <CheckCircle className="h-8 w-8 text-primary-foreground" /> : <Leaf className="h-8 w-8 text-primary-foreground" />}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isSuccess ? t("forgot_password.check_email") : t("forgot_password.title")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSuccess ? t("forgot_password.reset_sent_description") : t("forgot_password.description")}
            </p>
          </div>

          {isSuccess ? (
            <div className="glass rounded-2xl p-6 space-y-4 shadow-card text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("forgot_password.check_spam")}{" "}
                <button type="button" onClick={() => setIsSuccess(false)} className="text-primary font-medium hover:underline">
                  {t("forgot_password.try_again")}
                </button>
              </p>
              <Button onClick={() => navigate("/auth")} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium shadow-soft">
                {t("forgot_password.back_to_sign_in")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="glass rounded-2xl p-6 space-y-4 shadow-card">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.email_placeholder")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className={`h-12 rounded-xl ${error ? "border-destructive" : ""}`}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium shadow-soft" disabled={isLoading}>
                {isLoading ? t("forgot_password.sending") : t("forgot_password.send_reset_link")}
              </Button>
            </form>
          )}

          {!isSuccess && (
            <p className="text-center mt-6 text-muted-foreground">
              {t("forgot_password.remember_password")}{" "}
              <button type="button" onClick={() => navigate("/auth")} className="text-primary font-medium hover:underline">
                {t("auth.sign_in")}
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
