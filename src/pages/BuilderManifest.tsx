import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const BuilderManifest = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Builder Manifest (Draft v0) | NexArt Protocol</title>
        <meta
          name="description"
          content="Specification for the NexArt Builder Manifest - a declarative JSON file for app identity and SDK usage attribution."
        />
      </Helmet>

      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Title */}
        <header className="mb-16">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <p className="text-xs font-mono text-caption tracking-wide">
              DRAFT v0
            </p>
            <span className="text-xs font-mono px-2 py-0.5 bg-muted text-muted-foreground rounded">
              Status: Draft
            </span>
            <span className="text-xs font-mono px-2 py-0.5 bg-muted text-muted-foreground rounded">
              Enforcement: None
            </span>
            <span className="text-xs font-mono px-2 py-0.5 bg-muted text-muted-foreground rounded">
              Runtime Impact: None
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-foreground mb-4 tracking-tight">
            NexArt Builder Manifest
          </h1>
          <p className="text-lg text-body leading-relaxed">
            A declarative specification for app identity and SDK usage attribution.
          </p>
        </header>

        {/* Overview */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            Overview
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <p>The Builder Manifest is:</p>
            <ul className="space-y-2 ml-4">
              <li>• A small public JSON file</li>
              <li>• Used to declare app identity and SDK usage</li>
              <li>• Optional</li>
              <li>• Non-invasive</li>
              <li>• Static</li>
            </ul>
            <div className="border-l-2 border-border pl-4 my-6">
              <p className="text-sm text-caption">Important:</p>
              <ul className="mt-2 space-y-1 text-sm text-body">
                <li>• It does NOT enable rewards</li>
                <li>• It does NOT grant approval</li>
                <li>• It does NOT modify runtime behavior</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Location & Discovery */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            Location & Discovery
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <p>Builders should expose one manifest at:</p>
            <div className="bg-muted/50 border border-border rounded-md p-4 font-mono text-sm">
              <p>/.well-known/nexart.json</p>
              <p className="text-caption mt-2">or</p>
              <p>/nexart.json</p>
            </div>
            <p className="text-caption text-sm mt-4">
              Only one manifest per app.
            </p>
          </div>
        </section>

        {/* What Changed in SDK v1.6.0 */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            What Changed in SDK v1.6.0
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <p>SDK v1.6.0 continues optional, passive support for Builder Manifest registration:</p>
            <ul className="space-y-2 ml-4">
              <li>• SDK now allows optional registration of a Builder Manifest</li>
              <li>• Manifest is write-only</li>
              <li>• SDK does not read, expose, validate, or transmit the manifest</li>
              <li>• Execution, determinism, and outputs are identical with or without a manifest</li>
            </ul>
            <div className="border-l-2 border-border pl-4 my-6">
              <p className="text-sm text-foreground font-medium">Safety Note:</p>
              <p className="mt-2 text-sm text-body">
                Registering a Builder Manifest does not enable rewards, tracking, approval, or attribution. It is a declaration of intent only.
              </p>
            </div>
          </div>
        </section>

        {/* Design Principles */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            Design Principles
          </h2>
          <ul className="space-y-2 text-body leading-relaxed">
            <li>• Static</li>
            <li>• Human-readable</li>
            <li>• Dependency-free</li>
            <li>• No secrets</li>
            <li>• No runtime hooks</li>
            <li>• No network calls</li>
          </ul>
        </section>

        {/* JSON Schema */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            JSON Schema (Draft v0)
          </h2>
          <div className="bg-muted/30 border border-border rounded-md overflow-hidden">
            <pre className="p-4 text-sm font-mono text-body overflow-x-auto">
{`{
  "protocol": "nexart",
  "manifestVersion": "0.1",

  "app": {
    "name": "Example Builder App",
    "url": "https://example.app",
    "description": "A generative art app built on the NexArt protocol",
    "contact": "hello@example.app"
  },

  "sdk": {
    "package": "@nexart/codemode-sdk",
    "version": "^1.6.0",
    "execution": "deterministic"
  },

  "renderer": {
    "package": "@nexart/ui-renderer",
    "version": "^0.8.8",
    "mode": "preview",
    "optional": true
  },

  "features": {
    "codeMode": true,
    "soundArt": false,
    "staticOnly": false,
    "loopMode": true,
    "experimental": []
  },

  "declaration": {
    "usesOfficialSdk": true,
    "noRuntimeModification": true,
    "noProtocolBypass": true
  },

  "timestamp": "2026-01-01T00:00:00Z"
}`}
            </pre>
          </div>
        </section>

        {/* Field Explanations */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            Field Explanations
          </h2>
          <div className="space-y-4 text-body leading-relaxed text-sm">
            <div className="border-b border-border pb-3">
              <code className="font-mono text-foreground">protocol</code>
              <p className="text-caption mt-1">Must be "nexart". Identifies the protocol family.</p>
            </div>
            <div className="border-b border-border pb-3">
              <code className="font-mono text-foreground">manifestVersion</code>
              <p className="text-caption mt-1">Schema version. Currently "0.1".</p>
            </div>
            <div className="border-b border-border pb-3">
              <code className="font-mono text-foreground">app</code>
              <p className="text-caption mt-1">Application metadata: name, URL, description, and contact.</p>
            </div>
            <div className="border-b border-border pb-3">
              <code className="font-mono text-foreground">sdk</code>
              <p className="text-caption mt-1">Declares which canonical SDK package and version is used.</p>
            </div>
            <div className="border-b border-border pb-3">
              <code className="font-mono text-foreground">renderer</code>
              <p className="text-caption mt-1">Optional. Declares UI renderer package if used for previews.</p>
            </div>
            <div className="border-b border-border pb-3">
              <code className="font-mono text-foreground">features</code>
              <p className="text-caption mt-1">Declares which protocol features the app supports. Includes <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">experimental</code> array for future extensibility.</p>
            </div>
            <div className="border-b border-border pb-3">
              <code className="font-mono text-foreground">declaration</code>
              <p className="text-caption mt-1">Self-attested compliance statements. Declarative only.</p>
            </div>
            <div>
              <code className="font-mono text-foreground">timestamp</code>
              <p className="text-caption mt-1">ISO 8601 timestamp of manifest creation or last update.</p>
            </div>
          </div>
        </section>

        {/* Syntactic Validation Rules */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            Syntactic Validation Rules (Draft)
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <p>A manifest is considered syntactically valid if:</p>
            <ul className="space-y-2 ml-4">
              <li>• JSON parses correctly</li>
              <li>• <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">protocol === "nexart"</code></li>
              <li>• Required fields exist</li>
            </ul>
            <div className="border-l-2 border-border pl-4 my-6">
              <ul className="space-y-1 text-sm text-caption">
                <li>• No signatures</li>
                <li>• No authentication</li>
                <li>• No enforcement</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What This Enables */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            What This Enables (Future)
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <p className="text-caption text-sm">May be used in the future for:</p>
            <ul className="space-y-2 ml-4">
              <li>• Builder attribution</li>
              <li>• Ecosystem discovery</li>
              <li>• Foundation grants</li>
              <li>• SDK diagnostics (opt-in)</li>
            </ul>
            <p className="text-caption text-sm mt-4">
              Manifests may be discovered by NexArt tools, third-party platforms, or the NexArt Foundation, but discovery implies no endorsement or approval.
            </p>
          </div>
        </section>

        {/* What This Does NOT Do */}
        <section className="mb-14">
          <h2 className="text-sm font-mono text-foreground mb-4 tracking-wide">
            What This Does NOT Do
          </h2>
          <ul className="space-y-2 text-body leading-relaxed">
            <li>• No rewards</li>
            <li>• No approvals</li>
            <li>• No whitelisting</li>
            <li>• No tracking</li>
            <li>• No SDK behavior changes</li>
          </ul>
        </section>

        {/* Summary */}
        <section className="mt-16 pt-8 border-t border-border">
          <p className="text-body leading-relaxed">
            The NexArt Builder Manifest is a declaration of intent, not a promise.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BuilderManifest;
