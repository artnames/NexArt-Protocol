import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";

const CodeModeQuickReference = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Code Mode Quick Reference — NexArt Protocol</title>
        <meta name="description" content="A printable one-page guide for writing correct Static and Loop sketches in NexArt Code Mode." />
      </Helmet>
      
      <PageHeader
        title="Code Mode Mental Model — Quick Reference"
        subtitle="A printable guide for writing correct Static and Loop sketches in NexArt."
      />
      
      <PageContent>
        {/* Print-optimized container */}
        <div className="print:text-[11px] print:leading-tight">
          
          {/* Two-column grid for compact layout */}
          <div className="grid md:grid-cols-2 gap-6 print:gap-4">
            
            {/* Column 1 */}
            <div className="space-y-6 print:space-y-4">
              
              {/* Section 1: What Code Mode Is */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-wider text-foreground mb-3 print:mb-2">
                  1. What Code Mode Is
                </h2>
                <ul className="text-sm text-body space-y-1 list-disc list-inside">
                  <li>Deterministic generative system</li>
                  <li>Frame-authoritative</li>
                  <li>Stateless between frames</li>
                  <li>Designed for mint-safe output</li>
                </ul>
              </section>
              
              {/* Section 2: Static vs Loop */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-wider text-foreground mb-3 print:mb-2">
                  2. Static vs Loop
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-3 font-medium text-foreground"></th>
                        <th className="text-left py-2 px-3 font-medium text-foreground">Static</th>
                        <th className="text-left py-2 pl-3 font-medium text-foreground">Loop</th>
                      </tr>
                    </thead>
                    <tbody className="text-body text-xs">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-3 font-medium text-foreground">Output</td>
                        <td className="py-2 px-3">Single image</td>
                        <td className="py-2 pl-3">Animation</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-3 font-medium text-foreground">Functions</td>
                        <td className="py-2 px-3"><code>setup()</code></td>
                        <td className="py-2 pl-3"><code>setup()</code> + <code>draw()</code></td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-3 font-medium text-foreground">Memory</td>
                        <td className="py-2 px-3">N/A</td>
                        <td className="py-2 pl-3">None</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-3 font-medium text-foreground">Background</td>
                        <td className="py-2 px-3">Once</td>
                        <td className="py-2 pl-3">Every frame</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-medium text-foreground">Use for</td>
                        <td className="py-2 px-3">Compositions</td>
                        <td className="py-2 pl-3">Cycles, motion</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
              
              {/* Section 3: Golden Rule */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-wider text-foreground mb-3 print:mb-2">
                  3. The Golden Rule
                </h2>
                <div className="bg-foreground text-background px-4 py-3 print:border print:border-foreground print:bg-transparent print:text-foreground">
                  <p className="text-sm font-medium mb-1">
                    Each frame must draw the entire image.
                  </p>
                  <p className="text-xs opacity-90 mb-0">
                    Nothing from the previous frame exists.
                  </p>
                </div>
              </section>
              
              {/* Section 4: Time Model */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-wider text-foreground mb-3 print:mb-2">
                  4. Time Model (Loop)
                </h2>
                <ul className="text-sm text-body space-y-1 list-disc list-inside">
                  <li><code>t</code> is normalized time [0 → 1)</li>
                  <li>Motion comes from equations, not increments</li>
                  <li>Start and end states must match</li>
                </ul>
              </section>
            </div>
            
            {/* Column 2 */}
            <div className="space-y-6 print:space-y-4">
              
              {/* Section 5: Do / Don't */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-wider text-foreground mb-3 print:mb-2">
                  5. Do / Don't
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-mono text-foreground mb-2">DO</p>
                    <ul className="text-xs text-body space-y-1 list-disc list-inside">
                      <li>Use <code>t</code>, <code>sin()</code>, <code>cos()</code></li>
                      <li>Recompute everything per frame</li>
                      <li>Call <code>background()</code> in <code>draw()</code></li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-caption mb-2">DON'T</p>
                    <ul className="text-xs text-body space-y-1 list-disc list-inside">
                      <li>Expect trails or fading</li>
                      <li>Use <code>random()</code> without structure</li>
                      <li>Accumulate state in globals</li>
                      <li>Assume <code>draw()</code> is continuous</li>
                    </ul>
                  </div>
                </div>
              </section>
              
              {/* Section 6: Failure Signals */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-wider text-foreground mb-3 print:mb-2">
                  6. Failure Signals
                </h2>
                <div className="text-sm space-y-2">
                  <div className="flex gap-3">
                    <span className="text-foreground font-medium min-w-[100px]">Black screen</span>
                    <span className="text-body">→ background misuse</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-foreground font-medium min-w-[100px]">One frame only</span>
                    <span className="text-body">→ Static vs Loop mismatch</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-foreground font-medium min-w-[100px]">Jitter</span>
                    <span className="text-body">→ uncontrolled randomness</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-foreground font-medium min-w-[100px]">Broken loop</span>
                    <span className="text-body">→ non-periodic motion</span>
                  </div>
                </div>
              </section>
              
              {/* Section 7: Learn More */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-wider text-foreground mb-3 print:mb-2">
                  7. Learn More
                </h2>
                <ul className="text-sm text-body space-y-1">
                  <li>
                    <Link to="/how-code-mode-thinks" className="text-foreground underline underline-offset-2 hover:text-body">
                      How Code Mode Thinks
                    </Link>
                  </li>
                  <li>
                    <Link to="/common-code-mode-mistakes" className="text-foreground underline underline-offset-2 hover:text-body">
                      Common Mistakes
                    </Link>
                  </li>
                  <li>
                    <Link to="/code-mode-execution" className="text-foreground underline underline-offset-2 hover:text-body">
                      Runtime Execution Spec
                    </Link>
                  </li>
                  <li>
                    <Link to="/code-mode-v1" className="text-caption underline underline-offset-2 hover:text-body">
                      GSL v1 Draft
                    </Link>
                    <span className="text-caption text-xs ml-2">(future)</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>
          
          {/* Print footer */}
          <div className="hidden print:block mt-6 pt-4 border-t border-border text-xs text-caption text-center">
            nexart.io/code-mode-quick-reference
          </div>
        </div>
      </PageContent>
      
      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          header, footer, nav {
            display: none !important;
          }
        }
      `}</style>
    </PageLayout>
  );
};

export default CodeModeQuickReference;
