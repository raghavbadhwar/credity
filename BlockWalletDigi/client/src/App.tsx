import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Optimized: Code splitting for route components to reduce initial bundle size
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

function Router() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
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
