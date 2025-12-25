import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageContent from "@/components/layout/PageContent";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const CodeModeExecution = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Code Mode Execution Specification | NexArt Protocol</title>
        <meta
          name="description"
          content="Canonical technical specification for NexArt Code Mode execution behavior, including Static Mode, Loop Mode, determinism requirements, and NFT minting."
        />
      </Helmet>

      {/* Header with breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/protocol">NexArt Protocol</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Code Mode</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center gap-3 mb-4">
            <p className="text-xs font-mono text-caption uppercase tracking-wider">
              Protocol Specification — Code Mode
            </p>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-foreground text-background">
              CURRENT
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
            NexArt Code Mode — Runtime Execution Specification (v0.x)
          </h1>
          <p className="text-body text-lg max-w-2xl mb-6">
            Version 1.0 · Status: CURRENT · Implemented in nexart.xyz · Enforced by the app · Last Updated: December 2025
          </p>
          <p className="text-caption text-sm">
            Looking for the protocol-stable language design?{" "}
            <Link to="/code-mode-v1" className="underline hover:text-foreground">
              Code Mode v1 (GSL Draft) →
            </Link>
          </p>
        </div>
      </div>

      <PageContent>
        {/* Prominent Status Banner */}
        <div className="bg-foreground text-background px-6 py-4 mb-8 -mx-6 sm:-mx-0 sm:mx-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold tracking-wider">CURRENT · IMPLEMENTED · ENFORCED</span>
          </div>
          <p className="text-sm mt-2 mb-0 opacity-90">
            This specification describes runtime behavior that is <strong>live and enforced</strong> in nexart.xyz today.
          </p>
        </div>

        <div className="prose-protocol prose-spec">
          {/* Section 1 */}
          <h2>1. Overview</h2>

          {/* Scope Clarification Callout */}
          <div className="border border-border bg-muted/30 p-6 mb-8">
            <p className="font-medium text-foreground mb-2">Scope Clarification</p>
            <p className="text-body text-sm mb-2">
              This document specifies the current Code Mode runtime behavior implemented in nexart.xyz (v0.x), including Static and Loop rendering and minting.
            </p>
            <p className="text-body text-sm mb-2">
              It is <strong>not</strong> the protocol-stable language definition.
            </p>
            <p className="text-body text-sm mb-0">
              For the proposed future language spec, see{" "}
              <Link to="/code-mode-v1" className="underline hover:text-foreground">
                Code Mode v1 — GSL Language Draft
              </Link>.
            </p>
          </div>

          <p>
            NexArt Code Mode provides a controlled execution environment for generative art creation. It supports both static image generation and looping animations suitable for minting as NFTs.
          </p>
          <p>Code Mode enforces deterministic constraints to guarantee:</p>
          <ul>
            <li>Reproducible output across executions</li>
            <li>Mint-safe rendering (identical output for identical code)</li>
            <li>Predictable capture timing for NFT marketplaces</li>
            <li>Cross-browser consistency</li>
          </ul>
          <p>This specification defines the exact execution behavior for both Static Mode and Loop Mode.</p>

          <hr className="my-12 border-border" />

          {/* Section 2 */}
          <h2>2. Execution Environment</h2>

          <h3>2.1 Canvas Lifecycle</h3>
          <p>NexArt Code Mode operates on a fixed-dimension canvas:</p>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Width</td><td>1950 px</td></tr>
                <tr><td>Height</td><td>2400 px</td></tr>
                <tr><td>Mobile Width</td><td>975 px</td></tr>
                <tr><td>Mobile Height</td><td>1200 px</td></tr>
                <tr><td>Aspect Ratio</td><td>13:16</td></tr>
              </tbody>
            </table>
          </div>
          <p>The canvas is pre-initialized before user code execution. User code does not control canvas creation.</p>

          <h3>2.2 Controlled Execution</h3>
          <p>All user code executes within a sandboxed environment with restricted global access. The following constraints apply:</p>
          <ul>
            <li>No access to <code>window</code>, <code>document</code>, or DOM APIs</li>
            <li>No network requests (<code>fetch</code>, <code>XMLHttpRequest</code>)</li>
            <li>No filesystem access</li>
            <li>No <code>eval()</code> or dynamic code execution</li>
            <li>Restricted timing APIs (see Section 6)</li>
          </ul>

          <h3>2.3 Deterministic Rendering</h3>
          <p>NexArt guarantees deterministic output by:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li>Seeding pseudo-random number generators</li>
            <li>Controlling frame timing via discrete stepping</li>
            <li>Isolating execution context between runs</li>
            <li>Preventing state persistence across captures</li>
          </ol>

          <h3>2.4 State Persistence Restrictions</h3>
          <p>User code MUST NOT rely on state persisting between:</p>
          <ul>
            <li>Separate executions of the same code</li>
            <li>Frame captures in Loop Mode</li>
            <li>Preview runs and final capture</li>
          </ul>
          <p>Each execution begins with a clean canvas state.</p>

          <hr className="my-12 border-border" />

          {/* Section 3 */}
          <h2>3. Static Mode Specification</h2>
          <p>Static Mode generates a single image from a one-time code execution.</p>

          <h3>3.1 Required Functions</h3>
          <pre className="spec-code"><code>{`function setup() {
  // Required. Executes once.
  // All drawing operations occur here.
}`}</code></pre>
          <p>The <code>setup()</code> function is mandatory. All rendering must complete within this function.</p>

          <h3>3.2 Optional Functions</h3>
          <pre className="spec-code"><code>{`function draw() {
  // Optional in Static Mode.
  // Executes once after setup() if defined.
  // Typically left empty or omitted.
}`}</code></pre>

          <h3>3.3 Recommended Pattern</h3>
          <pre className="spec-code"><code>{`function setup() {
  noLoop(); // Prevents continuous execution
  background(255);
  // All drawing code here
}`}</code></pre>
          <p>The <code>noLoop()</code> call is strongly recommended for Static Mode to explicitly signal single-execution intent.</p>

          <h3>3.4 Execution Order</h3>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li>Canvas initialized (1950 x 2400)</li>
            <li><code>setup()</code> executed</li>
            <li><code>draw()</code> executed once (if defined)</li>
            <li>Canvas captured as PNG</li>
            <li>Execution terminated</li>
          </ol>

          <h3>3.5 Forbidden Functions</h3>
          <p>The following functions are forbidden in Static Mode:</p>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Function</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>setTimeout()</code></td><td>Async timing breaks determinism</td></tr>
                <tr><td><code>setInterval()</code></td><td>Async timing breaks determinism</td></tr>
                <tr><td><code>requestAnimationFrame()</code></td><td>Bypasses controlled execution</td></tr>
              </tbody>
            </table>
          </div>

          <h3>3.6 Output Format</h3>
          <ul>
            <li>Format: PNG</li>
            <li>Color depth: 24-bit RGB</li>
            <li>Resolution: 1950 x 2400 px</li>
          </ul>

          <h3>3.7 Mint Safety Guarantee</h3>
          <p>Static Mode output is mint-safe because:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li>Execution is single-pass with no temporal dependencies</li>
            <li>Canvas state is captured immediately after execution</li>
            <li>No async operations can modify the canvas post-capture</li>
          </ol>

          <hr className="my-12 border-border" />

          {/* Section 4 */}
          <h2>4. Loop Mode Specification</h2>
          <p>Loop Mode generates animated content as a sequence of deterministically rendered frames.</p>
          <p>The runtime clears the canvas before each frame. Artists must call <code>background()</code> inside <code>draw()</code> if a visible background is desired.</p>

          <h3>4.1 Configuration</h3>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Frame Rate</td><td>30 FPS (fixed)</td></tr>
                <tr><td>Minimum Duration</td><td>1 second</td></tr>
                <tr><td>Maximum Duration</td><td>4 seconds</td></tr>
                <tr><td>Default Duration</td><td>2 seconds</td></tr>
                <tr><td>Maximum Frames</td><td>120 frames</td></tr>
              </tbody>
            </table>
          </div>

          <h3>4.2 Required Functions</h3>
          <pre className="spec-code"><code>{`function setup() {
  // Required. Executes once before frame capture begins.
}

function draw() {
  // REQUIRED in Loop Mode.
  // Executes once per frame.
  // Must produce complete frame output on each call.
}`}</code></pre>
          <p><strong>The <code>draw()</code> function is mandatory for Loop Mode.</strong> Code without <code>draw()</code> will fail validation.</p>

          <h3>4.3 Forbidden Functions</h3>
          <p>The following patterns are explicitly forbidden:</p>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>noLoop()</code></td><td>Incompatible with animation capture</td></tr>
                <tr><td><code>setTimeout()</code></td><td>Async timing breaks frame determinism</td></tr>
                <tr><td><code>setInterval()</code></td><td>Async timing breaks frame determinism</td></tr>
                <tr><td><code>requestAnimationFrame()</code></td><td>Bypasses frame stepping model</td></tr>
                <tr><td><code>while(true)</code></td><td>Infinite loops block execution</td></tr>
              </tbody>
            </table>
          </div>

          <h3>4.4 Frame Stepping Model</h3>
          <p>Loop Mode uses discrete frame stepping, NOT continuous animation:</p>
          <pre className="spec-code"><code>{`Frame 0: setup() → draw() → capture
Frame 1: draw() → capture
Frame 2: draw() → capture
...
Frame N: draw() → capture → encode MP4`}</code></pre>
          <p>Each frame:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li><code>draw()</code> is called with updated time variables</li>
            <li>Canvas is captured to PNG blob</li>
            <li>Canvas is NOT preserved for next frame</li>
          </ol>

          <h3>4.5 Time Variables</h3>
          <p>The following time variables are injected into the execution context:</p>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>frameCount</code></td><td>integer</td><td>Current frame number (0, 1, 2, ...)</td></tr>
                <tr><td><code>t</code></td><td>float</td><td>Normalized time [0.0, 1.0)</td></tr>
                <tr><td><code>time</code></td><td>float</td><td>Elapsed time in seconds</td></tr>
                <tr><td><code>tGlobal</code></td><td>float</td><td>Alias for <code>t</code></td></tr>
              </tbody>
            </table>
          </div>
          <p><strong>Canonical time calculation:</strong></p>
          <pre className="spec-code"><code>{`t = frameCount / totalFrames  // Range [0.0, 1.0)
time = t * durationSeconds    // Range [0.0, duration)`}</code></pre>

          {/* Critical Warning */}
          <div className="spec-warning">
            <p className="spec-warning-title">WARNING: CRITICAL FRAME ISOLATION</p>
            <p>Each frame in Loop Mode is rendered independently.<br />
            The canvas is conceptually cleared between frames.<br />
            <strong>NO state persists from one draw() call to the next.</strong></p>
            <p>Patterns that rely on canvas accumulation WILL FAIL:</p>
            <ul>
              <li>Alpha-blended backgrounds (<code>background(0, 0, 0, 10)</code>)</li>
              <li>Trail effects via partial transparency</li>
              <li>Particle systems that accumulate over time</li>
              <li>Any effect that depends on "what was drawn before"</li>
            </ul>
            <p>Each <code>draw()</code> call must produce the COMPLETE frame output.</p>
          </div>

          <h3>4.6 Why Accumulation Fails</h3>
          <p>In standard p5.js, calling <code>background(0, 0, 0, 10)</code> creates a fading trail effect because previous frame content bleeds through the semi-transparent background.</p>
          <p>In NexArt Loop Mode, this fails because:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li>Each frame is captured in isolation</li>
            <li>There is no "previous frame" to blend with</li>
            <li>The canvas begins each frame in an undefined state</li>
          </ol>
          <p><strong>Failure mode:</strong> Output appears as single objects on solid backgrounds, with no trails or fading effects.</p>

          <hr className="my-12 border-border" />

          {/* Section 5 */}
          <h2>5. Perfect Loop Requirements</h2>
          <p>For seamless looping, animations must satisfy mathematical closure at the loop boundary.</p>

          <h3>5.1 Phase Normalization</h3>
          <p>All animated values must be functions of normalized time <code>t</code> where <code>t ∈ [0.0, 1.0)</code>.</p>
          <p>The value at <code>t = 0.0</code> must equal the value at <code>t = 1.0</code>.</p>

          <h3>5.2 Mathematical Closure</h3>
          <p>For any animated property <code>f(t)</code>:</p>
          <pre className="spec-code"><code>{`lim(t→1) f(t) = f(0)`}</code></pre>

          <h3>5.3 Canonical Patterns</h3>
          <p><strong>Oscillation (sine wave):</strong></p>
          <pre className="spec-code"><code>{`function draw() {
  let phase = t * TWO_PI;  // Full cycle over loop duration
  let x = width/2 + cos(phase) * 100;
  let y = height/2 + sin(phase) * 100;
  ellipse(x, y, 50, 50);
}`}</code></pre>

          <p><strong>Rotation:</strong></p>
          <pre className="spec-code"><code>{`function draw() {
  let angle = t * TWO_PI;  // Full rotation
  translate(width/2, height/2);
  rotate(angle);
  rect(-50, -50, 100, 100);
}`}</code></pre>

          <p><strong>Periodic color:</strong></p>
          <pre className="spec-code"><code>{`function draw() {
  let hue = (t * 360) % 360;  // Full hue cycle
  colorMode(HSB, 360, 100, 100);
  background(hue, 80, 90);
}`}</code></pre>

          <h3>5.4 Frame Modulo Logic</h3>
          <p>For effects that cycle multiple times within the loop:</p>
          <pre className="spec-code"><code>{`let cycles = 3;  // Complete 3 cycles per loop
let phase = (t * cycles) % 1.0;`}</code></pre>

          <h3>5.5 Recommended Default</h3>
          <p>A 2-second loop at 30 FPS provides 60 frames, offering a good balance of smoothness and file size.</p>

          <hr className="my-12 border-border" />

          {/* Section 6 */}
          <h2>6. Forbidden Patterns</h2>
          <p>The following patterns are explicitly forbidden and will cause validation errors or incorrect output:</p>

          <h3>6.1 Accumulation</h3>
          <pre className="spec-code"><code>{`// FORBIDDEN: Relies on canvas persistence
function draw() {
  // No background() call - expects previous content to remain
  ellipse(random(width), random(height), 10, 10);
}`}</code></pre>
          <p><strong>Failure mode:</strong> Only the final frame's content appears; no accumulation occurs.</p>

          <h3>6.2 Alpha Fading</h3>
          <pre className="spec-code"><code>{`// FORBIDDEN: Semi-transparent background for trail effect
function draw() {
  background(0, 0, 0, 20);  // Does NOT create trails in Loop Mode
  ellipse(x, y, 50, 50);
}`}</code></pre>
          <p><strong>Failure mode:</strong> Appears as solid background with no fading effect.</p>

          <h3>6.3 Undeterministic Random</h3>
          <pre className="spec-code"><code>{`// FORBIDDEN: Random without phase parameterization
function draw() {
  let x = random(width);  // Different each frame = jerky motion
  ellipse(x, height/2, 50, 50);
}`}</code></pre>
          <p><strong>Correct pattern:</strong> Use noise or seed-based randomness:</p>
          <pre className="spec-code"><code>{`function draw() {
  let x = noise(t * 5) * width;  // Smooth, deterministic
  ellipse(x, height/2, 50, 50);
}`}</code></pre>

          <h3>6.4 Stateful Globals</h3>
          <pre className="spec-code"><code>{`// FORBIDDEN: Globals that accumulate state
let particles = [];

function draw() {
  particles.push({x: random(width), y: 0});  // Grows each frame
  for (let p of particles) {
    ellipse(p.x, p.y, 5, 5);
  }
}`}</code></pre>
          <p><strong>Failure mode:</strong> State is not preserved between frames; array is empty each frame.</p>

          <h3>6.5 Frame-Rate Dependent Logic</h3>
          <pre className="spec-code"><code>{`// FORBIDDEN: Assumes specific frame timing
function draw() {
  x += 2;  // Position depends on how many frames have run
}`}</code></pre>
          <p><strong>Correct pattern:</strong> Use normalized time:</p>
          <pre className="spec-code"><code>{`function draw() {
  let x = t * width;  // Position derived from normalized time
}`}</code></pre>

          <hr className="my-12 border-border" />

          {/* Section 7 */}
          <h2>7. Recommended Patterns</h2>
          <p>The following patterns are safe and encouraged for Loop Mode:</p>

          <h3>7.1 Parametric Loops</h3>
          <p>All motion derived from <code>t</code>:</p>
          <pre className="spec-code"><code>{`function draw() {
  background(240);
  let x = width/2 + sin(t * TWO_PI) * 200;
  let y = height/2 + cos(t * TWO_PI) * 200;
  ellipse(x, y, 80, 80);
}`}</code></pre>

          <h3>7.2 Phase-Driven Motion</h3>
          <p>Multiple objects with phase offsets:</p>
          <pre className="spec-code"><code>{`function draw() {
  background(20);
  for (let i = 0; i < 10; i++) {
    let phase = t + i * 0.1;  // Offset per object
    let y = height/2 + sin(phase * TWO_PI) * 150;
    ellipse(100 + i * 180, y, 40, 40);
  }
}`}</code></pre>

          <h3>7.3 Trigonometric Oscillation</h3>
          <p>Sine and cosine for smooth, periodic motion:</p>
          <pre className="spec-code"><code>{`function draw() {
  background(255);
  let size = 50 + sin(t * TWO_PI * 2) * 30;  // Pulsing
  ellipse(width/2, height/2, size, size);
}`}</code></pre>

          <h3>7.4 Stateless Material Simulation</h3>
          <p>Procedural effects computed per-frame:</p>
          <pre className="spec-code"><code>{`function draw() {
  background(0);
  for (let i = 0; i < 100; i++) {
    let x = noise(i * 0.1, t * 3) * width;
    let y = noise(i * 0.1 + 100, t * 3) * height;
    fill(255, 150);
    ellipse(x, y, 10, 10);
  }
}`}</code></pre>

          <hr className="my-12 border-border" />

          {/* Section 8 */}
          <h2>8. Output and Minting</h2>

          <h3>8.1 Static Mode Output</h3>
          <ul>
            <li>Format: PNG</li>
            <li>Resolution: 1950 x 2400 px</li>
            <li>Capture timing: Immediately after <code>setup()</code> and <code>draw()</code> complete</li>
          </ul>

          <h3>8.2 Loop Mode Output</h3>
          <ul>
            <li>Format: MP4 (H.264) or GIF</li>
            <li>Resolution: 1950 x 2400 px</li>
            <li>Frame rate: 30 FPS</li>
            <li>Duration: 1-4 seconds</li>
            <li>Encoding: Server-side via ffmpeg</li>
          </ul>

          <h3>8.3 Capture Process</h3>
          <p><strong>Static Mode:</strong></p>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li>Execute <code>setup()</code> and <code>draw()</code></li>
            <li>Call <code>canvas.toDataURL('image/png')</code></li>
            <li>Upload to IPFS</li>
            <li>Store CID in NFT metadata as <code>image</code></li>
          </ol>

          <p><strong>Loop Mode:</strong></p>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li>Execute <code>setup()</code> once</li>
            <li>For each frame 0 to N:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Set time variables (<code>t</code>, <code>frameCount</code>, <code>time</code>)</li>
                <li>Execute <code>draw()</code></li>
                <li>Capture frame as PNG blob</li>
              </ul>
            </li>
            <li>Send frames to server for MP4 encoding</li>
            <li>Upload MP4 to IPFS</li>
            <li>Store CID in NFT metadata as <code>animation_url</code></li>
            <li>Store first frame as <code>image</code> (thumbnail)</li>
          </ol>

          <h3>8.4 NFT Metadata Structure</h3>
          <pre className="spec-code"><code>{`{
  "name": "Artwork Title",
  "description": "Created on NexArt",
  "image": "ipfs://Qm.../thumbnail.png",
  "animation_url": "ipfs://Qm.../animation.mp4",
  "attributes": [
    {"trait_type": "Content Type", "value": "Animation"}
  ]
}`}</code></pre>

          <h3>8.5 Why Determinism Matters</h3>
          <p>NFT marketplaces cache and re-render metadata. If output is non-deterministic:</p>
          <ul>
            <li>Thumbnails may differ from actual content</li>
            <li>Regenerated previews may not match minted version</li>
            <li>Provenance verification becomes impossible</li>
          </ul>
          <p>NexArt's deterministic execution guarantees that the minted output is reproducible from the source code.</p>

          <hr className="my-12 border-border" />

          {/* Section 9 */}
          <h2>9. Relationship to AI / LLM Prompts</h2>
          <p>This specification informs AI systems generating NexArt code:</p>

          <h3>9.1 GPT Prompt Integration</h3>
          <p>The NexArt GPT system prompt must include:</p>
          <ul>
            <li>Loop Mode requires <code>draw()</code> function</li>
            <li>Each frame must be self-contained (no accumulation)</li>
            <li>Use <code>t</code> for normalized time [0, 1)</li>
            <li>Avoid <code>random()</code> without deterministic seeding</li>
            <li>All animation must close at <code>t = 1.0</code></li>
          </ul>

          <h3>9.2 Code Generation Constraints</h3>
          <p>AI-generated code must:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li>Include <code>function setup() {"{ ... }"}</code> always</li>
            <li>Include <code>function draw() {"{ ... }"}</code> for animations</li>
            <li>Use <code>background()</code> at start of each <code>draw()</code> call</li>
            <li>Derive all motion from <code>t</code> or <code>frameCount</code></li>
            <li>Avoid forbidden patterns listed in Section 6</li>
          </ol>

          <h3>9.3 Validation Requirements</h3>
          <p>Generated code must pass:</p>
          <ul>
            <li>Syntax validation (no parse errors)</li>
            <li>Function validation (<code>draw()</code> present for Loop Mode)</li>
            <li>Pattern validation (no forbidden async calls)</li>
            <li>Output validation (non-empty canvas)</li>
          </ul>

          <h3>9.4 Error Handling</h3>
          <p>When validation fails, the system must:</p>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li>Reject the code with a specific error message</li>
            <li>Indicate which rule was violated</li>
            <li>Suggest corrective action</li>
          </ol>

          <hr className="my-12 border-border" />

          {/* Appendix A */}
          <h2>Appendix A: Quick Reference</h2>

          <h3>Static Mode Checklist</h3>
          <ul className="spec-checklist">
            <li><code>function setup()</code> defined</li>
            <li><code>noLoop()</code> called in setup</li>
            <li>All rendering in setup or draw</li>
            <li>No async timing functions</li>
          </ul>

          <h3>Loop Mode Checklist</h3>
          <ul className="spec-checklist">
            <li><code>function setup()</code> defined</li>
            <li><code>function draw()</code> defined</li>
            <li><code>background()</code> called in draw</li>
            <li>Motion derived from <code>t</code> or <code>frameCount</code></li>
            <li>Values close at loop boundary</li>
            <li>No accumulation or state persistence</li>
            <li>No <code>noLoop()</code> call</li>
          </ul>

          <h3>Time Variable Reference</h3>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Range</th>
                  <th>Use</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>t</code></td><td>[0.0, 1.0)</td><td>Normalized loop position</td></tr>
                <tr><td><code>time</code></td><td>[0.0, duration)</td><td>Elapsed seconds</td></tr>
                <tr><td><code>frameCount</code></td><td>[0, totalFrames)</td><td>Frame index</td></tr>
              </tbody>
            </table>
          </div>

          <hr className="my-12 border-border" />

          {/* Appendix B */}
          <h2>Appendix B: Version History</h2>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Date</th>
                  <th>Changes</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1.0</td><td>December 2024</td><td>Initial specification</td></tr>
              </tbody>
            </table>
          </div>

          <hr className="my-12 border-border" />

          <p className="text-caption italic text-center mt-16">
            This document is the canonical specification for NexArt Code Mode execution behavior.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default CodeModeExecution;
