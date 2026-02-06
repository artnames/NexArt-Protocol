import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const CommonCodeModeMistakes = () => {
  return (
    <PageLayout>
      <SEOHead 
        title="Common Code Mode Mistakes"
        description="Diagnose why your artwork behaves unexpectedly in NexArt Code Mode. Understand failure patterns and learn the mental shifts to fix them."
      />
      
      <PageHeader
        title="Common Code Mode Mistakes (and Why They Happen)"
        subtitle="A diagnostic guide for artists encountering unexpected behavior."
      />
      
      <PageContent>
        {/* Context Banner */}
        <div className="border border-border bg-muted/30 px-6 py-4 mb-8">
          <p className="text-sm text-body mb-2">
            These issues are not bugs. They are the result of how Code Mode executes today in nexart.xyz.
          </p>
          <p className="text-sm text-caption mb-0">
            See also:{" "}
            <Link to="/how-code-mode-thinks" className="text-foreground underline underline-offset-2 hover:text-body">
              How Code Mode Thinks
            </Link>
            {" · "}
            <Link to="/code-mode-execution" className="text-foreground underline underline-offset-2 hover:text-body">
              Runtime Execution Specification
            </Link>
          </p>
        </div>

        <div className="prose-protocol">
          {/* Mistake 1 */}
          <h2>1. "My artwork appears once, then disappears"</h2>
          
          <h3>Symptom</h3>
          <p>
            The artwork renders correctly on the first frame, but subsequent frames show 
            only the background—or nothing at all. The shapes, lines, or images you drew 
            are gone.
          </p>
          
          <h3>Why This Happens</h3>
          <p>
            In Loop Mode, each frame is rendered in complete isolation. The canvas is 
            cleared before every frame begins. Whatever you drew on frame 1 does not 
            persist to frame 2.
          </p>
          <p>
            If your drawing logic only runs once (for example, inside a condition like 
            <code>if (frameCount === 1)</code>), the artwork appears on the first frame 
            and vanishes thereafter. The subsequent frames execute, but they draw nothing 
            new—leaving only the background.
          </p>
          
          <h3>How to Think Instead</h3>
          <p>
            Every frame must redraw everything. There is no persistence. Your 
            <code>draw()</code> function should contain all the logic needed to render 
            the complete image for any given value of <code>t</code>.
          </p>

          {/* Mistake 2 */}
          <h2>2. "My animation fades to black"</h2>
          
          <h3>Symptom</h3>
          <p>
            You expected a trail or fade effect, but instead the animation gradually 
            dims and eventually becomes completely black or barely visible.
          </p>
          
          <h3>Why This Happens</h3>
          <p>
            A common technique in creative coding is to draw a semi-transparent background 
            each frame, allowing previous frames to "show through" and create motion trails. 
            This works because the previous pixels remain on the canvas.
          </p>
          <p>
            In Code Mode, the canvas is cleared before each frame. There are no previous 
            pixels. When you draw a semi-transparent background, you are drawing it over 
            nothing—so all you see is a dim background with your current-frame elements 
            on top.
          </p>
          
          <div className="border-l-2 border-foreground pl-4 my-6">
            <p className="text-body mb-0">
              This is different from p5.js running in a browser, where the canvas 
              retains its contents between frames by default.
            </p>
          </div>
          
          <h3>How to Think Instead</h3>
          <p>
            Trails and fades must be computed, not accumulated. If you want an object to 
            leave a trail, draw the trail explicitly by calculating where the object was 
            at previous moments in the cycle and rendering those positions with decreasing 
            opacity.
          </p>

          {/* Mistake 3 */}
          <h2>3. "My animation jitters or feels random"</h2>
          
          <h3>Symptom</h3>
          <p>
            Elements jump erratically between frames. Motion that should be smooth appears 
            chaotic. Colors or positions seem to change unpredictably.
          </p>
          
          <h3>Why This Happens</h3>
          <p>
            If you use <code>random()</code> without seeding it consistently, you get 
            different random values on each frame. Since each frame is independent, 
            there is no continuity—positions computed with <code>random()</code> will 
            be different every time <code>draw()</code> runs.
          </p>
          <p>
            This is the difference between randomness and motion. Randomness produces 
            uncorrelated values. Motion requires correlated values that change smoothly 
            over time.
          </p>
          
          <h3>How to Think Instead</h3>
          <p>
            For smooth motion, derive values from <code>t</code> using periodic functions 
            like sine and cosine. For consistent randomness (same random values each frame), 
            use <code>randomSeed()</code> with a fixed seed at the start of <code>draw()</code>.
          </p>

          {/* Mistake 4 */}
          <h2>4. "Trails don't work"</h2>
          
          <h3>Symptom</h3>
          <p>
            You expected objects to leave trails behind them as they move, but each frame 
            shows only the current position with no history.
          </p>
          
          <h3>Why This Happens</h3>
          <p>
            There is no previous frame. Each frame is computed from scratch with a blank 
            canvas. The concept of "leaving something behind" has no meaning when nothing 
            persists.
          </p>
          
          <h3>How to Think Instead</h3>
          <p>
            Trails must be recomputed, not remembered. For each frame, calculate where 
            the object is now, where it was a moment ago, where it was two moments ago, 
            and so on—then draw all of those positions. The trail is not a memory; it is 
            a calculation.
          </p>

          {/* Mistake 5 */}
          <h2>5. "Only one frame gets minted"</h2>
          
          <h3>Symptom</h3>
          <p>
            You expected a looping animation, but the minted NFT is a single static image.
          </p>
          
          <h3>Why This Happens</h3>
          <p>
            Code Mode has two distinct execution modes: Static and Loop. If your work is 
            set to Static Mode, only <code>setup()</code> runs. The <code>draw()</code> 
            function, if present, is ignored entirely.
          </p>
          <p>
            The output is captured as a single PNG image, not a video. Your animation 
            logic never executes.
          </p>
          
          <h3>How to Think Instead</h3>
          <p>
            Verify which mode your work is set to before minting. If you intend to create 
            an animation, ensure Loop Mode is selected. If you see a single frame, check 
            the mode setting first—before debugging your code.
          </p>

          {/* Mistake 6 */}
          <h2>6. "My loop doesn't close cleanly"</h2>
          
          <h3>Symptom</h3>
          <p>
            The animation has a visible jump or stutter when it loops. The end does not 
            match the beginning.
          </p>
          
          <h3>Why This Happens</h3>
          <p>
            A perfect loop requires the final frame to be visually identical to the first 
            frame. If your motion is linear (moving steadily in one direction) or if your 
            cycle does not complete exactly as <code>t</code> goes from 0 to 1, there will 
            be a discontinuity.
          </p>
          <p>
            Linear motion—like <code>x = t * width</code>—starts at the left edge and ends 
            at the right edge. When the loop restarts, the object jumps from right back to 
            left.
          </p>
          
          <h3>How to Think Instead</h3>
          <p>
            Use cyclical functions. Sine and cosine naturally return to their starting 
            values. <code>sin(t * TWO_PI)</code> starts at 0, rises, falls, and returns 
            exactly to 0. Design motion that completes a full cycle within the loop duration.
          </p>

          {/* Mistake 7 */}
          <h2>7. "It works locally but not when minted"</h2>
          
          <h3>Symptom</h3>
          <p>
            The artwork looks correct in the preview, but the minted version behaves 
            differently—colors are off, timing is wrong, or elements appear in 
            unexpected places.
          </p>
          
          <h3>Why This Happens</h3>
          <p>
            NexArt enforces deterministic capture. The minted output must be identical 
            across all renderers, now and forever. This means the mint environment may 
            be stricter than your local preview.
          </p>
          <p>
            Possible causes include:
          </p>
          <ul>
            <li>Relying on system time instead of <code>t</code></li>
            <li>Using unseeded randomness that differs between runs</li>
            <li>Depending on browser-specific rendering behavior</li>
            <li>Assuming a specific canvas size that differs in the capture environment</li>
          </ul>
          
          <h3>How to Think Instead</h3>
          <p>
            Your code must produce identical output regardless of when, where, or how 
            it is executed. Use only the provided time variable (<code>t</code>), seed 
            all randomness, and avoid any dependency on external state. The preview is 
            a convenience; the mint is the truth.
          </p>

          {/* Closing Section */}
          <div className="border-t border-border mt-12 pt-8">
            <p className="text-body">
              If your work behaves differently than expected, it is usually a mismatch 
              between expectation and execution—not an error in your idea. Code Mode 
              has clear rules; once you internalize them, the behavior becomes predictable.
            </p>
            
            <h3>Further Reading</h3>
            <ul>
              <li>
                <Link to="/how-code-mode-thinks" className="text-foreground underline underline-offset-2 hover:text-body">
                  How Code Mode Thinks
                </Link>
                {" "}— the conceptual model behind Code Mode execution
              </li>
              <li>
                <Link to="/code-mode-execution" className="text-foreground underline underline-offset-2 hover:text-body">
                  Runtime Execution Specification
                </Link>
                {" "}— the authoritative technical specification
              </li>
            </ul>
            
            <p className="text-caption text-sm mt-8">
              For the proposed future protocol language, see{" "}
              <Link to="/code-mode-v1" className="text-foreground underline underline-offset-2 hover:text-caption">
                Code Mode v1 (GSL Draft)
              </Link>.
            </p>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default CommonCodeModeMistakes;
