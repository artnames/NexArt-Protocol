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
        <title>NexArt Code Mode — Creator's Guide | NexArt Protocol</title>
        <meta
          name="description"
          content="The canonical guide for artists, builders, and AI systems writing NexArt Code Mode sketches. Protocol v1.2.0 · SDK v1.5.1 — LOCKED & STABLE."
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
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <p className="text-xs font-mono text-caption uppercase tracking-wider">
              Creator's Guide
            </p>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-foreground text-background">
              v1.2.0 LOCKED
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
            NexArt Code Mode — Creator's Guide
          </h1>
          <div className="text-body text-sm max-w-2xl mb-6 space-y-1">
            <p className="mb-1">Version: 1.2</p>
            <p className="mb-1">Protocol: NexArt Code Mode Protocol v1.2.0 (LOCKED)</p>
            <p className="mb-1">SDK: @nexart/codemode-sdk v1.5.1</p>
            <p className="mb-1">Status: CURRENT · IMPLEMENTED · ENFORCED</p>
            <p className="mb-1">Reference App: nexart.xyz</p>
            <p className="mb-0">Last Updated: January 2026</p>
          </div>
        </div>
      </div>

      <PageContent>
        {/* Prominent Status Banner */}
        <div className="bg-foreground text-background px-6 py-4 mb-8 -mx-6 sm:-mx-0 sm:mx-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold tracking-wider">CURRENT · IMPLEMENTED · ENFORCED</span>
          </div>
          <p className="text-sm mt-2 mb-0 opacity-90">
            This guide describes the exact behavior enforced by NexArt today. It is the canonical reference for artists, builders, and AI systems.
          </p>
        </div>

        <div className="prose-protocol prose-spec">
          {/* Section 1: Overview */}
          <h2>1. Overview</h2>

          <p>
            Code Mode is a protocol-enforced execution surface for generative art. It provides a controlled environment where artists write code that produces visual output—either a single image (Static Mode) or a looping animation (Loop Mode).
          </p>

          <p>
            Code Mode enforces deterministic constraints to guarantee:
          </p>
          <ul>
            <li><strong>Reproducibility</strong> — identical code produces identical output, always</li>
            <li><strong>Mint safety</strong> — output is suitable for permanent NFT minting</li>
            <li><strong>Cross-browser consistency</strong> — renders identically across all environments</li>
            <li><strong>Provenance verification</strong> — output can be regenerated from source code</li>
          </ul>

          <h3>Why Determinism Matters for NFTs</h3>
          <p>
            NFT marketplaces cache, re-render, and display artwork metadata. If output is non-deterministic, thumbnails may differ from actual content, regenerated previews may not match the minted version, and provenance verification becomes impossible. Code Mode's determinism guarantees that the minted output is reproducible from source code forever.
          </p>

          <h3>Static Mode vs Loop Mode</h3>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Aspect</th>
                  <th>Static Mode</th>
                  <th>Loop Mode</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Output</td><td>PNG image</td><td>MP4 video (or GIF)</td></tr>
                <tr><td>Execution</td><td>Single pass</td><td>Frame-by-frame</td></tr>
                <tr><td>Required functions</td><td><code>setup()</code></td><td><code>setup()</code> + <code>draw()</code></td></tr>
                <tr><td>Time variable</td><td>Not applicable</td><td><code>t</code> (0 → 1)</td></tr>
                <tr><td>Canvas memory</td><td>N/A</td><td>Cleared each frame</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Code Mode and p5.js</h3>
          <p>
            Code Mode syntax resembles p5.js, and many p5.js patterns will work. However, Code Mode is <strong>not</strong> full p5.js. It is a constrained subset designed for deterministic, reproducible generative art. Some p5.js features are intentionally unsupported to ensure protocol compliance.
          </p>

          <div className="border-l-2 border-foreground pl-4 my-6">
            <p className="text-body mb-0">
              This guide describes the exact behavior enforced by NexArt today. Everything documented here is supported and enforced in nexart.xyz.
            </p>
          </div>

          <hr className="my-12 border-border" />

          {/* Section 2: Execution Modes */}
          <h2>2. Execution Modes</h2>

          <h3>2.1 Static Mode</h3>
          <p>Static Mode generates a single image from a one-time code execution.</p>

          <p><strong>Output:</strong> PNG (1950 × 2400 px)</p>

          <p><strong>Required function:</strong></p>
          <pre className="spec-code"><code>{`function setup() {
  // Required. Executes once.
  // All drawing operations occur here.
  noLoop(); // Recommended
  background(255);
  // Your drawing code
}`}</code></pre>

          <p><strong>Optional function:</strong></p>
          <pre className="spec-code"><code>{`function draw() {
  // Optional in Static Mode.
  // Executes once after setup() if defined.
  // Typically left empty or omitted.
}`}</code></pre>

          <p><strong>Execution order:</strong></p>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li>Canvas initialized (1950 × 2400)</li>
            <li><code>setup()</code> executed</li>
            <li><code>draw()</code> executed once (if defined)</li>
            <li>Canvas captured as PNG</li>
            <li>Execution terminated</li>
          </ol>

          <p>The <code>noLoop()</code> call is strongly recommended for Static Mode to explicitly signal single-execution intent.</p>

          <h3>2.2 Loop Mode</h3>
          <p>Loop Mode generates animated content as a sequence of deterministically rendered frames.</p>

          <p><strong>Output:</strong> MP4 (or GIF)</p>

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

          <p><strong>Required functions:</strong></p>
          <pre className="spec-code"><code>{`function setup() {
  // Required. Executes once before frame capture begins.
}

function draw() {
  // REQUIRED in Loop Mode.
  // Executes once per frame.
  // Must produce complete frame output on each call.
  background(255); // Recommended: always call background()
  // Your animation code using t
}`}</code></pre>

          <p><strong>Execution order:</strong></p>
          <pre className="spec-code"><code>{`Frame 0: setup() → draw() → capture
Frame 1: draw() → capture
Frame 2: draw() → capture
...
Frame N: draw() → capture → encode MP4`}</code></pre>

          <p><strong>Mint captures:</strong></p>
          <ul>
            <li>Full animation as MP4 (canonical output)</li>
            <li>Frame 0 as PNG thumbnail</li>
          </ul>

          {/* Critical Warning */}
          <div className="spec-warning">
            <p className="spec-warning-title">WARNING: ACCUMULATION DOES NOT WORK</p>
            <p>Each frame in Loop Mode is rendered in complete isolation. The canvas is cleared before every frame begins.</p>
            <p><strong>NO state persists from one draw() call to the next.</strong></p>
            <p>The following patterns WILL FAIL:</p>
            <ul>
              <li>Alpha-blended backgrounds (<code>background(0, 0, 0, 10)</code>)</li>
              <li>Trail effects via partial transparency</li>
              <li>Particle systems that accumulate over time</li>
              <li>Any effect that depends on "what was drawn before"</li>
            </ul>
            <p>Each <code>draw()</code> call must produce the COMPLETE frame output.</p>
          </div>

          <hr className="my-12 border-border" />

          {/* Section 3: Canvas & Environment */}
          <h2>3. Canvas & Environment</h2>

          <h3>3.1 Canvas Dimensions</h3>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Desktop Width</td><td>1950 px</td></tr>
                <tr><td>Desktop Height</td><td>2400 px</td></tr>
                <tr><td>Mobile Width</td><td>975 px</td></tr>
                <tr><td>Mobile Height</td><td>1200 px</td></tr>
                <tr><td>Aspect Ratio</td><td>13:16</td></tr>
              </tbody>
            </table>
          </div>

          <h3>3.2 Pre-initialized Canvas</h3>
          <p>
            The canvas is pre-initialized before user code execution. <strong>Do not call <code>createCanvas()</code></strong> — the canvas already exists. User code does not control canvas creation.
          </p>
          <p>
            The global variables <code>width</code> and <code>height</code> are available and contain the canvas dimensions.
          </p>

          <h3>3.3 Clean Execution</h3>
          <p>Each execution begins with a clean state:</p>
          <ul>
            <li>No access to <code>window</code>, <code>document</code>, or DOM APIs</li>
            <li>No network requests (<code>fetch</code>, <code>XMLHttpRequest</code>)</li>
            <li>No filesystem access</li>
            <li>No <code>eval()</code> or dynamic code execution</li>
            <li>No state persistence between executions</li>
          </ul>

          <h3>3.4 No State Persistence Between Frames</h3>
          <p>User code MUST NOT rely on state persisting between:</p>
          <ul>
            <li>Separate executions of the same code</li>
            <li>Frame captures in Loop Mode</li>
            <li>Preview runs and final capture</li>
          </ul>

          <hr className="my-12 border-border" />

          {/* Section 4: Authorized Functions */}
          <h2>4. Authorized Functions</h2>
          <p>
            The following functions are implemented and supported in Code Mode. This is an exhaustive list of what is available.
          </p>

          <h3>4.1 Shapes</h3>
          <pre className="spec-code"><code>{`ellipse(x, y, w, h)
circle(x, y, d)
rect(x, y, w, h)
square(x, y, s)
triangle(x1, y1, x2, y2, x3, y3)
quad(x1, y1, x2, y2, x3, y3, x4, y4)
line(x1, y1, x2, y2)
point(x, y)
arc(x, y, w, h, start, stop)`}</code></pre>

          <h3>4.2 Curves</h3>
          <pre className="spec-code"><code>{`beginShape()
endShape()
endShape(CLOSE)
vertex(x, y)
curveVertex(x, y)
bezierVertex(x2, y2, x3, y3, x4, y4)
bezier(x1, y1, x2, y2, x3, y3, x4, y4)
curve(x1, y1, x2, y2, x3, y3, x4, y4)`}</code></pre>

          <h3>4.3 Style & Color</h3>
          <pre className="spec-code"><code>{`background(v)
background(r, g, b)
background(r, g, b, a)
fill(v)
fill(r, g, b)
fill(r, g, b, a)
noFill()
stroke(v)
stroke(r, g, b)
stroke(r, g, b, a)
noStroke()
strokeWeight(w)
strokeCap(mode)     // ROUND, SQUARE, PROJECT
strokeJoin(mode)    // MITER, BEVEL, ROUND
colorMode(mode)     // RGB, HSB
colorMode(mode, max)
colorMode(mode, max1, max2, max3)
colorMode(mode, max1, max2, max3, maxA)
color(v)
color(r, g, b)
color(r, g, b, a)
lerpColor(c1, c2, amt)
red(c)
green(c)
blue(c)
alpha(c)
hue(c)
saturation(c)
brightness(c)`}</code></pre>

          <h3>4.4 Transforms</h3>
          <pre className="spec-code"><code>{`push()
pop()
translate(x, y)
rotate(angle)
scale(s)
scale(sx, sy)
shearX(angle)
shearY(angle)
resetMatrix()`}</code></pre>

          <h3>4.5 Random (Seeded)</h3>
          <pre className="spec-code"><code>{`random()
random(max)
random(min, max)
random(array)
randomSeed(seed)
randomGaussian()
randomGaussian(mean, sd)`}</code></pre>
          <p>
            <strong>Important:</strong> For consistent randomness across frames in Loop Mode, use <code>randomSeed()</code> at the start of <code>draw()</code> with a fixed seed.
          </p>

          <h3>4.6 Noise (Seeded)</h3>
          <pre className="spec-code"><code>{`noise(x)
noise(x, y)
noise(x, y, z)
noiseDetail(lod)
noiseDetail(lod, falloff)
noiseSeed(seed)`}</code></pre>

          <h3>4.7 Math Utilities</h3>
          <pre className="spec-code"><code>{`// Constants
PI, TWO_PI, HALF_PI, QUARTER_PI, TAU

// Functions
abs(n)
ceil(n)
floor(n)
round(n)
sqrt(n)
pow(n, e)
exp(n)
log(n)
sq(n)
min(a, b)
max(a, b)
constrain(n, low, high)
map(value, start1, stop1, start2, stop2)
norm(value, start, stop)
lerp(start, stop, amt)
dist(x1, y1, x2, y2)
mag(x, y)

// Trigonometry
sin(angle)
cos(angle)
tan(angle)
asin(value)
acos(value)
atan(value)
atan2(y, x)
degrees(radians)
radians(degrees)`}</code></pre>

          <h3>4.8 Text</h3>
          <pre className="spec-code"><code>{`text(str, x, y)
textSize(size)
textFont(font)
textAlign(horizAlign)
textAlign(horizAlign, vertAlign)  // CENTER, LEFT, RIGHT, TOP, BOTTOM
textWidth(str)
textAscent()
textDescent()`}</code></pre>

          <h3>4.9 Pixels</h3>
          <pre className="spec-code"><code>{`loadPixels()
updatePixels()
get(x, y)
get(x, y, w, h)
set(x, y, c)
pixels[]  // Array of pixel values`}</code></pre>

          <h3>4.10 Other Utilities</h3>
          <pre className="spec-code"><code>{`noLoop()           // Static Mode only
loop()             // Resume draw loop
frameRate(fps)     // Query only, cannot change from 30
print(value)       // Console output (debugging only)
println(value)`}</code></pre>

          <div className="border border-border bg-muted/30 p-6 my-8">
            <p className="font-medium text-foreground mb-2">Note on Missing Features</p>
            <p className="text-body text-sm mb-2">
              Some p5.js features are intentionally unsupported to ensure determinism and protocol compliance:
            </p>
            <ul className="text-body text-sm mb-0 space-y-1">
              <li>Image loading (<code>loadImage()</code>, <code>image()</code>)</li>
              <li>Font loading (<code>loadFont()</code>)</li>
              <li>Sound and audio APIs</li>
              <li>Video capture</li>
              <li>WebGL mode</li>
              <li>DOM manipulation</li>
            </ul>
          </div>

          <div className="border border-border bg-muted/30 p-6 my-8">
            <p className="font-medium text-foreground mb-2">Note on Constants</p>
            <p className="text-body text-sm mb-0">
              Some p5.js constants (e.g., <code>MULTIPLY</code>, <code>HSB</code>) are not assumed globals and must be accessed via their respective functions. For example, use <code>colorMode(HSB)</code> rather than expecting <code>HSB</code> to be a global constant.
            </p>
          </div>

          <hr className="my-12 border-border" />

          {/* Section 5: Forbidden Patterns */}
          <h2>5. Forbidden Patterns</h2>
          <p>The following patterns trigger protocol errors or produce incorrect output. All are explicitly forbidden.</p>

          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>Reason</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>setTimeout()</code></td><td>Async timing breaks determinism</td><td>Protocol violation</td></tr>
                <tr><td><code>setInterval()</code></td><td>Async timing breaks determinism</td><td>Protocol violation</td></tr>
                <tr><td><code>requestAnimationFrame()</code></td><td>Bypasses controlled execution</td><td>Protocol violation</td></tr>
                <tr><td><code>fetch()</code></td><td>External IO forbidden</td><td>Protocol violation</td></tr>
                <tr><td><code>XMLHttpRequest</code></td><td>External IO forbidden</td><td>Protocol violation</td></tr>
                <tr><td>DOM access</td><td>No access to document/window</td><td>Protocol violation</td></tr>
                <tr><td><code>createCanvas()</code></td><td>Canvas is pre-initialized</td><td>Protocol violation</td></tr>
                <tr><td><code>noLoop()</code> in Loop Mode</td><td>Incompatible with animation capture</td><td>Validation error</td></tr>
                <tr><td><code>while(true)</code></td><td>Infinite loops block execution</td><td>Timeout error</td></tr>
                <tr><td>Unseeded <code>random()</code></td><td>Non-deterministic output</td><td>Jittery animation</td></tr>
                <tr><td>Canvas accumulation</td><td>Frames are isolated</td><td>Missing trails/effects</td></tr>
                <tr><td>Alpha-fade backgrounds</td><td>No canvas persistence</td><td>Effects don't work</td></tr>
              </tbody>
            </table>
          </div>

          <h3>5.1 Accumulation (Forbidden)</h3>
          <pre className="spec-code"><code>{`// ❌ FORBIDDEN: Relies on canvas persistence
function draw() {
  // No background() call - expects previous content to remain
  ellipse(random(width), random(height), 10, 10);
}
// Failure: Only final frame content appears; no accumulation`}</code></pre>

          <h3>5.2 Alpha Fading (Forbidden)</h3>
          <pre className="spec-code"><code>{`// ❌ FORBIDDEN: Semi-transparent background for trail effect
function draw() {
  background(0, 0, 0, 20);  // Does NOT create trails in Loop Mode
  ellipse(x, y, 50, 50);
}
// Failure: Solid background with no fading effect`}</code></pre>

          <h3>5.3 Undeterministic Random (Forbidden)</h3>
          <pre className="spec-code"><code>{`// ❌ FORBIDDEN: Random without seeding
function draw() {
  let x = random(width);  // Different each frame = jerky motion
  ellipse(x, height/2, 50, 50);
}`}</code></pre>

          <h3>5.4 Stateful Globals (Forbidden)</h3>
          <pre className="spec-code"><code>{`// ❌ FORBIDDEN: Globals that accumulate state
let particles = [];

function draw() {
  particles.push({x: random(width), y: 0});
  for (let p of particles) {
    ellipse(p.x, p.y, 5, 5);
  }
}
// Failure: State is not preserved between frames`}</code></pre>

          <h3>5.5 Frame-Rate Dependent Logic (Forbidden)</h3>
          <pre className="spec-code"><code>{`// ❌ FORBIDDEN: Position depends on frame count accumulation
let x = 0;
function draw() {
  x += 2;  // Assumes state persists
  ellipse(x, height/2, 50, 50);
}`}</code></pre>

          <hr className="my-12 border-border" />

          {/* Section 6: VAR Protocol Variables */}
          <h2>6. VAR Protocol Variables</h2>
          <p>
            VAR is an optional parameter system that allows external input to influence artwork output while maintaining determinism.
          </p>

          <h3>6.1 Specification</h3>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Input length</td><td>0–10 values</td></tr>
                <tr><td>Runtime length</td><td>Always 10 (padded with 0s)</td></tr>
                <tr><td>Value range</td><td>0–100</td></tr>
                <tr><td>Access mode</td><td>Read-only</td></tr>
                <tr><td>Write behavior</td><td>Throws error</td></tr>
              </tbody>
            </table>
          </div>

          <h3>6.2 Usage</h3>
          <pre className="spec-code"><code>{`function setup() {
  noLoop();
  background(255);
  
  // VAR[0] controls circle size (0-100 → 50-200)
  let size = map(VAR[0], 0, 100, 50, 200);
  ellipse(width/2, height/2, size, size);
}

function draw() {
  background(255);
  
  // VAR[1] controls rotation speed
  let speed = map(VAR[1], 0, 100, 1, 5);
  let angle = t * TWO_PI * speed;
  
  translate(width/2, height/2);
  rotate(angle);
  rect(-50, -50, 100, 100);
}`}</code></pre>

          <h3>6.3 Default Behavior</h3>
          <ul>
            <li>If fewer than 10 values are provided, remaining slots default to 0</li>
            <li>If no VAR is provided, all 10 values are 0</li>
            <li>VAR is optional — sketches work without referencing it</li>
          </ul>

          <h3>6.4 Mapping Examples</h3>
          <pre className="spec-code"><code>{`// VAR[0] (0-100) → size (10-500)
let size = map(VAR[0], 0, 100, 10, 500);

// VAR[1] (0-100) → color hue (0-360)
let hue = map(VAR[1], 0, 100, 0, 360);

// VAR[2] (0-100) → boolean threshold
let showElement = VAR[2] > 50;

// VAR[3] (0-100) → number of elements (1-20)
let count = floor(map(VAR[3], 0, 100, 1, 20));`}</code></pre>

          <div className="border border-border bg-muted/30 p-6 my-8">
            <p className="font-medium text-foreground mb-2">VAR is Optional</p>
            <p className="text-body text-sm mb-0">
              You do not need to use VAR. Many artworks work perfectly without any external parameters. VAR is available for artists who want collector-controlled variation.
            </p>
          </div>

          <hr className="my-12 border-border" />

          {/* Section 7: Time & Animation */}
          <h2>7. Time & Animation</h2>
          <p>
            Loop Mode provides time variables for animation. Understanding these is essential for creating smooth, looping animations.
          </p>

          <h3>7.1 Time Variables</h3>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Type</th>
                  <th>Range</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>t</code></td><td>float</td><td>[0.0, 1.0)</td><td>Normalized loop position (preferred)</td></tr>
                <tr><td><code>frameCount</code></td><td>integer</td><td>[0, totalFrames)</td><td>Current frame number</td></tr>
                <tr><td><code>time</code></td><td>float</td><td>[0.0, duration)</td><td>Elapsed time in seconds</td></tr>
                <tr><td><code>tGlobal</code></td><td>float</td><td>[0.0, 1.0)</td><td>Alias for <code>t</code></td></tr>
              </tbody>
            </table>
          </div>

          <h3>7.2 How t is Calculated</h3>
          <pre className="spec-code"><code>{`t = frameCount / totalFrames  // Range [0.0, 1.0)
time = t * durationSeconds    // Range [0.0, duration)`}</code></pre>

          <p>
            For a 2-second loop at 30 FPS (60 total frames):
          </p>
          <ul>
            <li>Frame 0: <code>t = 0.0</code></li>
            <li>Frame 30: <code>t = 0.5</code></li>
            <li>Frame 59: <code>t ≈ 0.983</code></li>
          </ul>

          <h3>7.3 Why t is Preferred</h3>
          <p>
            Using <code>t</code> ensures your animation works correctly regardless of duration or frame rate. Motion derived from <code>t</code> is automatically normalized to complete exactly one cycle per loop.
          </p>

          <pre className="spec-code"><code>{`// ✅ CORRECT: Use t for normalized motion
function draw() {
  background(255);
  let x = width/2 + sin(t * TWO_PI) * 200;
  ellipse(x, height/2, 50, 50);
}

// ❌ AVOID: frameCount without normalization
function draw() {
  background(255);
  let x = width/2 + sin(frameCount * 0.1) * 200;  // May not loop cleanly
  ellipse(x, height/2, 50, 50);
}`}</code></pre>

          <h3>7.4 Building Perfect Loops</h3>
          <p>
            A perfect loop requires the animation to return exactly to its starting state. The value at <code>t = 0.0</code> must equal the value at <code>t = 1.0</code>.
          </p>

          <p><strong>Oscillation (sine wave):</strong></p>
          <pre className="spec-code"><code>{`function draw() {
  background(255);
  let phase = t * TWO_PI;  // Full cycle over loop duration
  let x = width/2 + cos(phase) * 100;
  let y = height/2 + sin(phase) * 100;
  ellipse(x, y, 50, 50);
}`}</code></pre>

          <p><strong>Rotation:</strong></p>
          <pre className="spec-code"><code>{`function draw() {
  background(255);
  let angle = t * TWO_PI;  // Full rotation
  translate(width/2, height/2);
  rotate(angle);
  rect(-50, -50, 100, 100);
}`}</code></pre>

          <p><strong>Multiple cycles per loop:</strong></p>
          <pre className="spec-code"><code>{`let cycles = 3;  // Complete 3 cycles per loop
let phase = (t * cycles) % 1.0;
// or
let angle = t * TWO_PI * cycles;`}</code></pre>

          <h3>7.5 Why Frame-Based State Fails</h3>
          <p>
            In Code Mode, each frame is computed independently. There is no "previous frame" to reference. Patterns that rely on incrementing state fail because:
          </p>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-body">
            <li>Variables are reset between frames</li>
            <li>Global state does not persist</li>
            <li>Each <code>draw()</code> call starts from scratch</li>
          </ol>

          <pre className="spec-code"><code>{`// ❌ FAILS: x resets to 0 each frame
let x = 0;
function draw() {
  x += 2;  // x is always 2
  ellipse(x, height/2, 50, 50);
}

// ✅ WORKS: x derived from t
function draw() {
  let x = t * width;  // x goes from 0 to width
  ellipse(x, height/2, 50, 50);
}`}</code></pre>

          <hr className="my-12 border-border" />

          {/* Section 8: Primitives (UI Helpers) */}
          <h2>8. Primitives (UI Helpers)</h2>
          <p>
            NexArt provides declarative primitives as UI helpers. These are <strong>non-canonical</strong>—they always compile down to Code Mode for execution. Primitives do not affect protocol authority; they are convenience tools.
          </p>

          <div className="border border-border bg-muted/30 p-6 my-8">
            <p className="font-medium text-foreground mb-2">Important Distinction</p>
            <p className="text-body text-sm mb-0">
              Primitives exist in the NexArt UI for convenience. They compile to Code Mode before execution. The canonical output is always produced by the Code Mode runtime. Primitives are not part of the protocol specification.
            </p>
          </div>

          <h3>Primitive Categories</h3>
          <p>The following primitives are available in the NexArt UI, grouped by category:</p>

          <h4>Shapes</h4>
          <ul className="text-body space-y-1">
            <li>Circle, Ellipse, Rectangle, Square</li>
            <li>Triangle, Polygon, Line, Point</li>
            <li>Arc, Ring, Star</li>
          </ul>

          <h4>Curves & Paths</h4>
          <ul className="text-body space-y-1">
            <li>Bezier, Quadratic Curve</li>
            <li>Spline, Path</li>
          </ul>

          <h4>Patterns & Grids</h4>
          <ul className="text-body space-y-1">
            <li>Grid, Radial Grid</li>
            <li>Dots Pattern, Lines Pattern</li>
            <li>Noise Field</li>
          </ul>

          <h4>Transforms</h4>
          <ul className="text-body space-y-1">
            <li>Rotate, Scale, Translate</li>
            <li>Mirror, Kaleidoscope</li>
          </ul>

          <h4>Animation (Loop Mode)</h4>
          <ul className="text-body space-y-1">
            <li>Oscillate, Pulse</li>
            <li>Orbit, Spiral</li>
            <li>Wave, Breathe</li>
          </ul>

          <h4>Color & Style</h4>
          <ul className="text-body space-y-1">
            <li>Gradient, Color Palette</li>
            <li>Blend, Opacity</li>
          </ul>

          <hr className="my-12 border-border" />

          {/* Section 9: Best Practices */}
          <h2>9. Best Practices</h2>

          <h3>9.1 Static Mode Checklist</h3>
          <ul className="spec-checklist">
            <li>Define <code>function setup()</code></li>
            <li>Call <code>noLoop()</code> in setup</li>
            <li>Call <code>background()</code> at start of setup</li>
            <li>Complete all rendering in setup (or single draw call)</li>
            <li>Avoid async timing functions</li>
            <li>Seed randomness if using <code>random()</code></li>
          </ul>

          <h3>9.2 Loop Mode Checklist</h3>
          <ul className="spec-checklist">
            <li>Define <code>function setup()</code></li>
            <li>Define <code>function draw()</code></li>
            <li>Call <code>background()</code> at start of draw</li>
            <li>Derive all motion from <code>t</code></li>
            <li>Ensure values close at loop boundary (<code>t=0</code> equals <code>t=1</code>)</li>
            <li>Do NOT call <code>noLoop()</code></li>
            <li>Do NOT rely on accumulation or state persistence</li>
            <li>Use <code>randomSeed()</code> if using <code>random()</code></li>
          </ul>

          <h3>9.3 Performance Tips</h3>
          <ul>
            <li>Minimize calculations inside loops</li>
            <li>Pre-calculate values in <code>setup()</code> when possible</li>
            <li>Use <code>push()</code> and <code>pop()</code> to manage transform state</li>
            <li>Limit particle counts and complex geometries</li>
            <li>Test on mobile dimensions (975 × 1200)</li>
          </ul>

          <h3>9.4 Color Usage Guidance</h3>
          <ul>
            <li>Use <code>colorMode(HSB)</code> for intuitive color control</li>
            <li>For cycling hues: <code>hue = (t * 360) % 360</code></li>
            <li>For smooth gradients: <code>lerpColor(c1, c2, amt)</code></li>
            <li>Remember to reset color mode if switching between HSB and RGB</li>
          </ul>

          <h3>9.5 Determinism Tips</h3>
          <ul>
            <li>Always seed randomness with <code>randomSeed()</code> or <code>noiseSeed()</code></li>
            <li>Derive all animated values from <code>t</code>, not from accumulated state</li>
            <li>Avoid browser-specific rendering (test across devices)</li>
            <li>Do not rely on execution timing—use discrete frame stepping</li>
          </ul>

          <hr className="my-12 border-border" />

          {/* Section 10: Common Mistakes */}
          <h2>10. Common Mistakes</h2>

          <h3>10.1 Missing background() in Loop Mode</h3>
          <p><strong>Symptom:</strong> Black or transparent frames, or visual artifacts.</p>
          <pre className="spec-code"><code>{`// ❌ INCORRECT
function draw() {
  ellipse(width/2, height/2, 100, 100);
}

// ✅ CORRECT
function draw() {
  background(255);  // Always call background
  ellipse(width/2, height/2, 100, 100);
}`}</code></pre>

          <h3>10.2 Using Math.random()</h3>
          <p><strong>Symptom:</strong> Output differs between runs; non-deterministic results.</p>
          <pre className="spec-code"><code>{`// ❌ INCORRECT
function setup() {
  let x = Math.random() * width;  // Not seeded
}

// ✅ CORRECT
function setup() {
  randomSeed(42);
  let x = random(width);  // Seeded and deterministic
}`}</code></pre>

          <h3>10.3 Expecting Accumulation</h3>
          <p><strong>Symptom:</strong> Trails, fades, or particles disappear; only current frame visible.</p>
          <pre className="spec-code"><code>{`// ❌ INCORRECT: Expects canvas memory
function draw() {
  fill(255, 50);
  ellipse(random(width), random(height), 10);
}

// ✅ CORRECT: Compute trails explicitly
function draw() {
  background(0);
  for (let i = 0; i < 20; i++) {
    let age = i / 20;
    let alpha = 255 * (1 - age);
    let pastT = t - age * 0.1;
    let x = width/2 + sin(pastT * TWO_PI) * 200;
    let y = height/2 + cos(pastT * TWO_PI) * 200;
    fill(255, alpha);
    ellipse(x, y, 20);
  }
}`}</code></pre>

          <h3>10.4 Alpha Fading Backgrounds</h3>
          <p><strong>Symptom:</strong> Expected motion blur or trails don't appear.</p>
          <pre className="spec-code"><code>{`// ❌ INCORRECT: Alpha background for trails
function draw() {
  background(0, 0, 0, 20);  // Does nothing in Code Mode
  ellipse(mouseX, mouseY, 50);
}

// ✅ CORRECT: Compute motion trail explicitly
function draw() {
  background(0);
  for (let i = 10; i >= 0; i--) {
    let alpha = map(i, 10, 0, 50, 255);
    let offset = i * 0.02;
    let x = width/2 + sin((t - offset) * TWO_PI) * 200;
    fill(255, alpha);
    ellipse(x, height/2, 50);
  }
}`}</code></pre>

          <h3>10.5 Non-Closing Animations</h3>
          <p><strong>Symptom:</strong> Visible jump when animation loops.</p>
          <pre className="spec-code"><code>{`// ❌ INCORRECT: Linear motion doesn't close
function draw() {
  background(255);
  let x = t * width;  // Jumps from right to left
  ellipse(x, height/2, 50);
}

// ✅ CORRECT: Circular motion closes naturally
function draw() {
  background(255);
  let x = width/2 + sin(t * TWO_PI) * 200;  // Returns to start
  ellipse(x, height/2, 50);
}`}</code></pre>

          <h3>10.6 VAR Misuse</h3>
          <p><strong>Symptom:</strong> Errors when trying to modify VAR.</p>
          <pre className="spec-code"><code>{`// ❌ INCORRECT: Trying to write to VAR
VAR[0] = 50;  // Throws error

// ✅ CORRECT: Read VAR, map to your range
let size = map(VAR[0], 0, 100, 10, 200);`}</code></pre>

          <hr className="my-12 border-border" />

          {/* Section 11: Examples */}
          <h2>11. Examples</h2>
          <p>The following examples are valid, protocol-correct sketches that run in nexart.xyz and mint without errors.</p>

          <h3>11.1 Static Pattern</h3>
          <pre className="spec-code"><code>{`function setup() {
  noLoop();
  background(245);
  
  randomSeed(12345);
  
  let gridSize = 50;
  for (let x = gridSize; x < width - gridSize; x += gridSize) {
    for (let y = gridSize; y < height - gridSize; y += gridSize) {
      push();
      translate(x, y);
      rotate(random(TWO_PI));
      
      stroke(0);
      strokeWeight(2);
      noFill();
      
      if (random() > 0.5) {
        line(-15, -15, 15, 15);
      } else {
        line(-15, 15, 15, -15);
      }
      pop();
    }
  }
}`}</code></pre>

          <h3>11.2 Perfect Loop Animation</h3>
          <pre className="spec-code"><code>{`function setup() {
  // Setup runs once
}

function draw() {
  background(20);
  
  let numCircles = 12;
  for (let i = 0; i < numCircles; i++) {
    let angle = (i / numCircles) * TWO_PI;
    let phaseOffset = i * 0.1;
    
    let radius = 300 + sin((t + phaseOffset) * TWO_PI) * 100;
    let x = width/2 + cos(angle) * radius;
    let y = height/2 + sin(angle) * radius;
    
    let size = 40 + sin((t + phaseOffset) * TWO_PI * 2) * 20;
    
    fill(255, 200);
    noStroke();
    ellipse(x, y, size);
  }
}`}</code></pre>

          <h3>11.3 VAR-Controlled Sketch</h3>
          <pre className="spec-code"><code>{`function setup() {
  noLoop();
  
  // VAR[0]: Background brightness (0-100 → 0-255)
  let bg = map(VAR[0], 0, 100, 0, 255);
  background(bg);
  
  // VAR[1]: Number of shapes (0-100 → 5-50)
  let count = floor(map(VAR[1], 0, 100, 5, 50));
  
  // VAR[2]: Shape size (0-100 → 20-200)
  let size = map(VAR[2], 0, 100, 20, 200);
  
  // VAR[3]: Color hue (0-100 → 0-360)
  colorMode(HSB, 360, 100, 100);
  let hue = map(VAR[3], 0, 100, 0, 360);
  
  randomSeed(42);
  
  for (let i = 0; i < count; i++) {
    let x = random(width);
    let y = random(height);
    fill(hue, 80, 90);
    noStroke();
    ellipse(x, y, size);
  }
}`}</code></pre>

          <h3>11.4 Noise-Based Animation</h3>
          <pre className="spec-code"><code>{`function setup() {
  noiseSeed(123);
}

function draw() {
  background(0);
  
  let cols = 30;
  let rows = 40;
  let cellW = width / cols;
  let cellH = height / rows;
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * cellW + cellW/2;
      let y = j * cellH + cellH/2;
      
      let n = noise(i * 0.1, j * 0.1, t * 2);
      let size = n * cellW * 0.9;
      
      let brightness = n * 255;
      fill(brightness);
      noStroke();
      ellipse(x, y, size);
    }
  }
}`}</code></pre>

          <h3>11.5 Geometry-Driven Loop</h3>
          <pre className="spec-code"><code>{`function setup() {
  // Setup runs once
}

function draw() {
  background(255);
  translate(width/2, height/2);
  
  let sides = 6;
  let layers = 8;
  
  for (let layer = 0; layer < layers; layer++) {
    let radius = 100 + layer * 80;
    let rotation = t * TWO_PI + layer * 0.2;
    
    push();
    rotate(rotation);
    
    stroke(0);
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let i = 0; i < sides; i++) {
      let angle = (i / sides) * TWO_PI;
      let x = cos(angle) * radius;
      let y = sin(angle) * radius;
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }
}`}</code></pre>

          <hr className="my-12 border-border" />

          {/* Final Note */}
          <div className="border-t border-border mt-12 pt-8">
            <p className="text-caption text-center">
              This guide is the canonical reference for NexArt Code Mode. It describes exact behavior enforced in nexart.xyz under Protocol v1.0.0.
            </p>
            <p className="text-caption text-center text-sm mt-4">
              For questions or clarifications, see{" "}
              <Link to="/how-code-mode-thinks" className="underline hover:text-foreground">How Code Mode Thinks</Link>,{" "}
              <Link to="/common-code-mode-mistakes" className="underline hover:text-foreground">Common Mistakes</Link>, or{" "}
              <Link to="/code-mode-quick-reference" className="underline hover:text-foreground">Quick Reference</Link>.
            </p>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default CodeModeExecution;
