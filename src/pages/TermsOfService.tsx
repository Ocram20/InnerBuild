import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function TermsOfService() {
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
            {t("terms_of_service.back_to_home")}
          </Button>
          <h1 className="text-4xl font-bold text-foreground">{t("terms_of_service.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("terms_of_service.last_updated")}</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("terms_of_service.acceptance.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms_of_service.acceptance.content")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("terms_of_service.use_license.title")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t("terms_of_service.use_license.content")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{t("terms_of_service.use_license.items.modify")}</li>
                <li>{t("terms_of_service.use_license.items.commercial")}</li>
                <li>{t("terms_of_service.use_license.items.decompile")}</li>
                <li>{t("terms_of_service.use_license.items.remove_notices")}</li>
                <li>{t("terms_of_service.use_license.items.transfer")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("terms_of_service.disclaimer.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms_of_service.disclaimer.content")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("terms_of_service.limitations.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms_of_service.limitations.content")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("terms_of_service.accuracy.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms_of_service.accuracy.content")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("terms_of_service.contact.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms_of_service.contact.content")}{" "}
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
