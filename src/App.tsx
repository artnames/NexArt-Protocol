import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Eager: landing page (LCP-critical)
import Index from "./pages/Index";

// Lazy: all other pages
const Protocol = lazy(() => import("./pages/Protocol"));
const ProtocolCompliance = lazy(() => import("./pages/ProtocolCompliance"));
const CanonicalUnit = lazy(() => import("./pages/CanonicalUnit"));
const Modes = lazy(() => import("./pages/Modes"));
const Determinism = lazy(() => import("./pages/Determinism"));
const Security = lazy(() => import("./pages/Security"));
const Glossary = lazy(() => import("./pages/Glossary"));
const NonGoals = lazy(() => import("./pages/NonGoals"));
const Builders = lazy(() => import("./pages/Builders"));
const Governance = lazy(() => import("./pages/Governance"));
const CodeMode = lazy(() => import("./pages/CodeMode"));
const BuilderRewards = lazy(() => import("./pages/BuilderRewards"));
const BuilderManifest = lazy(() => import("./pages/BuilderManifest"));
const CodeModeV1 = lazy(() => import("./pages/CodeModeV1"));
const CodeModeExecution = lazy(() => import("./pages/CodeModeExecution"));
const HowCodeModeThinks = lazy(() => import("./pages/HowCodeModeThinks"));
const CommonCodeModeMistakes = lazy(() => import("./pages/CommonCodeModeMistakes"));
const CodeModeQuickReference = lazy(() => import("./pages/CodeModeQuickReference"));
const CanonicalRenderer = lazy(() => import("./pages/CanonicalRenderer"));
const GetStarted = lazy(() => import("./pages/docs/GetStarted"));
const CLI = lazy(() => import("./pages/docs/CLI"));
const RendererAPI = lazy(() => import("./pages/docs/RendererAPI"));
const AIAgentContract = lazy(() => import("./pages/docs/AIAgentContract"));
const BuildersCLI = lazy(() => import("./pages/builders/CLI"));
const BuildersQuickstart = lazy(() => import("./pages/builders/Quickstart"));
const BuildersCertification = lazy(() => import("./pages/builders/Certification"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const FAQ = lazy(() => import("./pages/FAQ"));
const AIExecutionIntegrity = lazy(() => import("./pages/protocol/AIExecutionIntegrity"));
const AIExecutionDemo = lazy(() => import("./pages/demos/AIExecutionDemo"));
const CodeModeCertification = lazy(() => import("./pages/docs/CodeModeCertification"));
const AIExecutionCertification = lazy(() => import("./pages/docs/AIExecutionCertification"));
const VerifyIndependently = lazy(() => import("./pages/docs/VerifyIndependently"));
const NodeStampsKeys = lazy(() => import("./pages/docs/NodeStampsKeys"));
const Verify = lazy(() => import("./pages/Verify"));

// Auth-gated routes (heavy: AuthProvider + dashboard)
const AuthGatedRoutes = lazy(() => import("./components/routing/AuthGatedRoutes"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-sm text-muted-foreground font-mono">Loading…</div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
              {/* LCP-critical: eager */}
              <Route path="/" element={<Index />} />

              {/* Public docs/marketing: lazy, no AuthProvider */}
              <Route path="/protocol" element={<Protocol />} />
              <Route path="/protocol-compliance" element={<ProtocolCompliance />} />
              <Route path="/canonical-unit" element={<CanonicalUnit />} />
              <Route path="/modes" element={<Modes />} />
              <Route path="/determinism" element={<Determinism />} />
              <Route path="/security" element={<Security />} />
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
              <Route path="/docs/ai-agent-contract" element={<AIAgentContract />} />
              <Route path="/builders/cli" element={<BuildersCLI />} />
              <Route path="/builders/quickstart" element={<BuildersQuickstart />} />
              <Route path="/builders/certification" element={<BuildersCertification />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/protocol/ai-execution-integrity" element={<AIExecutionIntegrity />} />
              <Route path="/demos/ai-execution" element={<AIExecutionDemo />} />
              <Route path="/docs/certification/code-mode" element={<CodeModeCertification />} />
              <Route path="/docs/certification/ai-execution" element={<AIExecutionCertification />} />
              <Route path="/docs/certification/verify" element={<VerifyIndependently />} />
              <Route path="/docs/certification/node-stamps" element={<NodeStampsKeys />} />

              {/* Auth-gated routes: AuthProvider only mounts here */}
              <Route path="/auth" element={<AuthGatedRoutes />} />
              <Route path="/auth/reset-password" element={<AuthGatedRoutes />} />
              <Route path="/dashboard" element={<AuthGatedRoutes />} />
              <Route path="/dashboard/*" element={<AuthGatedRoutes />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </HelmetProvider>
);

export default App;
