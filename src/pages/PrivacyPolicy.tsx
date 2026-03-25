import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 hover:bg-muted transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("privacy_policy.back_to_home")}
          </Button>
          <h1 className="text-4xl font-bold text-foreground">{t("privacy_policy.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("privacy_policy.last_updated")}</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("privacy_policy.introduction.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy_policy.introduction.content")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("privacy_policy.information_collection.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t("privacy_policy.information_collection.content")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{t("privacy_policy.information_collection.items.email")}</li>
                <li>{t("privacy_policy.information_collection.items.habit_data")}</li>
                <li>{t("privacy_policy.information_collection.items.analytics")}</li>
                <li>{t("privacy_policy.information_collection.items.device_info")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("privacy_policy.security.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy_policy.security.content")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("privacy_policy.changes.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy_policy.changes.content")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("privacy_policy.contact.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy_policy.contact.content")}{" "}
                <a href="mailto:inner.build07@gmail.com" className="text-primary hover:underline transition-colors">
                  inner.build07@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
