import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, ArrowLeft, Eye, EyeOff, AlertCircle, Check, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { translateAuthError } from "@/lib/authErrorTranslator";

export default function ResetPassword() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // 1. If redirected from AuthCallback with recovery state
    if (location.state?.isRecovery) {
      setIsValidSession(true);
      return;
    }

    // 2. Listen to auth state events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setIsValidSession(true);
      } else if (event === "SIGNED_OUT") {
        setIsValidSession(false);
      }
    });

    // 3. Check for recovery code in URL or active session
    const queryParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasRecoveryToken =
      queryParams.has("code") ||
      (hashParams.get("access_token") && hashParams.get("type") === "recovery");

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session || hasRecoveryToken) {
        setIsValidSession(true);
      } else {
        const timeout = setTimeout(() => {
          setIsValidSession((prev) => (prev === null ? false : prev));
        }, 1500);
        return () => clearTimeout(timeout);
      }
    });

    return () => subscription.unsubscribe();
  }, [location.state]);

  const passwordRequirements = [
    { label: t("auth_validation.min_8_chars", { defaultValue: "Almeno 8 caratteri" }), met: password.length >= 8 },
    { label: t("auth_validation.one_number", { defaultValue: "Almeno un numero" }), met: /\d/.test(password) },
    { label: t("auth_validation.one_upper", { defaultValue: "Almeno una lettera maiuscola" }), met: /[A-Z]/.test(password) },
    { label: t("auth_validation.one_lower", { defaultValue: "Almeno una lettera minuscola" }), met: /[a-z]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every((r) => r.met);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRequirementsMet) {
      toast({
        title: t("common.error"),
        description: t("auth_validation.password_complexity", { defaultValue: "La password non soddisfa tutti i requisiti." }),
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: t("common.error"),
        description: t("reset_password.passwords_do_not_match", { defaultValue: "Le password non coincidono." }),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({
          title: t("reset_password.failed_title", { defaultValue: "Reset password fallito" }),
          description: translateAuthError(error.message, t),
          variant: "destructive",
        });
      } else {
        // Sign out after password reset
        await supabase.auth.signOut();
        
        toast({
          title: t("reset_password.success_title", { defaultValue: "Password aggiornata" }),
          description: t("reset_password.success_desc", { defaultValue: "La tua password è stata reimpostata. Accedi con la nuova password." }),
        });
        navigate("/auth");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Invalid or expired link
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("reset_password.back_to_login", { defaultValue: "Torna all'accesso" })}
          </Button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 pb-8">
          <div className="w-full max-w-md text-center animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("reset_password.invalid_link_title", { defaultValue: "Link non valido o scaduto" })}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("reset_password.invalid_link_desc", { defaultValue: "Questo link per la reimpostazione della password non è valido o è scaduto. Per favore richiedine uno nuovo." })}
            </p>
            <Button
              onClick={() => navigate("/forgot-password")}
              className="gradient-primary text-primary-foreground font-medium shadow-soft"
            >
              {t("reset_password.request_new_link", { defaultValue: "Richiedi nuovo link" })}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/auth")}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("reset_password.back_to_login", { defaultValue: "Torna all'accesso" })}
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 pb-8">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("reset_password.create_new_password", { defaultValue: "Crea nuova password" })}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("reset_password.description", { defaultValue: "Inserisci la tua nuova password qui sotto." })}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="glass rounded-2xl p-6 space-y-4 shadow-card">
              <div className="space-y-2">
                <Label htmlFor="password">{t("reset_password.new_password", { defaultValue: "Nuova password" })}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Live Requirements Checklist */}
                <div className="space-y-2 mt-3 px-1">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                          req.met ? "bg-emerald-500" : "bg-muted-foreground/20"
                        )}
                      >
                        {req.met ? (
                          <Check className="h-2.5 w-2.5 text-white" />
                        ) : (
                          <X className="h-2.5 w-2.5 text-muted-foreground" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs transition-colors duration-300",
                          req.met ? "text-emerald-500 font-medium" : "text-muted-foreground"
                        )}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="confirmPassword">{t("reset_password.confirm_new_password", { defaultValue: "Conferma nuova password" })}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "h-12 rounded-xl pr-12",
                      confirmPassword && !passwordsMatch && "border-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive mt-1">
                    {t("reset_password.passwords_do_not_match", { defaultValue: "Le password non coincidono" })}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium shadow-soft"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch}
            >
              {isLoading ? t("reset_password.updating", { defaultValue: "Aggiornamento in corso..." }) : t("reset_password.submit_button", { defaultValue: "Reimposta password" })}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
