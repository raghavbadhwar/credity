import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// ⚡ Bolt: Code Splitting Optimization
// Lazy load pages to reduce initial bundle size and improve startup performance (FCP/TTI).
// Each route is now a separate chunk that loads only when needed.
const NotFound = lazy(() => import("@/pages/not-found"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const ConnectDigiLocker = lazy(() => import("@/pages/connect-digilocker"));
const ReceiveCredential = lazy(() => import("@/pages/receive"));
const LoginPage = lazy(() => import("@/pages/login"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const DigitalID = lazy(() => import("@/pages/digital-id"));
const CredentialDetail = lazy(() => import("@/pages/credential-detail"));
const ConnectionsPage = lazy(() => import("@/pages/connections"));
const BusinessDashboard = lazy(() => import("@/pages/business-dashboard"));
const IdentityVerification = lazy(() => import("@/pages/identity-verification"));

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/" component={Dashboard} />
        <Route path="/connect" component={ConnectDigiLocker} />
        <Route path="/receive" component={ReceiveCredential} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/id" component={DigitalID} />
        <Route path="/credential/:id" component={CredentialDetail} />
        <Route path="/connections" component={ConnectionsPage} />
        <Route path="/business" component={BusinessDashboard} />
        <Route path="/verify" component={IdentityVerification} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
