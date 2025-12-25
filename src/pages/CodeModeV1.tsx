import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";

const CodeModeV1 = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Code Mode v1 — GSL Language Draft - NexArt Protocol</title>
        <meta name="description" content="Proposed protocol-level specification for Code Mode v1 (NexArt Generative System Language). Design proposal only — not implemented, not enforced." />
      </Helmet>
      
      <PageHeader 
        title="Code Mode v1 — GSL Language Draft"
        subtitle="Proposed Protocol-Stable Generative Language"
        badge={<Badge variant="outline" className="text-xs border-caption text-caption">DRAFT</Badge>}
      />
      
      <PageContent>
        {/* Single Clear Draft Banner */}
        <div className="border-2 border-dashed border-caption bg-muted/50 px-6 py-4 mb-8 -mx-6 sm:-mx-0 sm:mx-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold tracking-wider text-caption">DRAFT — NOT IMPLEMENTED</span>
          </div>
          <p className="text-sm mt-2 mb-0 text-body">
            This document defines a proposed protocol-stable generative language (GSL).
            <br />
            <strong>None of the behavior described here exists in nexart.xyz today.</strong>
          </p>
        </div>

        <div className="prose-protocol">
          {/* Document Header */}
          <div className="mb-12 text-caption text-sm space-y-1">
            <p><strong>Version:</strong> v1.0-draft</p>
            <p><strong>Internal Name:</strong> NexArt Generative System Language (GSL) v1</p>
          </div>

          {/* 1. Executive Summary */}
          <h2>1. Executive Summary</h2>
          
          <p>
            This document proposes a protocol-stable Code Mode v1 specification for NexArt. Unlike the current experimental Code Mode (v0.x), which is permissive and browser-dependent, v1 is designed to be:
          </p>
          
          <ul>
            <li><strong>Deterministic</strong> — same seed produces the same output</li>
            <li><strong>Renderer-agnostic</strong> — executable in browser, Node.js, or WASM</li>
            <li><strong>Validatable</strong> — systems can be statically analyzed before execution</li>
            <li><strong>Versionable</strong> — explicit evolution with backward compatibility</li>
            <li><strong>Portable</strong> — canonical representation suitable for IPFS and long-term storage</li>
          </ul>

          <h3>1.1 Philosophical Foundation</h3>
          
          <p>
            <strong>Code Mode v1 is not JavaScript.</strong><br />
            It is a constrained generative DSL expressed in JavaScript syntax.
          </p>
          
          <p>
            This distinction is fundamental:
          </p>
          
          <ul>
            <li>It resets expectations away from general-purpose execution</li>
            <li>Limitations are intentional constraints, not missing features</li>
            <li>The system is a language, not a sandbox</li>
            <li>This enables validation, determinism, and protocol guarantees</li>
          </ul>

          <div className="border border-border bg-muted/30 p-4 my-6">
            <p className="text-body mb-0 text-sm">
              GSL borrows familiar concepts from p5.js to reduce cognitive friction,
              but compatibility is intentional, partial, and non-goal-driven.
              <br />
              <strong>Familiarity does not imply equivalence.</strong>
            </p>
          </div>

          {/* Status Reminder before Technical Spec */}
          <div className="border border-caption/50 bg-muted/30 p-4 mb-8">
            <p className="text-caption text-sm mb-0">
              For current implemented behavior, see{" "}
              <Link to="/code-mode-execution" className="underline hover:text-foreground">
                Code Mode Runtime (v0.x) →
              </Link>
            </p>
          </div>

          {/* 2. Inventory Analysis */}
          <h2>2. Inventory Analysis</h2>

          <h3>2.1 Current Code Mode v0.x Surface</h3>
          
          {/* Important Warning */}
          <div className="border-2 border-caption/50 bg-muted/30 p-4 mb-6">
            <p className="font-medium text-foreground mb-1 text-sm">Important</p>
            <p className="text-body text-sm mb-0">
              This inventory describes the current runtime surface in nexart.xyz (v0.x).
              <br />
              It does not guarantee availability or inclusion in GSL v1.
            </p>
          </div>
          
          <p>
            The current implementation exposes 210+ functions. They fall into three categories.
          </p>

          <h4>2.1.1 Core Primitives (Protocol-Safe)</h4>
          
          <p>
            Deterministic, stateless, renderer-agnostic.
          </p>
          
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-foreground font-medium">Category</th>
                  <th className="text-left py-2 pr-4 text-foreground font-medium">Functions</th>
                  <th className="text-left py-2 text-foreground font-medium">Count</th>
                </tr>
              </thead>
              <tbody className="text-body">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Drawing Shapes</td>
                  <td className="py-2 pr-4 font-mono text-xs">circle, rect, ellipse, line, point, triangle, quad, arc</td>
                  <td className="py-2">8</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Vertex Shapes</td>
                  <td className="py-2 pr-4 font-mono text-xs">beginShape, endShape, vertex, curveVertex, bezierVertex, quadraticVertex</td>
                  <td className="py-2">6</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Curves</td>
                  <td className="py-2 pr-4 font-mono text-xs">bezier, curve</td>
                  <td className="py-2">2</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Transforms</td>
                  <td className="py-2 pr-4 font-mono text-xs">translate, rotate, scale, push, pop, shearX, shearY</td>
                  <td className="py-2">7</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Color Setting</td>
                  <td className="py-2 pr-4 font-mono text-xs">fill, stroke, noFill, noStroke, background, colorMode</td>
                  <td className="py-2">6</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Stroke Style</td>
                  <td className="py-2 pr-4 font-mono text-xs">strokeWeight, strokeCap, strokeJoin</td>
                  <td className="py-2">3</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Math Core</td>
                  <td className="py-2 pr-4 font-mono text-xs">sin, cos, tan, asin, acos, atan, atan2</td>
                  <td className="py-2">7</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Math Extended</td>
                  <td className="py-2 pr-4 font-mono text-xs">sqrt, pow, abs, floor, ceil, round, exp, log, sq</td>
                  <td className="py-2">9</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Math Utility</td>
                  <td className="py-2 pr-4 font-mono text-xs">map, lerp, constrain, dist, mag, norm, min, max</td>
                  <td className="py-2">8</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Randomness</td>
                  <td className="py-2 pr-4 font-mono text-xs">random, randomSeed, noise, noiseSeed</td>
                  <td className="py-2">4</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Angle Conversion</td>
                  <td className="py-2 pr-4 font-mono text-xs">radians, degrees</td>
                  <td className="py-2">2</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Color Extraction</td>
                  <td className="py-2 pr-4 font-mono text-xs">red, green, blue, alpha, hue, saturation, brightness</td>
                  <td className="py-2">7</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Color Creation</td>
                  <td className="py-2 pr-4 font-mono text-xs">color, lerpColor</td>
                  <td className="py-2">2</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="py-2 pr-4 font-medium text-foreground" colSpan={2}>Total</td>
                  <td className="py-2 font-medium text-foreground">71</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4>2.1.2 Convenience Helpers (Protocol-Optional)</h4>
          
          <p>
            Higher-level abstractions built on primitives.
          </p>
          
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-foreground font-medium">Category</th>
                  <th className="text-left py-2 pr-4 text-foreground font-medium">Functions</th>
                  <th className="text-left py-2 text-foreground font-medium">Count</th>
                </tr>
              </thead>
              <tbody className="text-body">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Extended Shapes</td>
                  <td className="py-2 pr-4 font-mono text-xs">square, regularPolygon, star, heart, hexagon, octagon</td>
                  <td className="py-2">6</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Layout Generators</td>
                  <td className="py-2 pr-4 font-mono text-xs">gridSpacing, radialSpacing, spiralSpacing, waveSpacing, hexSpacing, organicSpacing</td>
                  <td className="py-2">6</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Gradients</td>
                  <td className="py-2 pr-4 font-mono text-xs">linearGradient, radialGradient</td>
                  <td className="py-2">2</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Noise Variants</td>
                  <td className="py-2 pr-4 font-mono text-xs">fbm, turbulence, ridgedNoise, noiseDetail</td>
                  <td className="py-2">4</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Easing</td>
                  <td className="py-2 pr-4 font-mono text-xs">easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart, easeInSine, easeOutSine, easeInOutSine</td>
                  <td className="py-2">12</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Geometry Utilities</td>
                  <td className="py-2 pr-4 font-mono text-xs">pointLineDistance, lineIntersection, polygonArea, pointInPolygon</td>
                  <td className="py-2">4</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Physics Helpers</td>
                  <td className="py-2 pr-4 font-mono text-xs">spring, oscillate, bounce, friction</td>
                  <td className="py-2">4</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="py-2 pr-4 font-medium text-foreground" colSpan={2}>Total</td>
                  <td className="py-2 font-medium text-foreground">38</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4>2.1.3 Experimental / Unsafe (Excluded)</h4>
          
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-foreground font-medium">Category</th>
                  <th className="text-left py-2 text-foreground font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="text-body">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Asset loading, network</td>
                  <td className="py-2">Non-deterministic</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">DOM / browser APIs</td>
                  <td className="py-2">Renderer-dependent</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">User input</td>
                  <td className="py-2">Runtime-dependent</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">WebGL / 3D</td>
                  <td className="py-2">Renderer-specific</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Time functions</td>
                  <td className="py-2">Non-reproducible</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Eval / Function</td>
                  <td className="py-2">Security + non-deterministic</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Minimal Protocol Core */}
          <h2>3. Minimal Protocol Core</h2>

          <h3>3.1 Proposed v1 Primitive Set</h3>
          
          <p>
            <strong>52 primitives + 12 constants = 64 symbols</strong>
          </p>
          
          <p>
            Single-frame, deterministic, renderer-agnostic.
          </p>

          <h3>3.2 Rationale for Exclusions</h3>
          
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-foreground font-medium">Excluded</th>
                  <th className="text-left py-2 text-foreground font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="text-body">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Text rendering</td>
                  <td className="py-2">Font differences break reproducibility</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Pixel access</td>
                  <td className="py-2">Implementation-specific</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Offscreen buffers</td>
                  <td className="py-2">Adds state complexity</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Timing / animation</td>
                  <td className="py-2">Non-deterministic</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">User input</td>
                  <td className="py-2">Runtime dependent</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Asset loading</td>
                  <td className="py-2">Network dependent</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. Determinism Model */}
          <h2>4. Determinism Model</h2>

          <h3>4.1 Mandatory Seed</h3>
          
          <pre className="bg-muted/50 border border-border p-4 overflow-x-auto text-sm font-mono mb-6">
{`interface CodeModeV1System {
  version: "1.0";
  seed: number;
  code: string;
  dimensions: { width: number; height: number };
}`}
          </pre>
          
          <ul>
            <li><code className="font-mono text-sm bg-muted/50 px-1">randomSeed(seed)</code> and <code className="font-mono text-sm bg-muted/50 px-1">noiseSeed(seed)</code> are injected automatically</li>
            <li>Same seed + same code = identical output</li>
          </ul>

          <h3>4.2 Time Model</h3>
          
          <p>
            <strong>Time is excluded.</strong>
          </p>
          
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-foreground font-medium">Function</th>
                  <th className="text-left py-2 text-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-body">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-xs">millis, frameCount</td>
                  <td className="py-2">EXCLUDED</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-xs">second, minute, hour</td>
                  <td className="py-2">EXCLUDED</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p>
            v1 is single-frame only.
          </p>

          <h3>4.3 Execution Order</h3>
          
          <ol>
            <li>Canvas initialized</li>
            <li><code className="font-mono text-sm bg-muted/50 px-1">randomSeed</code> / <code className="font-mono text-sm bg-muted/50 px-1">noiseSeed</code> applied</li>
            <li><code className="font-mono text-sm bg-muted/50 px-1">background(255)</code></li>
            <li>Code executes top-to-bottom</li>
            <li>Frame captured</li>
          </ol>
          
          <p>
            No draw loop. No async.
          </p>

          {/* 5. Validation Rules */}
          <h2>5. Validation Rules</h2>

          <h3>5.1 Static Validation</h3>
          
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-foreground font-medium">Check</th>
                  <th className="text-left py-2 text-foreground font-medium">Enforcement</th>
                </tr>
              </thead>
              <tbody className="text-body">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Missing fields</td>
                  <td className="py-2">HARD</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Unsupported version</td>
                  <td className="py-2">HARD</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Forbidden symbols</td>
                  <td className="py-2">HARD</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Invalid seed</td>
                  <td className="py-2">HARD</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Undefined symbols</td>
                  <td className="py-2">SOFT</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Complexity limits</td>
                  <td className="py-2">SOFT</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>5.2 Forbidden Symbols</h3>
          
          <pre className="bg-muted/50 border border-border p-4 overflow-x-auto text-sm font-mono mb-6">
{`window, document, fetch, eval, Function,
Date, performance, setTimeout,
localStorage, import, require,
addEventListener`}
          </pre>

          {/* 6. System Representation */}
          <h2>6. System Representation</h2>

          <h3>6.1 Canonical JSON</h3>
          
          <pre className="bg-muted/50 border border-border p-4 overflow-x-auto text-sm font-mono mb-6">
{`interface NexArtCodeModeV1 {
  protocol: "nexart-codemode";
  version: "1.0";
  seed: number;
  dimensions: { width: number; height: number };
  code: { source: string; hash: string };
  creator?: { address?: string; name?: string };
  created: string;
}`}
          </pre>

          <h3>6.2 System Identity</h3>
          
          <pre className="bg-muted/50 border border-border p-4 overflow-x-auto text-sm font-mono mb-6">
{`systemId = sha256(
  protocol + version + seed + dimensions + code.hash
)`}
          </pre>

          {/* 7. Backward Compatibility */}
          <h2>7. Backward Compatibility</h2>
          
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-foreground font-medium">Version</th>
                  <th className="text-left py-2 text-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-body">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">v0.x</td>
                  <td className="py-2">Experimental</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">v1.0</td>
                  <td className="py-2">Protocol-stable</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p>
            Migration is manual and opt-in.
          </p>

          {/* 8. Out of Scope */}
          <h2>8. Out of Scope</h2>
          
          <ul>
            <li>Animation</li>
            <li>Interaction</li>
            <li>Assets</li>
            <li>Fonts</li>
            <li>Audio</li>
            <li>WebGL</li>
          </ul>

          {/* 9. Summary */}
          <h2>9. Summary</h2>
          
          <p>
            <strong>Code Mode v1 defines a language, not a runtime.</strong>
          </p>
          
          <p>
            It enables:
          </p>
          
          <ul>
            <li>Determinism</li>
            <li>Validation</li>
            <li>Long-term reproducibility</li>
            <li>Multi-renderer execution</li>
          </ul>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default CodeModeV1;
