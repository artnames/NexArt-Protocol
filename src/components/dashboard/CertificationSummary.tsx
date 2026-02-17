import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface CertificationSummaryProps {
  total: number;
  successRate: number;
  aiCount: number;
  codeModeCount: number;
}

export default function CertificationSummary({ total, successRate, aiCount, codeModeCount }: CertificationSummaryProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Certification Summary — This Month
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-semibold font-mono">{total}</p>
            <p className="text-sm text-muted-foreground">Certified Records</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-semibold font-mono">{successRate}%</p>
            <p className="text-sm text-muted-foreground">Attestation Rate</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-semibold font-mono">{aiCount}</p>
            <p className="text-sm text-muted-foreground">AI Surface</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-semibold font-mono">{codeModeCount}</p>
            <p className="text-sm text-muted-foreground">Code Mode</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
