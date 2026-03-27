import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Camera, Save, Loader2, User, Clock, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { differenceInDays } from "date-fns";

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
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect if user logged in via OAuth provider
  const authProvider = user?.app_metadata?.provider;
  const isOAuthUser = authProvider && authProvider !== "email";
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
        title: "Tipo di file non valido",
        description: "Per favore carica un'immagine.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "Per favore carica un'immagine inferiore a 5MB.",
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
        title: "Avatar aggiornato",
        description: "La tua immagine del profilo è stata aggiornata.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Caricamento fallito",
        description: error.message || "Impossibile caricare l'avatar.",
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
        title: "Cambio username limitato",
        description: `Puoi cambiare il tuo username di nuovo tra ${daysRemaining} giorni.`,
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
          throw new Error("This username is already taken. Please choose another.");
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
        title: "Profilo aggiornato",
        description: "Le tue informazioni del profilo sono state salvate.",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Salvataggio fallito",
        description: error.message || "Impossibile salvare il profilo.",
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
        title: "Conferma inviata",
        description: "Controlla la tua email attuale per confermare il cambio di indirizzo.",
      });
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "Email update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Le password non corrispondono",
        description: "La nuova password e la conferma devono essere uguali.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Password troppo corta",
        description: "La password deve essere di almeno 6 caratteri.",
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
          title: "Password attuale errata",
          description: "La password attuale inserita non è corretta.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password aggiornata",
        description: "La tua password è stata modificata con successo.",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Aggiornamento fallito",
        description: error.message || "Impossibile aggiornare la password.",
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
          {"Informazioni profilo"}
        </CardTitle>
        <CardDescription>{"Gestisci le tue informazioni personali e l'immagine del profilo"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={formData.avatar_url} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
          <p className="text-sm text-muted-foreground">
            {"Clicca sull'icona della fotocamera per caricare una nuova foto"}
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 sm:grid-cols-2 notranslate" translate="no">
          <div className="space-y-2">
            <Label htmlFor="first_name">{"Nome"}</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              placeholder={"Inserisci il tuo nome"}
              className="notranslate"
              translate="no"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">{"Cognome"}</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              placeholder={"Inserisci il tuo cognome"}
              className="notranslate"
              translate="no"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2">
            {"Username"}
            {isUsernameChanged && !canChangeUsername && (
              <span className="flex items-center gap-1 text-xs text-amber-500 font-normal">
                <Clock className="h-3 w-3" />
                {"Cooldown attivo"}
              </span>
            )}
          </Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            placeholder={"Scegli un username unico"}
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
            {"Indirizzo Email"}
            <Mail className="h-3 w-3 text-muted-foreground" />
            {isOAuthUser && (
              <span className="text-xs text-muted-foreground font-normal">
                ({authProvider === "google" ? "Google" : authProvider})
              </span>
            )}
          </Label>
          {isOAuthUser ? (
            <div className="space-y-2">
              <Input id="email" type="email" value={formData.email} disabled className="flex-1 opacity-60" />
              <p className="text-xs text-muted-foreground">
                {"L'email non può essere modificata perché hai effettuato l'accesso tramite "}
                {authProvider === "google" ? "Google" : authProvider}
                {". Per cambiare email, modifica l'indirizzo nel tuo account "}
                {authProvider === "google" ? "Google" : authProvider}
                {"."}
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
                  placeholder={"Enter your email"}
                  className="flex-1"
                />
                {formData.email !== originalEmail && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEmailChange}
                    disabled={emailSaving || !formData.email}
                    className="shrink-0"
                  >
                    {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aggiorna"}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {"Un link di conferma verrà inviato alla tua nuova email"}
              </p>
            </>
          )}
        </div>

        {/* Change Password Section - only for email/password users */}
        {!isOAuthUser && (
          <div className="space-y-3 border-t border-border/30 pt-4">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Lock className="h-4 w-4 text-primary" />
              {"Modifica Password"}
            </Label>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Password attuale"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nuova password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                type={showNewPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Conferma nuova password"
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
              onClick={handlePasswordChange}
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {"Aggiornamento..."}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  {"Aggiorna Password"}
                </>
              )}
            </Button>
          </div>
        )}
        <Button onClick={handleSave} disabled={saving || !canSave} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {"Salvataggio..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {"Salva Modifiche"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
