import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Protocol from "./pages/Protocol";
import CanonicalUnit from "./pages/CanonicalUnit";
import Modes from "./pages/Modes";
import Determinism from "./pages/Determinism";
import Glossary from "./pages/Glossary";
import NonGoals from "./pages/NonGoals";
import Builders from "./pages/Builders";
import Governance from "./pages/Governance";
import CodeMode from "./pages/CodeMode";
import CodeModeV1 from "./pages/CodeModeV1";
import CodeModeExecution from "./pages/CodeModeExecution";
import HowCodeModeThinks from "./pages/HowCodeModeThinks";
import CommonCodeModeMistakes from "./pages/CommonCodeModeMistakes";
import CodeModeQuickReference from "./pages/CodeModeQuickReference";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/protocol" element={<Protocol />} />
            <Route path="/canonical-unit" element={<CanonicalUnit />} />
            <Route path="/modes" element={<Modes />} />
            <Route path="/determinism" element={<Determinism />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/non-goals" element={<NonGoals />} />
            <Route path="/builders" element={<Builders />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/code-mode" element={<CodeMode />} />
            <Route path="/code-mode-v1" element={<CodeModeV1 />} />
            <Route path="/code-mode-execution" element={<CodeModeExecution />} />
            <Route path="/how-code-mode-thinks" element={<HowCodeModeThinks />} />
            <Route path="/common-code-mode-mistakes" element={<CommonCodeModeMistakes />} />
            <Route path="/code-mode-quick-reference" element={<CodeModeQuickReference />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
