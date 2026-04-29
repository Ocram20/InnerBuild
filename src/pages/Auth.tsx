import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Eye, EyeOff, ArrowLeft, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import LanguageSelector from "@/components/LanguageSelector";

export default function Auth() {
  const { t } = useTranslation();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    if (mode === "signup") {
      setIsLogin(false);
    }
  }, [location.search]);

  const validateForm = () => {
    const emailSchema = z.string().email(t("auth_validation.invalid_email"));
    const passwordSchema = z.string().min(6, t("auth_validation.password_min"));
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: t("auth.login_failed"),
              description: t("auth.invalid_credentials"),
              variant: "destructive",
            });
          } else if (error.message.includes("Email not confirmed")) {
            toast({
              title: t("auth.email_not_verified_title"),
              description: t("auth.email_not_verified_desc"),
              variant: "destructive",
            });
          } else {
            toast({ title: t("auth.login_failed"), description: error.message, variant: "destructive" });
          }
        } else {
          navigate("/dashboard");
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: t("auth.account_exists"),
              description: t("auth.email_already_registered"),
              variant: "destructive",
            });
            setIsLogin(true);
          } else if (error.message.includes("Password should contain")) {
            setErrors({ password: t("auth_validation.password_complexity") });
          } else {
            toast({ title: t("auth.signup_failed"), description: error.message, variant: "destructive" });
          }
        } else {
          toast({
            title: t("auth.welcome_innerbuild"),
            description: t("auth.verify_email_desc"),
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) {
        toast({ title: t("auth.google_signin_failed"), description: error.message, variant: "destructive" });
        setIsGoogleLoading(false);
      }
    } catch {
      toast({ title: t("auth.google_signin_failed"), description: t("auth.unexpected_error"), variant: "destructive" });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <LanguageSelector />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 pb-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? t("auth.welcome_back") : t("auth.start_journey")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? t("auth.sign_in_continue") : t("auth.create_account_begin")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="glass rounded-2xl p-6 space-y-4 shadow-card">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("auth.full_name")}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t("auth.your_name")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.email_placeholder")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`h-12 rounded-xl ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  {isLogin && (
                    <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm text-primary hover:underline">
                      {t("auth.forgot_password")}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`h-12 rounded-xl pr-12 ${errors.password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 mt-2">
                    <p className="text-sm text-destructive font-medium">{errors.password}</p>
                  </div>
                )}
                {!isLogin && (
                  <div className="space-y-2 mt-3 px-1">
                    {[
                      { label: t("auth_validation.min_8_chars"), met: password.length >= 8 },
                      { label: t("auth_validation.one_number"), met: /\d/.test(password) },
                      { label: t("auth_validation.one_upper"), met: /[A-Z]/.test(password) },
                      { label: t("auth_validation.one_lower"), met: /[a-z]/.test(password) },
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                          req.met ? "bg-emerald-500" : "bg-muted-foreground/20"
                        )}>
                          {req.met ? (
                            <Check className="h-2.5 w-2.5 text-white" />
                          ) : (
                            <X className="h-2.5 w-2.5 text-muted-foreground" />
                          )}
                        </div>
                        <span className={cn(
                          "text-xs transition-colors duration-300",
                          req.met ? "text-emerald-500" : "text-muted-foreground"
                        )}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium shadow-soft"
              disabled={isLoading || isGoogleLoading || (!isLogin && !(password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password) && /[a-z]/.test(password)))}
            >
              {isLoading ? t("common.please_wait") : isLogin ? t("auth.sign_in") : t("auth.create_account")}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">{t("common.or")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="w-full h-12 rounded-xl font-medium gap-3"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t("common.connecting")}</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{t("auth.continue_google")}</span>
              </>
            )}
          </Button>

          <p className="text-center mt-6 text-muted-foreground">
            {isLogin ? t("auth.no_account") : t("auth.have_account")}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? t("auth.sign_up") : t("auth.sign_in")}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
