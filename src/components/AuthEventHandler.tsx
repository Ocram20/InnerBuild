import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * AuthEventHandler — renders nothing, lives inside BrowserRouter.
 *
 * Listens globally for Supabase auth events so that even if the password
 * recovery email redirects to the site root (because the redirect URL is not
 * in the Supabase allowlist, or the Site URL overrides it), the app will
 * still catch the PASSWORD_RECOVERY event and send the user to /reset-password.
 */
export default function AuthEventHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Only redirect if we are not already on the reset-password page
        if (location.pathname !== "/reset-password") {
          navigate("/reset-password", { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
