import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Pages
import Home from "@/pages/home";
import Picks from "@/pages/picks";
import News from "@/pages/news";
import Analysis from "@/pages/analysis";
import DetailedAnalysis from "@/pages/detailedAnalysis";
import BankrollManager from "@/pages/bankrollManager";
import BetTracker from "@/pages/betTracker";
import DailySchedule from "@/pages/dailySchedule";
import Subscribe from "@/pages/subscribe";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/picks" component={Picks} />
      <Route path="/news" component={News} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/detailed-analysis" component={DetailedAnalysis} />
      <Route path="/bankroll" component={BankrollManager} />
      <Route path="/bet-tracker" component={BetTracker} />
      <Route path="/schedule" component={DailySchedule} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
