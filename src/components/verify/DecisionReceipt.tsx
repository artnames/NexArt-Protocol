/**
 * Decision Receipt — lightweight summary card displayed at the top
 * of the public verification page. Presentation layer only.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck, ShieldAlert, ShieldQuestion, Clock, Cpu, Building2, ChevronDown,
} from "lucide-react";
import type { VerifyResult } from "@/lib/verifyLocal";

interface DecisionReceiptProps {
  result: VerifyResult;
  bundle: Record<string, unknown> | null;
  projectName?: string | null;
  appName?: string | null;
}

export default function DecisionReceipt({ result, bundle, projectName, appName }: DecisionReceiptProps) {
  const snap = bundle?.snapshot as Record<string, unknown> | undefined;

  // Try to extract a "decision" / outcome field for AI executions
  const decision = (snap?.decision ?? snap?.outcome ?? snap?.result ?? null) as string | null;
  const model = result.meta.model ?? (snap?.model as string | undefined) ?? null;
  const provider = result.meta.provider ?? (snap?.provider as string | undefined) ?? null;
  const timestamp = result.meta.createdAt ?? (bundle?.createdAt as string | undefined) ?? null;
  const bundleType = result.meta.bundleType;
  const isAI = bundleType === "cer.ai.execution.v1";

  const VerdictIcon = result.ok ? ShieldCheck : ShieldAlert;
  const verdictColor = result.ok ? "text-green-600" : "text-destructive";
  const verdictBg = result.ok ? "bg-green-600/5 border-green-600/20" : "bg-destructive/5 border-destructive/20";
  const verdictLabel = result.ok ? "Verified" : "Not Verified";

  return (
    <Card className={`${verdictBg} border`}>
      <CardContent className="p-5 space-y-4">
        {/* Verdict row */}
        <div className="flex items-center gap-3">
          <VerdictIcon className={`h-6 w-6 ${verdictColor} shrink-0`} />
          <div className="min-w-0">
            <p className={`font-mono text-sm font-semibold ${verdictColor}`}>
              {decision ? `${decision}` : (isAI ? "Execution verified" : "Record verified")}
            </p>
            <p className="text-xs text-muted-foreground">
              {result.ok
                ? "This record is intact and has not been modified."
                : result.explanation}
            </p>
          </div>
          <Badge
            className={`ml-auto font-mono text-xs shrink-0 ${
              result.ok
                ? "bg-green-600/15 text-green-600 border-green-600/30"
                : "bg-destructive/15 text-destructive border-destructive/30"
            }`}
          >
            {verdictLabel}
          </Badge>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 pt-3 border-t border-border">
          {timestamp && (
            <MetaItem icon={<Clock className="h-3.5 w-3.5" />} label="Timestamp" value={formatTimestamp(timestamp)} />
          )}
          {model && (
            <MetaItem icon={<Cpu className="h-3.5 w-3.5" />} label="Model" value={`${provider ? `${provider}/` : ""}${model}`} />
          )}
          {bundleType && (
            <MetaItem
              icon={<ShieldQuestion className="h-3.5 w-3.5" />}
              label="Type"
              value={bundleType === "cer.ai.execution.v1" ? "AI Execution" : "Code Mode"}
            />
          )}
          {(projectName || appName) && (
            <MetaItem
              icon={<Building2 className="h-3.5 w-3.5" />}
              label="Project"
              value={[projectName, appName].filter(Boolean).join(" / ")}
            />
          )}
        </div>

        {/* Link to full details */}
        <a
          href="#technical-details"
          className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("technical-details")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <ChevronDown className="h-3 w-3" />
          Full technical details
        </a>
      </CardContent>
    </Card>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xs font-mono text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch {
    return ts;
  }
}
