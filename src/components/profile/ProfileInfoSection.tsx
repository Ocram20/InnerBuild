import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Camera, Save, Loader2, User, Clock, Mail, Lock, Eye, EyeOff, Trash2, Check, X, ShieldAlert } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { translateAuthError } from "@/lib/authErrorTranslator";

interface ProfileData {
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string;
  email: string;
  username_changed_at?: string | null;
}

interface ProfileInfoSectionProps {
  profile: ProfileData | null;
  onProfileUpdate: () => void;
}

export function ProfileInfoSection({ profile, onProfileUpdate }: ProfileInfoSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect if user account is associated with Google or another OAuth provider
  const providers: string[] = user?.app_metadata?.providers || (user?.app_metadata?.provider ? [user.app_metadata.provider] : []);
  const identitiesProviders = user?.identities?.map((id: any) => id.provider) || [];
  const allProviders = Array.from(new Set([...providers, ...identitiesProviders]));
  const isGoogleUser = allProviders.includes("google");
  const isOAuthUser = isGoogleUser || (allProviders.length > 0 && !allProviders.every((p) => p === "email"));
  const authProviderName = isGoogleUser ? "Google" : (allProviders.find((p) => p !== "email") || "Google");

  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [originalUsername, setOriginalUsername] = useState(profile?.username || "");
  const [originalEmail, setOriginalEmail] = useState(user?.email || "");
  const [emailSaving, setEmailSaving] = useState(false);
  const [originalData, setOriginalData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    username: profile?.username || "",
  });
  const [usernameChangedAt, setUsernameChangedAt] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileData>({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    username: profile?.username || "",
    avatar_url: profile?.avatar_url || "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (profile) {
      const newData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
        avatar_url: profile.avatar_url || "",
        email: user?.email || "",
      };
      setFormData(newData);
      setOriginalUsername(profile.username || "");
      setOriginalEmail(user?.email || "");
      setOriginalData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
      });
    }
  }, [profile, user?.email]);

  useEffect(() => {
    const fetchUsernameChangedAt = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("username_changed_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.username_changed_at) {
        setUsernameChangedAt(data.username_changed_at);
      }
    };
    fetchUsernameChangedAt();
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: t("common.error"),
        description: t("profile.avatar_invalid_type"),
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("common.error"),
        description: t("profile.avatar_too_large"),
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));
      onProfileUpdate();

      toast({
        title: t("profile.avatar_updated"),
        description: t("profile.avatar_updated_desc"),
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: t("profile.avatar_upload_failed"),
        description: error.message || t("profile.avatar_upload_failed"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setUploading(true);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setFormData((prev) => ({ ...prev, avatar_url: "" }));
      onProfileUpdate();

      toast({
        title: t("profile.avatar_removed"),
        description: t("profile.avatar_removed_desc"),
      });
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      toast({
        title: t("common.error"),
        description: error.message || t("profile.failed_save"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getUsernameChangeCooldown = (): { canChange: boolean; daysRemaining: number } => {
    if (!usernameChangedAt) {
      return { canChange: true, daysRemaining: 0 };
    }

    const lastChanged = new Date(usernameChangedAt);
    const daysSinceChange = differenceInDays(new Date(), lastChanged);
    const daysRemaining = Math.max(0, 7 - daysSinceChange);

    return {
      canChange: daysSinceChange >= 7,
      daysRemaining,
    };
  };

  const isUsernameChanged = formData.username !== originalUsername;
  const hasChanges =
    formData.first_name !== originalData.first_name ||
    formData.last_name !== originalData.last_name ||
    formData.username !== originalData.username;
  const { canChange: canChangeUsername, daysRemaining } = getUsernameChangeCooldown();
  const canSave = hasChanges && (!isUsernameChanged || canChangeUsername);

  const handleSave = async () => {
    if (!user) return;

    if (isUsernameChanged && !canChangeUsername) {
      toast({
        title: t("profile.username_change_limited_title"),
        description: t("profile.username_cooldown_days", { days: daysRemaining }),
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updateData: Record<string, any> = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        username: formData.username || null,
      };

      // If username is being changed, update the timestamp
      if (isUsernameChanged && formData.username) {
        updateData.username_changed_at = new Date().toISOString();
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("user_id", user.id);

      if (error) {
        if (error.code === "23505") {
          throw new Error("USERNAME_TAKEN");
        }
        throw error;
      }

      if (isUsernameChanged) {
        setUsernameChangedAt(new Date().toISOString());
        setOriginalUsername(formData.username);
      }

      // Update original data to reflect saved state
      setOriginalData({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
      });

      onProfileUpdate();
      toast({
        title: t("profile.profile_updated"),
        description: t("profile.profile_updated_desc"),
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      const desc =
        error.message === "USERNAME_TAKEN" ? t("profile.username_taken") : error.message || t("profile.failed_save");
      toast({
        title: t("profile.failed_save"),
        description: desc,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async () => {
    if (!formData.email || formData.email === originalEmail) return;
    setEmailSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: formData.email,
      });
      if (error) throw error;
      toast({
        title: t("profile.email_confirmation_sent_title", { defaultValue: "Richiesta inviata (0/2 conferme)" }),
        description: t("profile.email_confirmation_sent_desc", { defaultValue: "Per completare il cambio, clicca sul link inviato sia alla tua email attuale che a quella nuova (2/2 conferme richieste). I link scadono dopo 24 ore." }),
      });
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: t("profile.email_update_failed", { defaultValue: "Aggiornamento email fallito" }),
        description: translateAuthError(error.message, t),
        variant: "destructive",
      });
    } finally {
      setEmailSaving(false);
    }
  };

  const passwordRequirements = [
    { label: t("auth_validation.min_8_chars", { defaultValue: "Almeno 8 caratteri" }), met: newPassword.length >= 8 },
    { label: t("auth_validation.one_number", { defaultValue: "Almeno un numero" }), met: /\d/.test(newPassword) },
    { label: t("auth_validation.one_upper", { defaultValue: "Almeno una lettera maiuscola" }), met: /[A-Z]/.test(newPassword) },
    { label: t("auth_validation.one_lower", { defaultValue: "Almeno una lettera minuscola" }), met: /[a-z]/.test(newPassword) },
  ];

  const allPasswordReqsMet = passwordRequirements.every((r) => r.met);
  const isSamePassword = newPassword.length > 0 && currentPassword.length > 0 && newPassword === currentPassword;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      toast({
        title: t("profile.password_update_failed", { defaultValue: "Aggiornamento non riuscito" }),
        description: t("auth_errors.current_password_required", { defaultValue: "Inserisci la tua password attuale per continuare." }),
        variant: "destructive",
      });
      return;
    }
    if (isSamePassword) {
      toast({
        title: t("profile.password_update_failed", { defaultValue: "Aggiornamento non riuscito" }),
        description: t("auth_errors.same_password", { defaultValue: "La nuova password deve essere diversa da quella attuale." }),
        variant: "destructive",
      });
      return;
    }
    if (!allPasswordReqsMet) {
      toast({
        title: t("profile.password_update_failed", { defaultValue: "Aggiornamento non riuscito" }),
        description: t("auth_validation.password_complexity", { defaultValue: "La nuova password non soddisfa tutti i requisiti di sicurezza." }),
        variant: "destructive",
      });
      return;
    }
    if (!passwordsMatch) {
      toast({
        title: t("profile.password_mismatch_title"),
        description: t("profile.password_mismatch_desc"),
        variant: "destructive",
      });
      return;
    }

    setPasswordSaving(true);
    try {
      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });
      if (signInError) {
        toast({
          title: t("profile.wrong_password_title"),
          description: t("profile.wrong_password_desc"),
          variant: "destructive",
        });
        return;
      }

      // Pass both new password and current_password to satisfy Supabase security setting
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        current_password: currentPassword,
      } as any);
      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: t("profile.password_updated_title"),
        description: t("profile.password_updated_desc"),
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: t("profile.password_update_failed"),
        description: translateAuthError(error.message, t),
        variant: "destructive",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const getInitials = () => {
    if (formData.first_name && formData.last_name) {
      return `${formData.first_name[0]}${formData.last_name[0]}`.toUpperCase();
    }
    return formData.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          {t("profile.profile_info")}
        </CardTitle>
        <CardDescription>{t("profile.profile_info_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={formData.avatar_url} alt={t("profile.avatar_alt")} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 flex gap-1">
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
                title={t("profile.upload_photo")}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              {formData.avatar_url && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                  className="p-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
                  title={t("profile.remove_photo")}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("profile.upload_photo")}
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 sm:grid-cols-2 notranslate" translate="no">
          <div className="space-y-2">
            <Label htmlFor="first_name">{t("profile.first_name")}</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              placeholder={t("profile.first_name_placeholder")}
              className="notranslate"
              translate="no"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">{t("profile.last_name")}</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              placeholder={t("profile.last_name_placeholder")}
              className="notranslate"
              translate="no"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2">
            {t("profile.username")}
            {isUsernameChanged && !canChangeUsername && (
              <span className="flex items-center gap-1 text-xs text-amber-500 font-normal">
                <Clock className="h-3 w-3" />
                {t("profile.username_cooldown")}
              </span>
            )}
          </Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            placeholder={t("profile.username_placeholder")}
            className="notranslate"
            translate="no"
          />
          {isUsernameChanged && !canChangeUsername && (
            <p className="text-xs text-amber-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {`Puoi cambiare il tuo username di nuovo tra ${daysRemaining} giorni.`}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            {t("profile.email")}
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            {isOAuthUser && (
              <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                Account {authProviderName}
              </span>
            )}
          </Label>
          {isOAuthUser ? (
            <div className="space-y-2">
              <Input id="email" type="email" value={formData.email} disabled className="flex-1 opacity-60 bg-muted/40 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                {t("profile.oauth_email_locked", {
                  defaultValue: `L'email è gestita direttamente dal tuo account ${authProviderName} e non può essere modificata da qui.`,
                  provider: authProviderName,
                })}
              </p>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("auth.email_placeholder")}
                  className="flex-1 notranslate"
                  translate="no"
                />
                {formData.email !== originalEmail && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEmailChange}
                    disabled={emailSaving || !formData.email}
                    className="shrink-0"
                  >
                    {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("profile.email_update_button", { defaultValue: "Aggiorna email" })}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("profile.email_confirm_hint", {
                  defaultValue: "Per sicurezza verrà inviata un'email sia al tuo indirizzo attuale che a quello nuovo. Clicca sui link in entrambe le email per completare il cambio (2/2 conferme). I link scadono dopo 24 ore.",
                })}
              </p>
            </>
          )}
        </div>

        {/* Change Password Section */}
        {isOAuthUser ? (
          <div className="space-y-2 border-t border-border/30 pt-4">
            <Label className="flex items-center gap-2 text-sm font-semibold opacity-60">
              <Lock className="h-4 w-4 text-muted-foreground" />
              {t("profile.change_password", { defaultValue: "Modifica Password" })}
            </Label>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                L'accesso a questo account è gestito tramite <strong>{authProviderName}</strong>. La modifica della password è disabilitata.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 border-t border-border/30 pt-4">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Lock className="h-4 w-4 text-primary" />
              {t("profile.change_password", { defaultValue: "Modifica Password" })}
            </Label>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="currentPassword" className="text-xs text-muted-foreground">
                  Password attuale
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t("profile.current_password_placeholder", { defaultValue: "Inserisci password attuale" })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="newPassword" className="text-xs text-muted-foreground">
                  Nuova password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("profile.new_password_placeholder", { defaultValue: "Inserisci nuova password" })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Requirements Checklist */}
                {newPassword.length > 0 && (
                  <div className="space-y-1.5 mt-2.5 px-1">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                            req.met ? "bg-emerald-500" : "bg-muted-foreground/20"
                          )}
                        >
                          {req.met ? (
                            <Check className="h-2 w-2 text-white" />
                          ) : (
                            <X className="h-2 w-2 text-muted-foreground" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs transition-colors duration-300",
                            req.met ? "text-emerald-500 font-medium" : "text-muted-foreground"
                          )}
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {isSamePassword && (
                  <p className="text-xs text-amber-500 mt-1">
                    La nuova password deve essere diversa da quella attuale.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmNewPassword" className="text-xs text-muted-foreground">
                  Conferma nuova password
                </Label>
                <Input
                  id="confirmNewPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("profile.confirm_password_placeholder", { defaultValue: "Ripeti la nuova password" })}
                  className={cn(confirmPassword && !passwordsMatch && "border-destructive")}
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive mt-1">
                    Le password non coincidono
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-2"
              disabled={
                passwordSaving ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                !allPasswordReqsMet ||
                !passwordsMatch ||
                isSamePassword
              }
              onClick={handlePasswordChange}
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("profile.updating", { defaultValue: "Aggiornamento in corso..." })}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  {t("profile.update_password", { defaultValue: "Aggiorna password" })}
                </>
              )}
            </Button>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving || !canSave} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("profile.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t("profile.save_changes")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
