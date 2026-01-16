import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProviderDetail from "./pages/ProviderDetail";
import ProviderSignup from "./pages/ProviderSignup";
import Dashboard from "./pages/Dashboard";
import AdminApprovals from "./pages/AdminApprovals";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderDetailPage from "./pages/ProviderDetailPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/provider/:id"} component={ProviderDetailPage} />
      <Route path={"/provider-signup"} component={ProviderSignup} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin/approvals"} component={AdminApprovals} />
      <Route path={"/provider/dashboard"} component={ProviderDashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
