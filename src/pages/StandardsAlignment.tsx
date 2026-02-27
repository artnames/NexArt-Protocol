import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import SEOHead from "@/components/seo/SEOHead";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

const StandardsAlignment = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Standards Alignment"
        description="How NexArt CERs and signed receipts support evidence needs for ISO/IEC 42001, SOC 2, and NIST frameworks."
      />
      <PageHeader
        title="Standards alignment"
        subtitle="How NexArt execution records and signed receipts support evidence needs for ISO/IEC 42001, SOC 2, and NIST."
      />
      <PageContent>
        <div className="space-y-12">
          {/* Disclaimers */}
          <div className="border border-border bg-muted/30 rounded-md p-5 space-y-2">
            <p className="text-sm font-medium text-foreground">Important</p>
            <p className="text-sm text-body">
              NexArt is an evidence layer: it produces tamper-evident audit artifacts (records + stamps) that can be verified independently.
            </p>
            <p className="text-sm text-body">
              NexArt provides verifiable execution evidence. It does not by itself make an organization compliant.
            </p>
            <p className="text-sm text-body">
              Mappings below are guidance; auditors may require additional controls and evidence beyond what NexArt provides.
            </p>
          </div>

          {/* On this page */}
          <nav>
            <p className="text-xs font-mono text-caption uppercase tracking-wider mb-2">On this page</p>
            <ul className="space-y-1 text-sm">
              {[
                ["#what-nexart-provides", "What NexArt provides"],
                ["#control-outcomes", "Control outcomes"],
                ["#soc2", "SOC 2 mapping"],
                ["#nist", "NIST mapping"],
                ["#iso42001", "ISO/IEC 42001 mapping"],
                ["#limits", "What NexArt does not cover"],
                ["#try-it", "Try it"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-caption hover:text-foreground transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* A — What NexArt provides */}
          <section id="what-nexart-provides">
            <h2 className="text-xl font-serif text-foreground mb-4">What NexArt provides</h2>
            <ul className="space-y-3 text-sm text-body list-disc pl-5">
              <li><strong className="text-foreground">Certified Execution Record (CER)</strong> — a single JSON record that binds inputs, parameters, and outputs together.</li>
              <li><strong className="text-foreground">Certificate hash</strong> — a tamper-evident seal over the record contents.</li>
              <li><strong className="text-foreground">Node stamp (signed receipt)</strong> — optional Ed25519 signature over a receipt that can be verified independently using the node's published public keys.</li>
              <li><strong className="text-foreground">Deterministic re-execution (Code Mode)</strong> — for deterministic workloads, you can re-run the snapshot and reproduce the same output.</li>
              <li><strong className="text-foreground">Verification reason codes</strong> — PASS / FAIL plus machine-readable reason codes explaining what didn't match.</li>
              <li><strong className="text-foreground">Redacted exports + provenance</strong> — you can remove sensitive fields and still produce a verifiable artifact, while preserving the original historic hash as reference.</li>
              <li><strong className="text-foreground">Legacy stamps</strong> — older records may show a legacy stamp (attestation ID without signed receipt). These still verify for integrity but aren't offline signature-verifiable.</li>
            </ul>
          </section>

          {/* B — Control outcomes */}
          <section id="control-outcomes">
            <h2 className="text-xl font-serif text-foreground mb-4">Control outcomes</h2>
            <p className="text-sm text-body mb-4">What auditors typically want to see, and how NexArt helps.</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Outcome</TableHead>
                    <TableHead className="min-w-[200px]">NexArt capability</TableHead>
                    <TableHead className="min-w-[200px]">Evidence artifact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Tamper-evident decision trail", "Certificate hash over canonical record", "CER JSON + verify PASS/FAIL"],
                    ["Proof that logs weren't edited post-hoc", "Hash mismatch detection + reason codes", "Verification report + reason codes"],
                    ["Third-party integrity stamp", "Signed receipt (Ed25519) + public key discovery", "Receipt + signature + /.well-known/nexart-node.json"],
                    ["Reproducible execution (where deterministic)", "Deterministic snapshots + replay", "Code Mode CER + replay output"],
                    ["Traceability of automated decisions", "Workflow/run IDs + step chaining (agent workflows)", "RunBuilder chain + final hash"],
                    ["Privacy-preserving audit sharing", "Redacted export + provenance", "Redacted CER + meta.provenance"],
                    ["Long-term verifiability", "Frozen hashing semantics + backward-compatible verification", "Old CERs still verify with new SDKs"],
                  ].map(([outcome, cap, artifact]) => (
                    <TableRow key={outcome}>
                      <TableCell className="text-sm font-medium text-foreground">{outcome}</TableCell>
                      <TableCell className="text-sm text-body">{cap}</TableCell>
                      <TableCell className="text-sm text-body font-mono text-xs">{artifact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Typical audit workflow */}
          <section>
            <h2 className="text-xl font-serif text-foreground mb-4">Typical audit workflow</h2>
            <div className="border border-border bg-muted/30 rounded-md p-5">
              <ol className="space-y-3 text-sm text-body list-decimal pl-5">
                <li><strong className="text-foreground">Record</strong> — issue a CER for each AI execution (inputs, parameters, outputs bound together with a certificate hash).</li>
                <li><strong className="text-foreground">Stamp</strong> — optionally request a signed receipt from a NexArt node to add an independent, offline-verifiable integrity seal.</li>
                <li><strong className="text-foreground">Archive</strong> — export the CER (redacted if needed) as a portable JSON artifact for long-term retention.</li>
                <li><strong className="text-foreground">Verify</strong> — at audit time, re-verify the certificate hash and stamp independently using public keys or the browser verifier.</li>
              </ol>
            </div>
          </section>

          {/* C1 — SOC 2 */}
          <section id="soc2">
            <h2 className="text-xl font-serif text-foreground mb-4">SOC 2 mapping</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">SOC 2 area (TSC)</TableHead>
                    <TableHead className="min-w-[240px]">How NexArt supports evidence</TableHead>
                    <TableHead className="min-w-[180px]">Example evidence artifact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Security", "Supports integrity of audit evidence by making records tamper-evident", "CER JSON + verification result"],
                    ["Security", "Adds independently verifiable stamps on recorded evidence", "Signed receipt + node keys doc"],
                    ["Processing Integrity", "Shows exactly what was recorded as inputs/params/outputs for automated decisions", "CER snapshot fields"],
                    ["Processing Integrity", "Detects post-hoc modifications with clear reason codes", "FAIL + reason code + details"],
                    ["Confidentiality", "Enables redaction while preserving verifiability of the exported artifact", "Redacted CER + redacted hash + provenance"],
                    ["Availability (indirect)", "Provides portable audit artifacts that can be verified offline", "Exported CER + local verify"],
                    ["Privacy (supporting)", "Helps limit disclosure through selective redaction and proof separation", "Redaction + provenance guidance"],
                  ].map(([area, how, artifact], i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium text-foreground">{area}</TableCell>
                      <TableCell className="text-sm text-body">{how}</TableCell>
                      <TableCell className="text-sm text-body font-mono text-xs">{artifact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-caption mt-3 italic">
              SOC 2 requires broader controls (access, monitoring, incident response). NexArt helps with integrity evidence.
            </p>
          </section>

          {/* C2 — NIST */}
          <section id="nist">
            <h2 className="text-xl font-serif text-foreground mb-4">NIST mapping</h2>
            <p className="text-sm text-body mb-4">Family-level mapping (SP 800-53 families).</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">NIST area</TableHead>
                    <TableHead className="min-w-[240px]">How NexArt supports evidence</TableHead>
                    <TableHead className="min-w-[180px]">Example evidence artifact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["AU — Audit & Accountability", "Produces audit records that are tamper-evident and independently verifiable", "CER JSON + verification PASS/FAIL"],
                    ["AU — Audit & Accountability", "Supports independent verification without trusting the originating app", "Offline verification + node keys"],
                    ["SI — System Integrity", "Detects unauthorized changes to recorded executions", "Reason codes + mismatch details"],
                    ["CM — Configuration Management", "Version-pinned semantics (protocol + SDK) help reproduce the meaning of historic records", "Protocol version + sdkVersion"],
                    ["SC — System & Comms Protection (supporting)", "Separates proof from sensitive content (receipt/signature vs raw inputs)", "Signed receipt + redacted exports"],
                    ["IR — Incident Response (supporting)", "Provides clear forensic artifacts for what changed and when (or what verified)", "Verification details + provenance"],
                  ].map(([area, how, artifact], i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium text-foreground">{area}</TableCell>
                      <TableCell className="text-sm text-body">{how}</TableCell>
                      <TableCell className="text-sm text-body font-mono text-xs">{artifact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <h3 className="text-lg font-serif text-foreground mt-8 mb-3">NIST AI RMF</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">RMF function</TableHead>
                    <TableHead className="min-w-[240px]">How NexArt supports evidence</TableHead>
                    <TableHead className="min-w-[180px]">Example evidence artifact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["GOVERN", "Supports accountability via immutable decision records and stamps", "CER + signed receipt"],
                    ["MAP", "Captures decision context (inputs/params/model) for traceability", "Snapshot fields"],
                    ["MEASURE (supporting)", "Enables auditing and evaluation of recorded outcomes", "CER exports for review"],
                    ["MANAGE (supporting)", "Helps demonstrate controls around change detection and incident forensics", "Reason codes + provenance"],
                  ].map(([fn, how, artifact], i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium text-foreground">{fn}</TableCell>
                      <TableCell className="text-sm text-body">{how}</TableCell>
                      <TableCell className="text-sm text-body font-mono text-xs">{artifact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* C3 — ISO 42001 */}
          <section id="iso42001">
            <h2 className="text-xl font-serif text-foreground mb-4">ISO/IEC 42001 mapping</h2>
            <p className="text-sm text-body mb-4">Theme-based mapping to AI management system requirements.</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">ISO/IEC 42001 theme</TableHead>
                    <TableHead className="min-w-[240px]">How NexArt supports evidence</TableHead>
                    <TableHead className="min-w-[180px]">Example evidence artifact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Traceability of AI outputs", "Binds input/parameters/output into a single immutable record", "AI CER bundle"],
                    ["Monitoring & measurement", "Produces verification outcomes + reason codes for integrity checks", "verify() result + codes"],
                    ["Accountability & governance", "Enables independent verification using third-party stamps and public keys", "Signed receipt + keys doc"],
                    ["Change / incident handling", "Helps investigate integrity disputes with precise mismatch explanations", "FAIL + details + provenance"],
                    ["Documentation & retention", "Portable JSON artifacts that can be archived and verified years later", "Exported CER + frozen semantics"],
                    ["Supplier/provider management (supporting)", "Captures provider/model identifiers and parameters at the time of decision", "provider/model/params fields"],
                  ].map(([theme, how, artifact], i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium text-foreground">{theme}</TableCell>
                      <TableCell className="text-sm text-body">{how}</TableCell>
                      <TableCell className="text-sm text-body font-mono text-xs">{artifact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-caption mt-3 italic">
              ISO 42001 requires an AI management system (policies, roles, risk treatment). NexArt provides evidence artifacts that support audits.
            </p>
          </section>

          {/* D — Limits */}
          <section id="limits">
            <h2 className="text-xl font-serif text-foreground mb-4">What NexArt does not cover</h2>
            <div className="border border-border bg-muted/30 rounded-md p-5">
              <p className="text-sm text-body mb-3">
                NexArt is an evidence and integrity layer, not a full compliance program. It does not replace:
              </p>
              <ul className="space-y-1.5 text-sm text-body list-disc pl-5">
                <li>IAM / access controls and least privilege</li>
                <li>Encryption / key management and secure storage</li>
                <li>Model risk management (MRM) policies and approvals</li>
                <li>Bias / fairness evaluation and monitoring</li>
                <li>Human oversight and operational controls</li>
                <li>Vendor due diligence and contractual compliance</li>
              </ul>
            </div>
          </section>

          {/* E — Try it */}
          <section id="try-it">
            <h2 className="text-xl font-serif text-foreground mb-4">Try it</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://nexartaiauditor.xyz" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-caption transition-colors inline-flex items-center gap-1.5">
                  Issue an AI record <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="text-caption ml-1">— nexartaiauditor.xyz</span>
              </li>
              <li>
                <a href="https://recanon.xyz" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-caption transition-colors inline-flex items-center gap-1.5">
                  Verify independently in browser <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="text-caption ml-1">— recanon.xyz</span>
              </li>
              <li>
                <a href="/verify" className="text-foreground hover:text-caption transition-colors">
                  Browser-only verifier on NexArt.io
                </a>
                <span className="text-caption ml-1">— /verify</span>
              </li>
              <li>
                <a href="https://nexart-canonical-renderer-production.up.railway.app/.well-known/nexart-node.json" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-caption transition-colors inline-flex items-center gap-1.5">
                  Node public keys <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="text-caption ml-1 font-mono text-xs">/.well-known/nexart-node.json</span>
              </li>
            </ul>
          </section>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default StandardsAlignment;
