/**
 * Translates raw Supabase Auth English error strings into localized, user-friendly messages.
 */
export function translateAuthError(
  message: string | undefined | null,
  t: (key: string, options?: any) => string
): string {
  if (!message) return t("common.error", { defaultValue: "Si è verificato un errore." });
  const lower = message.toLowerCase();

  if (
    lower.includes("already been registered") ||
    lower.includes("already registered") ||
    lower.includes("email_exists") ||
    lower.includes("user already exists")
  ) {
    return t("auth_errors.email_already_registered", {
      defaultValue: "Un utente con questo indirizzo email è già registrato.",
    });
  }

  if (lower.includes("current password required")) {
    return t("auth_errors.current_password_required", {
      defaultValue: "È necessaria la password attuale per impostare una nuova password.",
    });
  }

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid_credentials") ||
    lower.includes("invalid grant")
  ) {
    return t("auth_errors.invalid_credentials", {
      defaultValue: "Credenziali non valide. Verifica email e password.",
    });
  }

  if (lower.includes("password should be at least")) {
    return t("auth_errors.password_too_short", {
      defaultValue: "La password deve contenere almeno 6 caratteri.",
    });
  }

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return t("auth_errors.rate_limit", {
      defaultValue: "Troppe richieste in poco tempo. Riprova tra qualche minuto.",
    });
  }

  if (
    lower.includes("token has expired") ||
    lower.includes("otp_expired") ||
    lower.includes("invalid or expired") ||
    lower.includes("expired")
  ) {
    return t("auth_errors.token_expired", {
      defaultValue: "Il link è scaduto o non è valido. Richiedine uno nuovo.",
    });
  }

  return message;
}
