import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Newspaper, Search, Mail, TrendingUp } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  const { t } = useTranslation();
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">{t('landing.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button onClick={handleLogin} data-testid="button-login">
              {t('common.login')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {t('landing.subtitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {t('landing.description')}
          </p>
          <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
            {t('landing.loginButton')}
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{t('landing.features.multiSource.title')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('landing.features.multiSource.description')}
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{t('landing.features.trending.title')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('landing.features.trending.description')}
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{t('landing.features.email.title')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('landing.features.email.description')}
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{t('landing.features.deduplication.title')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('landing.features.deduplication.description')}
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
