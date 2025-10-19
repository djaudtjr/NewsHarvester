// Reference: Replit Auth blueprint - App.tsx with auth routing
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import Bookmarks from "@/pages/bookmarks";
import EmailHistory from "@/pages/email-history";
import NotFound from "@/pages/not-found";
import type { UserPreferences } from "@shared/schema";
import "./i18n/config";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { i18n } = useTranslation();
  
  // Fetch user preferences to sync language
  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
    enabled: isAuthenticated,
  });
  
  // Sync language preference from database to i18n and localStorage
  useEffect(() => {
    if (preferences?.language && preferences.language !== i18n.language) {
      i18n.changeLanguage(preferences.language);
      localStorage.setItem('language', preferences.language);
    }
  }, [preferences?.language, i18n]);

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/settings" component={Settings} />
          <Route path="/bookmarks" component={Bookmarks} />
          <Route path="/email-history" component={EmailHistory} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="news-aggregator-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
