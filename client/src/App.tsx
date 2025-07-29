import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Directory from "@/pages/directory";
import Gallery from "@/pages/gallery";
import JobBoard from "@/pages/job-board";
import Mentorship from "@/pages/mentorship";
import Timeline from "@/pages/timeline";
import Resources from "@/pages/resources";
import PrayerWall from "@/pages/prayer-wall";
import Admin from "@/pages/admin";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/chat" component={Chat} />
          <Route path="/directory" component={Directory} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/jobs" component={JobBoard} />
          <Route path="/mentorship" component={Mentorship} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/resources" component={Resources} />
          <Route path="/prayer-wall" component={PrayerWall} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
