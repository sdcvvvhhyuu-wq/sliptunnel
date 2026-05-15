import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { Dashboard } from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

import { Profiles } from "@/pages/profiles";
import { Algorithms } from "@/pages/algorithms";
import { Scanner } from "@/pages/scanner";
import { Downloads } from "@/pages/downloads";
import { About } from "@/pages/about";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/profiles" component={Profiles} />
        <Route path="/algorithms" component={Algorithms} />
        <Route path="/scanner" component={Scanner} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;