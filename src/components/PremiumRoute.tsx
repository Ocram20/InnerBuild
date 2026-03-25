import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import PaywallModal from "@/components/PaywallModal";

type PaywallReason = "ai_coach" | "recovery" | "advanced_stats" | "general";

interface PremiumRouteProps {
  children: ReactNode;
  paywallReason?: PaywallReason;
  fallbackPath?: string;
}

// Emails that always have access
const ALLOWED_EMAILS = ["inner.build07@gmail.com"];

export default function PremiumRoute({ 
  children, 
  paywallReason = "general",
  fallbackPath = "/dashboard"
}: PremiumRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  const isAllowedEmail = !!(user?.email && ALLOWED_EMAILS.includes(user.email));

  const { subscription, loading: subLoading } = useSubscription({
    enabled: !!user && !isAllowedEmail && !hasAdminRole,
  });

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setRoleLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (!error && data) {
          setHasAdminRole(true);
        }
      } catch (err) {
        console.error("Error checking admin role:", err);
      } finally {
        setRoleLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const hasBypassAccess = hasAdminRole || isAllowedEmail;
  const isPremium = hasBypassAccess || subscription.subscribed;
  const isLoading = authLoading || roleLoading || (!hasBypassAccess && subLoading);

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
