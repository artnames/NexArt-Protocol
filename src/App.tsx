import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Protocol from "./pages/Protocol";
import ProtocolCompliance from "./pages/ProtocolCompliance";
import CanonicalUnit from "./pages/CanonicalUnit";
import Modes from "./pages/Modes";
import Determinism from "./pages/Determinism";
import Glossary from "./pages/Glossary";
import NonGoals from "./pages/NonGoals";
import Builders from "./pages/Builders";
import Governance from "./pages/Governance";
import CodeMode from "./pages/CodeMode";
import BuilderRewards from "./pages/BuilderRewards";
import BuilderManifest from "./pages/BuilderManifest";
import CodeModeV1 from "./pages/CodeModeV1";
import CodeModeExecution from "./pages/CodeModeExecution";
import HowCodeModeThinks from "./pages/HowCodeModeThinks";
import CommonCodeModeMistakes from "./pages/CommonCodeModeMistakes";
import CodeModeQuickReference from "./pages/CodeModeQuickReference";
import CanonicalRenderer from "./pages/CanonicalRenderer";
import GetStarted from "./pages/docs/GetStarted";
import CLI from "./pages/docs/CLI";
import RendererAPI from "./pages/docs/RendererAPI";
import BuildersCLI from "./pages/builders/CLI";
import BuildersQuickstart from "./pages/builders/Quickstart";
import BuildersCertification from "./pages/builders/Certification";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import ApiKeys from "./pages/dashboard/ApiKeys";
import Usage from "./pages/dashboard/Usage";
import Billing from "./pages/dashboard/Billing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/protocol" element={<Protocol />} />
              <Route path="/protocol-compliance" element={<ProtocolCompliance />} />
              <Route path="/canonical-unit" element={<CanonicalUnit />} />
              <Route path="/modes" element={<Modes />} />
              <Route path="/determinism" element={<Determinism />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/non-goals" element={<NonGoals />} />
              <Route path="/builders" element={<Builders />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/code-mode" element={<CodeMode />} />
              <Route path="/builder-rewards" element={<BuilderRewards />} />
              <Route path="/builder-manifest" element={<BuilderManifest />} />
              <Route path="/code-mode-v1" element={<CodeModeV1 />} />
              <Route path="/code-mode-execution" element={<CodeModeExecution />} />
              <Route path="/how-code-mode-thinks" element={<HowCodeModeThinks />} />
              <Route path="/common-code-mode-mistakes" element={<CommonCodeModeMistakes />} />
              <Route path="/code-mode-quick-reference" element={<CodeModeQuickReference />} />
              <Route path="/canonical-renderer" element={<CanonicalRenderer />} />
              <Route path="/docs/get-started" element={<GetStarted />} />
              <Route path="/docs/cli" element={<CLI />} />
              <Route path="/docs/renderer-api" element={<RendererAPI />} />
              <Route path="/builders/cli" element={<BuildersCLI />} />
              <Route path="/builders/quickstart" element={<BuildersQuickstart />} />
              <Route path="/builders/certification" element={<BuildersCertification />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/api-keys" element={<ApiKeys />} />
              <Route path="/dashboard/usage" element={<Usage />} />
              <Route path="/dashboard/billing" element={<Billing />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
