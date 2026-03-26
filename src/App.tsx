import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import PremiumRoute from "@/components/PremiumRoute";
import { Analytics } from "@vercel/analytics/react";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="innerbloom-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            {/* Free tier accessible pages (with limits enforced in components) */}
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
            {/* Premium-only pages */}
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
    <Analytics />
  </QueryClientProvider>
);

export default App;
