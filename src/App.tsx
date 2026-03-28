import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import PremiumRoute from "@/components/PremiumRoute";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Challenges from "./pages/Challenges";
import PornRecovery from "./pages/PornRecovery";
import Coach from "./pages/Coach";
import Pricing from "./pages/Pricing";
import DailyPlanning from "./pages/DailyPlanning";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import TriggerTracking from "./pages/TriggerTracking";
import Learn from "./pages/Learn";
import EveningReflection from "./pages/EveningReflection";
import Admin from "./pages/Admin";
import ChallengeJourney from "./pages/ChallengeJourney";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function LanguageSyncFromProfile() {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!user) return;

    const loadPreferredLanguage = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("preferred_language")
          .eq("user_id", user.id)
          .single();

        const lang = (data as any)?.preferred_language;
        if (lang && ["it", "en", "es", "de", "fr", "ru", "ro"].includes(lang)) {
          if (i18n.language !== lang) {
            i18n.changeLanguage(lang);
            localStorage.setItem("innerbloom-language", lang);
          }
        }
      } catch (e) {
        // Silently fail — localStorage/browser lang is the fallback
      }
    };

    loadPreferredLanguage();
  }, [user, i18n]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="innerbloom-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LanguageSyncFromProfile />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/habits" 
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <Habits />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/daily-planning" 
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <DailyPlanning />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/challenges" 
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <Challenges />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/explore" 
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <Explore />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/learn" 
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <Learn />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/evening-reflection" 
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <EveningReflection />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/coach" 
                element={
                  <PremiumRoute paywallReason="ai_coach">
                    <Coach />
                  </PremiumRoute>
                } 
              />
              <Route 
                path="/porn-recovery" 
                element={
                  <PremiumRoute paywallReason="recovery">
                    <PornRecovery />
                  </PremiumRoute>
                } 
              />
              <Route 
                path="/trigger-tracking" 
                element={
                  <PremiumRoute paywallReason="advanced_stats">
                    <TriggerTracking />
                  </PremiumRoute>
                } 
              />
              <Route 
                path="/challenges/:id" 
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <ChallengeJourney />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin"
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
