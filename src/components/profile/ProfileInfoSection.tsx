import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Camera, Save, Loader2, User, Clock, Mail } from "lucide-react";
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: t("profile_info_section.invalid_file_type"),
        description: t("profile_info_section.upload_image_file"),
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("profile_info_section.file_too_large"),
        description: t("profile_info_section.file_size_limit"),
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
      onProfileUpdate();
      
      toast({
        title: t("profile_info_section.avatar_updated"),
        description: t("profile_info_section.avatar_updated_desc"),
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: t("profile_info_section.upload_failed"),
        description: error.message || t("profile_info_section.upload_failed_desc"),
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
        title: t("profile_info_section.username_restricted"),
        description: t("profile_info_section.username_cooldown_msg", { days: daysRemaining }),
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

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

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
        title: t("profile_info_section.profile_updated"),
        description: t("profile_info_section.profile_saved"),
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: t("profile_info_section.save_failed"),
        description: error.message || t("profile_info_section.save_failed_desc"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
          {t("profile_info_section.title")}
        </CardTitle>
        <CardDescription>
          {t("profile_info_section.manage_info_desc", "Manage your personal information and profile picture")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage 
                src={formData.avatar_url} 
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("profile_info_section.upload_hint", "Click the camera icon to upload a new photo")}
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">{t("profile_info_section.first_name")}</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              placeholder={t("profile_info_section.first_name_placeholder", "Enter your first name")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">{t("profile_info_section.last_name")}</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              placeholder={t("profile_info_section.last_name_placeholder", "Enter your last name")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2">
            {t("profile_info_section.username")}
            {isUsernameChanged && !canChangeUsername && (
              <span className="flex items-center gap-1 text-xs text-amber-500 font-normal">
                <Clock className="h-3 w-3" />
                {t("profile_info_section.cooldown_active")}
              </span>
            )}
          </Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            placeholder={t("profile_info_section.username_placeholder")}
          />
          {isUsernameChanged && !canChangeUsername && (
            <p className="text-xs text-amber-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t("profile_info_section.username_cooldown_msg", { days: daysRemaining })}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            {t("profile_info_section.email_label")}
            <Mail className="h-3 w-3 text-muted-foreground" />
          </Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder={t("profile_info_section.email_placeholder", "Enter your email")}
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
                {emailSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("profile_info_section.update_email", "Update")
                )}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("profile_info_section.email_change_hint", "A confirmation link will be sent to the new email address")}
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving || !canSave} 
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t("profile_info_section.save")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
