import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import PaywallModal from "@/components/PaywallModal";

type PaywallReason = "ai_coach" | "recovery" | "advanced_stats" | "general";

interface PremiumRouteProps {
  children: ReactNode;
  paywallReason?: PaywallReason;
  fallbackPath?: string;
}

export default function PremiumRoute({ 
  children, 
  paywallReason = "general",
  fallbackPath = "/dashboard"
}: PremiumRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasAdminRole, loading: roleLoading } = useAdminAccess();
  const [showPaywall, setShowPaywall] = useState(false);

  const { subscription, loading: subLoading } = useSubscription({
    enabled: !!user && !hasAdminRole,
  });

  const isPremium = hasAdminRole || subscription.subscribed;
  const isLoading = authLoading || roleLoading || (!hasAdminRole && subLoading);

  // Show paywall when loaded and not premium
  useEffect(() => {
    if (!isLoading && user && !isPremium) {
      setShowPaywall(true);
    }
  }, [isLoading, user, isPremium]);

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading only briefly
  if (isLoading) {
    return null;
  }

  // If premium, show content
  if (isPremium) {
    return <>{children}</>;
  }

  // Show paywall modal over fallback redirect
  return (
    <>
      <Navigate to={fallbackPath} replace />
      <PaywallModal 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        reason={paywallReason}
      />
    </>
  );
}
