import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const HowCodeModeThinks = () => {
  return (
    <PageLayout>
      <SEOHead 
        title="How Code Mode Thinks"
        description="A conceptual guide for artists to understand how NexArt Code Mode executes, predict artwork behavior, and write correct generative sketches from first principles."
      />
      
      <PageHeader
        title="How Code Mode Thinks"
        subtitle="A conceptual guide for artists writing generative sketches without an LLM."
      />
      
      <PageContent>
        {/* Runtime Notice */}
        <div className="border border-border bg-muted/30 px-6 py-4 mb-8">
          <p className="text-sm text-body mb-2">
            This guide explains how Code Mode behaves today in nexart.xyz.
          </p>
          <p className="text-sm text-caption mb-0">
            For the future protocol language, see{" "}
            <Link to="/code-mode-v1" className="text-foreground underline underline-offset-2 hover:text-body">
              Code Mode v1 (GSL Draft)
            </Link>.
          </p>
        </div>

        {/* Related Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 text-sm">
          <Link
            to="/common-code-mode-mistakes"
            className="text-foreground underline underline-offset-2 hover:text-body"
          >
            Common Mistakes →
          </Link>
          <Link
            to="/code-mode-quick-reference"
            className="text-foreground underline underline-offset-2 hover:text-body"
          >
            Quick Reference →
          </Link>
        </div>

        <div className="prose-protocol">
          {/* Section 1 */}
          <h2>1. What Code Mode Is (and Is Not)</h2>
          
          <p>
            Code Mode is a controlled generative system. It provides a structured environment 
            where artists write code that produces visual output—either a single image or a 
            looping animation.
          </p>
          
          <p>
            The syntax looks like p5.js, and many p5.js patterns will work. But Code Mode is 
            not full p5.js. It is a constrained subset designed for deterministic, reproducible 
            generative art.
          </p>
          
          <div className="border-l-2 border-foreground pl-4 my-6">
            <p className="text-body mb-0">
              <strong>The constraints are intentional.</strong> They exist to guarantee that your 
              artwork renders identically across devices, across time, and across the protocol. 
              These are artistic constraints, not technical limitations.
            </p>
          </div>
          
          <p>
            If you approach Code Mode expecting a general-purpose creative coding environment, 
            you will encounter friction. If you approach it as a system with clear rules that 
            reward clarity, you will find it remarkably predictable.
          </p>

          {/* Section 2 */}
          <h2>2. Two Ways Code Mode Executes</h2>
          
          <p>
            Code Mode operates in exactly two modes. Understanding the difference is fundamental.
          </p>
          
          <div className="overflow-x-auto my-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 font-medium text-foreground">Aspect</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Static Mode</th>
                  <th className="text-left py-3 pl-4 font-medium text-foreground">Loop Mode</th>
                </tr>
              </thead>
              <tbody className="text-body">
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Execution</td>
                  <td className="py-3 px-4">One execution</td>
                  <td className="py-3 pl-4">Many independent frames</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Output</td>
                  <td className="py-3 px-4">One image</td>
                  <td className="py-3 pl-4">One looping animation</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Function used</td>
                  <td className="py-3 px-4"><code>setup()</code> only</td>
                  <td className="py-3 pl-4"><code>setup()</code> + <code>draw()</code></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Time variable</td>
                  <td className="py-3 px-4">Not applicable</td>
                  <td className="py-3 pl-4"><code>t</code> (0 to 1)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-foreground">Minted as</td>
                  <td className="py-3 px-4">PNG image</td>
                  <td className="py-3 pl-4">MP4 video</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p>
            <strong>Static Mode</strong> runs your code once. Whatever is on the canvas at the 
            end of <code>setup()</code> becomes the final image. There is no animation, no 
            time progression, no looping.
          </p>
          
          <p>
            <strong>Loop Mode</strong> runs your code many times—once per frame. Each frame is 
            rendered independently, then assembled into a seamless loop. The variable <code>t</code> 
            tells you where you are in the loop cycle, from 0 (start) to 1 (end).
          </p>

          {/* Section 3 */}
          <h2>3. The Most Important Rule: Frames Do Not Remember</h2>
          
          <div className="bg-foreground text-background px-6 py-4 my-6">
            <p className="font-medium mb-2">Critical Rule</p>
            <p className="mb-0 opacity-90">
              In Loop Mode, each frame is rendered in complete isolation. Nothing persists 
              from the previous frame. The canvas is cleared before every frame begins.
            </p>
          </div>
          
          <p>
            This single rule explains nearly every unexpected behavior artists encounter:
          </p>
          
          <h3>Why black frames happen</h3>
          <p>
            If you do not call <code>background()</code> inside <code>draw()</code>, the canvas 
            starts each frame cleared to black (or transparent). If your drawing logic fails 
            or draws nothing visible, you see black.
          </p>
          
          <h3>Why artworks "appear once then disappear"</h3>
          <p>
            If you draw something only on the first frame (checking <code>frameCount === 1</code>, 
            for example), it will not persist. Frame 2 starts fresh. Frame 3 starts fresh. 
            Every frame starts fresh.
          </p>
          
          <h3>Why alpha-fade backgrounds don't work</h3>
          <p>
            A common technique in creative coding is to draw a semi-transparent background each 
            frame, creating motion trails. This relies on the previous frame's pixels remaining 
            on the canvas. In Code Mode Loop, they do not. Each frame is computed from nothing.
          </p>
          
          <div className="border-l-2 border-foreground pl-4 my-6">
            <p className="text-body mb-0">
              If you want trails, fades, or accumulation effects, you must compute them 
              mathematically—not rely on canvas memory. Draw the trail explicitly by calculating 
              where objects were in previous moments of time.
            </p>
          </div>

          {/* Section 4 */}
          <h2>4. Thinking in Parameters, Not State</h2>
          
          <p>
            Traditional creative coding often works like this: each frame, you update a 
            position variable, and the object moves. Position accumulates over time.
          </p>
          
          <p>
            Code Mode works differently. Motion comes from <strong>time</strong>, not from 
            incremental updates. Every frame must be computable from scratch, using only 
            the current value of <code>t</code>.
          </p>
          
          <p>
            This means thinking in terms of:
          </p>
          
          <ul>
            <li><strong>Oscillations</strong> — positions that swing back and forth based on sine or cosine of time</li>
            <li><strong>Cycles</strong> — rotations, hue shifts, or scales that complete one full revolution as <code>t</code> goes from 0 to 1</li>
            <li><strong>Fields</strong> — patterns where each pixel or element computes its own value based on its coordinates and time</li>
            <li><strong>Equations</strong> — explicit formulas that map time to position, size, color, or any other property</li>
          </ul>
          
          <p>
            Instead of "move right by 2 pixels each frame," think "position equals 
            <code>t</code> times the canvas width." Instead of "rotate a little more each 
            frame," think "rotation equals <code>t</code> times two pi."
          </p>
          
          <p>
            This shift—from state accumulation to parametric computation—is the core mental 
            model of Code Mode.
          </p>

          {/* Section 5 */}
          <h2>5. Perfect Loops Explained Visually</h2>
          
          <p>
            A "perfect loop" means the animation returns exactly to its starting state. 
            Frame 0 and the final frame are identical, so when the video loops, there is 
            no visible seam.
          </p>
          
          <p>
            The variable <code>t</code> is designed for this. It starts at 0 and ends just 
            before 1, such that the next cycle's <code>t = 0</code> follows seamlessly.
          </p>
          
          <h3>Why sine and cosine work so well</h3>
          <p>
            Sine and cosine are cyclical functions. <code>sin(t * TWO_PI)</code> starts at 0, 
            rises to 1, falls to -1, and returns exactly to 0. This makes them natural 
            choices for any property that should oscillate smoothly: position, scale, 
            opacity, rotation.
          </p>
          
          <h3>Why frameCount alone is not enough</h3>
          <p>
            Using <code>frameCount</code> directly (without mapping it to a cycle) produces 
            motion that never returns to start. The loop will jump visibly when the video 
            restarts. Always derive motion from <code>t</code>, which is already normalized 
            to one complete cycle.
          </p>
          
          <div className="border-l-2 border-foreground pl-4 my-6">
            <p className="text-body mb-0">
              Think of <code>t</code> as "how far through the loop am I?" — a single number 
              from 0 to 1 that you can multiply, offset, or feed into periodic functions 
              to create any cyclical motion.
            </p>
          </div>

          {/* Section 6 */}
          <h2>6. Static vs Loop: How to Choose</h2>
          
          <p>
            Not every generative work needs to move. Choosing the right mode is an artistic 
            decision.
          </p>
          
          <h3>Choose Static when:</h3>
          <ul>
            <li>The work is about composition, texture, or pattern</li>
            <li>Motion would distract from the visual statement</li>
            <li>You want collectors to experience a singular, fixed image</li>
            <li>The complexity of the piece is in its detail, not its evolution</li>
          </ul>
          
          <h3>Choose Loop when:</h3>
          <ul>
            <li>Motion is essential to the concept</li>
            <li>The work explores rhythm, cycle, or transformation</li>
            <li>Time itself is a material in the piece</li>
            <li>You want the artwork to breathe, pulse, or evolve</li>
          </ul>
          
          <h3>Why not everything should move</h3>
          <p>
            Movement demands attention. A loop that moves without purpose can feel restless 
            or anxious. Sometimes the most powerful statement is stillness—a single, 
            resolved image that asks the viewer to look closely rather than wait for change.
          </p>

          {/* Section 7 */}
          <h2>7. Common Mental Traps</h2>
          
          <p>
            These are patterns that trip up artists transitioning to Code Mode. They are 
            not mistakes to be ashamed of—they reflect reasonable assumptions from other 
            creative coding environments.
          </p>
          
          <h3>"I expected the canvas to remember"</h3>
          <p>
            In many environments, what you draw persists until you clear it. In Code Mode 
            Loop, the canvas is cleared automatically before each frame. You must redraw 
            everything every frame.
          </p>
          
          <h3>"I thought draw() was continuous"</h3>
          <p>
            In p5.js, <code>draw()</code> runs continuously and you can track state between 
            calls. In Code Mode, each <code>draw()</code> call is independent. Frame 47 knows 
            nothing about frame 46.
          </p>
          
          <h3>"I used random() and everything jittered"</h3>
          <p>
            If you call <code>random()</code> without a seed, you get different values each 
            frame, causing visual jitter. Use <code>randomSeed()</code> at the start of 
            <code>draw()</code> if you need consistent randomness across frames.
          </p>
          
          <h3>"My animation fades to black"</h3>
          <p>
            This usually means you are relying on alpha-blending backgrounds for trails. 
            Since frames do not remember, the "fade" never accumulates—you just get a dim 
            background with no trail. Compute trails explicitly or change your approach.
          </p>

          {/* Section 8 */}
          <h2>8. How This Relates to the Protocol</h2>
          
          <p>
            Everything described in this guide is behavior that is <strong>guaranteed 
            today</strong> in nexart.xyz. When you mint a work, this is how it will render.
          </p>
          
          <p>
            In the future, <strong>GSL v1</strong> will formalize a stricter, single-frame 
            language that makes these guarantees explicit at the syntax level. But that is 
            a design proposal, not current behavior.
          </p>
          
          <div className="border border-border bg-muted/30 px-6 py-4 my-6">
            <p className="text-sm text-body mb-0">
              <strong>You do not need to learn GSL to use Code Mode today.</strong> The 
              mental model described here is sufficient to write correct, protocol-compliant 
              generative art.
            </p>
          </div>
          
          <h3>Further Reading</h3>
          <ul>
            <li>
              <Link to="/code-mode-execution" className="text-foreground underline underline-offset-2 hover:text-body">
                Runtime Execution Specification
              </Link>
              {" "}— the authoritative technical specification for current behavior
            </li>
            <li>
              <Link to="/code-mode-v1" className="text-foreground underline underline-offset-2 hover:text-body">
                Code Mode v1 (GSL Draft)
              </Link>
              {" "}— the proposed future protocol language
            </li>
          </ul>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default HowCodeModeThinks;
