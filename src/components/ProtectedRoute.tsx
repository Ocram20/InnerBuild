import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({ children, requireSubscription = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasAdminRole, loading: roleLoading } = useAdminAccess();

  // Subscription check is only needed when subscription is required and user has no bypass.
  const { subscription, loading: subLoading } = useSubscription({
    enabled: !!user && requireSubscription && !hasAdminRole,
  });

  // Show loading state
  const isLoading = authLoading || roleLoading || (requireSubscription && !hasAdminRole && subLoading);

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

  if (hasAdminRole) {
    return <>{children}</>;
  }

  // Redirect to paywall if subscription required but not subscribed
  if (requireSubscription && !subscription.subscribed) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}
