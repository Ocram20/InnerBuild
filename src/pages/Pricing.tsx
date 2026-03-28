import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Leaf, Check, ArrowLeft, Loader2, LogOut, Crown, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function Pricing() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { subscription, loading, createCheckout } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const freeFeatureKeys = ["habits", "challenges", "tracking", "quotes", "planning", "reflection", "profile", "whats_working", "progress"] as const;
  const premiumFeatureKeys = ["unlimited_habits", "unlimited_challenges", "ai_coach", "recovery", "trigger_tracking", "habit_adaptation", "learn", "priority"] as const;

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: t("pricing.welcome_premium"), description: t("pricing.subscription_active") });
      navigate("/dashboard", { replace: true });
    } else if (searchParams.get("canceled") === "true") {
      toast({ title: t("pricing.checkout_canceled"), description: t("pricing.checkout_canceled_desc") });
    }
  }, [searchParams, toast, navigate, t]);

  useEffect(() => {
    if (!loading && subscription.subscribed) navigate("/dashboard", { replace: true });
  }, [subscription.subscribed, loading, navigate]);

  const handleSubscribe = async () => {
    if (!user) { navigate("/auth"); return; }
    setCheckoutLoading(true);
    try { await createCheckout(); } catch (error) {
      toast({ title: t("common.error"), description: t("pricing.checkout_failed"), variant: "destructive" });
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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t("pricing.choose_plan")}</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("pricing.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="glass border-border/50 relative overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4 mx-auto">{t("pricing.free_plan")}</div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{t("pricing.free_price")}</span>
                  <span className="text-muted-foreground">{t("pricing.forever")}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{t("pricing.get_started_basics")}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  {freeFeatureKeys.map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0"><Check className="h-3 w-3 text-success" /></div>
                      <span className="text-foreground">{t(`pricing.free_features.${key}`)}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => navigate(user ? "/dashboard" : "/auth")} className="w-full h-12 rounded-xl font-medium">
                  {user ? t("pricing.current_plan") : t("pricing.get_started_free")}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass border-2 border-primary/30 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />{t("pricing.most_popular")}
                </div>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 mx-auto">
                  <Crown className="h-4 w-4" />{t("pricing.premium_plan")}
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{t("pricing.premium_price")}</span>
                  <span className="text-muted-foreground">{t("pricing.per_month")}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{t("pricing.unlock_potential")}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-3 text-center">{t("pricing.everything_in_free")}</p>
                <div className="space-y-3 mb-6">
                  {premiumFeatureKeys.map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0"><Check className="h-3 w-3 text-success" /></div>
                      <span className="text-foreground">{t(`pricing.premium_features.${key}`)}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSubscribe} disabled={checkoutLoading} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium shadow-soft transition-transform duration-100 active:scale-95">
                  {checkoutLoading ? (<><Loader2 className="h-5 w-5 animate-spin" /><span>{t("common.loading")}</span></>) : user ? t("pricing.subscribe_now") : t("pricing.get_premium")}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">{t("pricing.trust_badges")}</p>
            {!user && (
              <p className="text-sm text-muted-foreground">
                {t("pricing.have_account")}{" "}
                <button onClick={() => navigate("/auth")} className="text-primary font-medium hover:underline">{t("auth.sign_in")}</button>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
