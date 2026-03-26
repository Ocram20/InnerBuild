import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Mail, Instagram } from "lucide-react";
export default function LandingFooter() {
  const currentYear = new Date().getFullYear();
  const footerLinks = [
    { label: "Informativa Privacy", href: "/privacy-policy" },
    { label: "Termini di Servizio", href: "/terms-of-service" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/inner.build/", label: "Instagram", color: "hover:text-pink-600 dark:hover:text-pink-400" },
    {
      icon: () => (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.67a2.4 2.4 0 0 1-2.4 2.4 2.4 2.4 0 0 1-2.4-2.4 2.4 2.4 0 0 1 2.4-2.4c.34 0 .67.05.98.15V9.48a5.9 5.9 0 0 0-.98-.08 5.9 5.9 0 0 0-5.9 5.9 5.9 5.9 0 0 0 5.9 5.9 5.9 5.9 0 0 0 5.9-5.9v-2.07a7.15 7.15 0 0 0 4.04 1.26v-3.64a4.48 4.48 0 0 1-.63-.05z"/>
        </svg>
      ),
      href: "https://www.tiktok.com/@_inner.build_", label: "TikTok", color: "hover:text-black dark:hover:text-white",
    },
  ];

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft"><Leaf className="h-5 w-5 text-primary-foreground" /></div>
              <span className="font-bold text-lg text-foreground">InnerBuild</span>
            </div>
            <p className="text-sm text-muted-foreground">{"Trasforma la tua vita con abitudini basate sulla scienza e il potere del recovery."}</p>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-semibold text-foreground mb-4">{"Legale"}</h3>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link key={link.href} to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 hover:underline">{link.label}</Link>
              ))}
            </nav>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-semibold text-foreground mb-4">{"Supporto"}</h3>
            <a href="mailto:inner.build07@gmail.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-2 hover:gap-3 group">
              <Mail className="h-4 w-4" /><span>inner.build07@gmail.com</span>
            </a>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-semibold text-foreground mb-4">{"Seguici"}</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                    className={`p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground ${social.color} transition-all duration-300 hover:scale-110 active:scale-95`}>
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-px bg-border/50 my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{`© ${currentYear} InnerBuild. Tutti i diritti riservati. Costruito con amore per la tua crescita <3.`}</p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              <a href="#top">{"Torna su"}</a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
