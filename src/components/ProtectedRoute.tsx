import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
}

// Emails that always have access
const ALLOWED_EMAILS = ["inner.build07@gmail.com"];

export default function ProtectedRoute({ children, requireSubscription = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  // Check if user email is in allowed list (sync)
  const isAllowedEmail = !!(user?.email && ALLOWED_EMAILS.includes(user.email));

  // Subscription check is only needed when subscription is required and user has no bypass.
  // Also wait until we actually have a user (avoids firing checks during the auth bootstrap).
  const { subscription, loading: subLoading } = useSubscription({
    enabled: !!user && requireSubscription && !isAllowedEmail && !hasAdminRole,
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

  // User has bypass access if admin role or allowed email
  const hasBypassAccess = hasAdminRole || isAllowedEmail;

  // Show loading state
  const isLoading = authLoading || roleLoading || (requireSubscription && !hasBypassAccess && subLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Allow access if user has bypass (admin or allowed email)
  if (hasBypassAccess) {
    return <>{children}</>;
  }

  // Redirect to paywall if subscription required but not subscribed
  if (requireSubscription && !subscription.subscribed) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}
