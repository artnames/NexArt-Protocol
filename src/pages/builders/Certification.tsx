import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const BuildersCertification = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <Helmet>
        <title>Canonical Certification — NexArt Builders</title>
        <meta
          name="description"
          content="What canonical certification means in the NexArt protocol. Deterministic execution, verifiable snapshots, and reproducibility guarantees."
        />
      </Helmet>

      <PageHeader
        title="Canonical Certification"
        subtitle="What it means to produce a certified output."
      />

      <PageContent>
        <article className="prose-protocol prose-spec">
          <h2>What is a certified run?</h2>
          <p>
            A <strong>certified run</strong> is a single execution of a Code Mode sketch through the 
            canonical renderer that produces:
          </p>
          <ul>
            <li>A deterministic PNG at canonical resolution (1950×2400)</li>
            <li>A verifiable snapshot (<code>.snapshot.json</code>) containing input parameters and output hash</li>
          </ul>
          <p>
            The snapshot is cryptographically linked to the output. Given the same inputs, any 
            compliant renderer will produce byte-identical output with the same hash.
          </p>

          <h2>Why certification matters</h2>
          <p>
            Certification provides three guarantees:
          </p>
          <ul>
            <li><strong>Reproducibility</strong> — The exact same output can be regenerated from the snapshot</li>
            <li><strong>Auditability</strong> — The snapshot records all inputs and the output hash</li>
            <li><strong>Verification</strong> — Anyone can independently verify that an image matches its snapshot</li>
          </ul>
          <p>
            These guarantees are essential for archival, minting, and any context where proof of 
            authenticity matters.
          </p>

          <h2>Certified vs. local execution</h2>
          <p>
            The NexArt SDK and CLI can execute sketches locally for free. Local execution is 
            deterministic but does not produce a certified snapshot.
          </p>
          <table>
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Local Execution</th>
                <th>Certified Run</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Deterministic</td>
                <td>✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Produces PNG</td>
                <td>✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Produces snapshot</td>
                <td>—</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Verifiable hash</td>
                <td>—</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Suitable for minting</td>
                <td>—</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Cost</td>
                <td>Free</td>
                <td>Plan-based</td>
              </tr>
            </tbody>
          </table>

          <h2>The snapshot format</h2>
          <p>
            A snapshot contains everything needed to reproduce and verify a render:
          </p>
          <div className="spec-code">
            <code>{`{
  "protocolVersion": "1.2.0",
  "seed": "12345",
  "VAR": [50, 50, 50, 0, 0, 0, 0, 0, 0, 0],
  "codeHash": "sha256:...",
  "outputHash": "sha256:...",
  "timestamp": "2025-01-27T...",
  "rendererVersion": "1.8.4"
}`}</code>
          </div>
          <p>
            The <code>outputHash</code> is the cryptographic fingerprint of the PNG. Verification 
            re-renders with the same parameters and confirms the hash matches.
          </p>

          <h2>Running a certified render</h2>
          <p>
            Use the CLI with an API key to produce certified output:
          </p>
          <div className="spec-code">
            <code>
              nexart run ./sketch.js --seed 12345 --out out.png
            </code>
          </div>
          <p>
            This produces both <code>out.png</code> and <code>out.snapshot.json</code>.
          </p>

          <h2>Verification</h2>
          <p>
            Anyone with the snapshot can verify the output:
          </p>
          <div className="spec-code">
            <code>nexart verify out.snapshot.json</code>
          </div>
          <p>
            Verification re-renders the sketch and confirms the output hash matches. A passing 
            verification proves the image is authentic and untampered.
          </p>

          <h2>Plan limits</h2>
          <p>
            Certified runs are metered by plan. See <Link to="/pricing" className="text-link hover:text-link-hover underline underline-offset-2">pricing</Link> for 
            details on limits and tiers.
          </p>
        </article>

        <div className="flex gap-3 mt-12 pt-8 border-t border-border">
          <Button asChild>
            <Link to={user ? "/dashboard/api-keys" : "/auth"}>Get API Key</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/builders/quickstart">Quickstart</Link>
          </Button>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default BuildersCertification;
