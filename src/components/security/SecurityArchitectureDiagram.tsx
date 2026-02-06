import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

const SecurityArchitectureDiagram = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = useCallback(() => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    
    // Add XML declaration and standalone SVG styles
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
    
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexart-security-architecture.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="my-12">
      <h2 className="text-2xl mt-16 mb-6 text-foreground font-serif">Security Architecture Diagram</h2>
      
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 1100 420"
          width="100%"
          height="auto"
          style={{ maxWidth: "1100px" }}
          role="img"
          aria-labelledby="security-diagram-title security-diagram-desc"
          className="text-foreground"
        >
          <title id="security-diagram-title">NexArt Security Architecture Diagram</title>
          <desc id="security-diagram-desc">
            A diagram showing the flow from input sources through the canonical renderer to artifact output and verification metadata, with a certification boundary separating execution from paid certification services.
          </desc>

          {/* Definitions */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="currentColor"
                opacity="0.6"
              />
            </marker>
          </defs>

          {/* Background */}
          <rect
            x="0"
            y="0"
            width="1100"
            height="420"
            fill="hsl(var(--muted))"
            opacity="0.3"
            rx="8"
          />

          {/* Box 1: Input Sources */}
          <g>
            <rect
              x="20"
              y="40"
              width="220"
              height="320"
              rx="8"
              fill="hsl(var(--card))"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.9"
            />
            <text
              x="130"
              y="70"
              textAnchor="middle"
              className="font-sans"
              fill="currentColor"
              fontSize="14"
              fontWeight="600"
            >
              Input Sources
            </text>
            
            {/* Sub-boxes */}
            <rect
              x="35"
              y="90"
              width="190"
              height="50"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="130" y="120" textAnchor="middle" fill="currentColor" fontSize="12">
              Seed + VAR[0..9]
            </text>

            <rect
              x="35"
              y="155"
              width="190"
              height="50"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="130" y="185" textAnchor="middle" fill="currentColor" fontSize="12">
              User Code (ephemeral)
            </text>

            <rect
              x="35"
              y="220"
              width="190"
              height="65"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="130" y="248" textAnchor="middle" fill="currentColor" fontSize="11">
              External Deterministic
            </text>
            <text x="130" y="265" textAnchor="middle" fill="currentColor" fontSize="11">
              Datasets (planned)
            </text>
          </g>

          {/* Arrow 1 → 2 */}
          <line
            x1="245"
            y1="200"
            x2="275"
            y2="200"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            opacity="0.6"
          />

          {/* Box 2: Canonical Renderer */}
          <g>
            <rect
              x="280"
              y="40"
              width="250"
              height="320"
              rx="8"
              fill="hsl(var(--card))"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.9"
            />
            <text
              x="405"
              y="70"
              textAnchor="middle"
              className="font-sans"
              fill="currentColor"
              fontSize="14"
              fontWeight="600"
            >
              Canonical Renderer
            </text>
            <text
              x="405"
              y="88"
              textAnchor="middle"
              fill="currentColor"
              fontSize="11"
              opacity="0.7"
            >
              (Sandboxed Execution)
            </text>

            {/* Sub-boxes */}
            <rect
              x="295"
              y="105"
              width="220"
              height="50"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="405" y="135" textAnchor="middle" fill="currentColor" fontSize="12">
              Pinned runtime + protocol version
            </text>

            <rect
              x="295"
              y="170"
              width="220"
              height="50"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="405" y="200" textAnchor="middle" fill="currentColor" fontSize="12">
              No network / no filesystem
            </text>

            <rect
              x="295"
              y="235"
              width="220"
              height="65"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="405" y="263" textAnchor="middle" fill="currentColor" fontSize="11">
              Ephemeral container
            </text>
            <text x="405" y="280" textAnchor="middle" fill="currentColor" fontSize="11">
              (destroyed after run)
            </text>
          </g>

          {/* Arrow 2 → 3 */}
          <line
            x1="535"
            y1="200"
            x2="565"
            y2="200"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            opacity="0.6"
          />

          {/* Box 3: Artifact Output */}
          <g>
            <rect
              x="570"
              y="40"
              width="210"
              height="320"
              rx="8"
              fill="hsl(var(--card))"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.9"
            />
            <text
              x="675"
              y="70"
              textAnchor="middle"
              className="font-sans"
              fill="currentColor"
              fontSize="14"
              fontWeight="600"
            >
              Artifact Output
            </text>
            <text
              x="675"
              y="88"
              textAnchor="middle"
              fill="currentColor"
              fontSize="11"
              opacity="0.7"
            >
              (Binary)
            </text>

            {/* Sub-boxes */}
            <rect
              x="585"
              y="105"
              width="180"
              height="50"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="675" y="135" textAnchor="middle" fill="currentColor" fontSize="12">
              PNG (1950×2400)
            </text>

            <rect
              x="585"
              y="170"
              width="180"
              height="65"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="675" y="198" textAnchor="middle" fill="currentColor" fontSize="11">
              Returned to client —
            </text>
            <text x="675" y="215" textAnchor="middle" fill="currentColor" fontSize="11">
              not stored
            </text>
          </g>

          {/* Certification Boundary (dashed line) */}
          <line
            x1="795"
            y1="20"
            x2="795"
            y2="400"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity="0.5"
          />
          <rect
            x="755"
            y="6"
            width="80"
            height="20"
            fill="hsl(var(--background))"
          />
          <text
            x="795"
            y="20"
            textAnchor="middle"
            fill="currentColor"
            fontSize="10"
            fontWeight="500"
            opacity="0.8"
          >
            Certification
          </text>
          <text
            x="795"
            y="32"
            textAnchor="middle"
            fill="currentColor"
            fontSize="10"
            fontWeight="500"
            opacity="0.8"
          >
            Boundary (paid)
          </text>

          {/* Arrow 3 → 4 */}
          <line
            x1="785"
            y1="200"
            x2="815"
            y2="200"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            opacity="0.6"
          />

          {/* Box 4: Verification / Proof Metadata */}
          <g>
            <rect
              x="820"
              y="40"
              width="260"
              height="320"
              rx="8"
              fill="hsl(var(--card))"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.9"
            />
            <text
              x="950"
              y="70"
              textAnchor="middle"
              className="font-sans"
              fill="currentColor"
              fontSize="14"
              fontWeight="600"
            >
              Verification / Proof Metadata
            </text>

            {/* Sub-boxes */}
            <rect
              x="835"
              y="95"
              width="230"
              height="55"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="950" y="118" textAnchor="middle" fill="currentColor" fontSize="11">
              Output hash, runtime hash,
            </text>
            <text x="950" y="133" textAnchor="middle" fill="currentColor" fontSize="11">
              protocol version
            </text>

            <rect
              x="835"
              y="165"
              width="230"
              height="55"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="950" y="188" textAnchor="middle" fill="currentColor" fontSize="11">
              Usage event metadata
            </text>
            <text x="950" y="203" textAnchor="middle" fill="currentColor" fontSize="11">
              (no payload)
            </text>

            <rect
              x="835"
              y="235"
              width="230"
              height="65"
              rx="4"
              fill="hsl(var(--muted))"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.7"
            />
            <text x="950" y="258" textAnchor="middle" fill="currentColor" fontSize="11">
              Snapshot JSON returned to client
            </text>
            <text x="950" y="276" textAnchor="middle" fill="currentColor" fontSize="11">
              (client-retained, not stored by NexArt)
            </text>
          </g>

          {/* Note under Verification */}
          <text
            x="950"
            y="380"
            textAnchor="middle"
            fill="currentColor"
            fontSize="10"
            opacity="0.6"
            fontStyle="italic"
          >
            Proof metadata (hashes, protocol, inputs).
          </text>
          <text
            x="950"
            y="395"
            textAnchor="middle"
            fill="currentColor"
            fontSize="10"
            opacity="0.6"
            fontStyle="italic"
          >
            Artifact output remains binary (PNG, etc.).
          </text>
        </svg>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm font-medium text-foreground mb-2">Legend</p>
        <p className="text-xs text-muted-foreground">Solid arrows indicate execution flow</p>
        <p className="text-xs text-muted-foreground">
          Dashed boundary indicates certification, metering, and billing boundary
        </p>
      </div>
    </div>
  );
};

export default SecurityArchitectureDiagram;
