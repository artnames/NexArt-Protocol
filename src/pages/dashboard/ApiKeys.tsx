import { useEffect, useState, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  listKeys, 
  provisionKey, 
  revokeKey, 
  rotateKey, 
  ApiKey, 
  ProvisionKeyResponse,
  parseApiError,
  getFriendlyErrorMessage,
  ApiError 
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Check, RefreshCw, Ban, Key, Terminal, AlertTriangle, FileImage, ShieldAlert, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PLAN_OPTIONS = [
  { value: "free", label: "Free", limit: "100 runs/month" },
  { value: "pro", label: "Pro", limit: "~5,000 runs/month" },
  { value: "team", label: "Pro+ / Team", limit: "~50,000 runs/month" },
  { value: "enterprise", label: "Enterprise", limit: "Contract scope" },
];

const PLAN_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  enterprise: "default",
  team: "secondary",
  pro: "outline",
  free: "outline",
};

export default function ApiKeys() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyPlan, setNewKeyPlan] = useState("free");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<ProvisionKeyResponse | null>(null);
  const [showKeyDialogOpen, setShowKeyDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keySavedConfirmed, setKeySavedConfirmed] = useState(false);
  const keyDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadKeys();
    }
  }, [user]);

  // Auto-select key text when dialog opens
  useEffect(() => {
    if (showKeyDialogOpen && keyDisplayRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(keyDisplayRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    // Reset confirmation when dialog opens
    if (showKeyDialogOpen) {
      setKeySavedConfirmed(false);
    }
  }, [showKeyDialogOpen]);

  async function loadKeys() {
    setLoadError(null);
    try {
      const data = await listKeys();
      setKeys(data);
    } catch (error) {
      console.error("Failed to load keys:", error);
      const apiError = parseApiError(error);
      setLoadError(apiError);
      toast({
        variant: "destructive",
        title: `Error (${apiError.code})`,
        description: getFriendlyErrorMessage(apiError),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey() {
    if (!newKeyLabel.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a key name",
      });
      return;
    }

    setCreating(true);
    try {
      const result = await provisionKey(newKeyPlan, newKeyLabel);
      setNewKeyResult(result);
      setCreateDialogOpen(false);
      setShowKeyDialogOpen(true);
      setNewKeyLabel("");
      setNewKeyPlan("free");
      await loadKeys();
    } catch (error) {
      console.error("Failed to create key:", error);
      const apiError = parseApiError(error);
      toast({
        variant: "destructive",
        title: `Error (${apiError.code})`,
        description: getFriendlyErrorMessage(apiError),
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleRotateKey(keyId: string) {
    try {
      const result = await rotateKey(keyId);
      setNewKeyResult(result);
      setShowKeyDialogOpen(true);
      await loadKeys();
      toast({
        title: "Key rotated",
        description: "Your old key has been revoked and a new one created.",
      });
    } catch (error) {
      console.error("Failed to rotate key:", error);
      const apiError = parseApiError(error);
      toast({
        variant: "destructive",
        title: `Error (${apiError.code})`,
        description: getFriendlyErrorMessage(apiError),
      });
    }
  }

  async function handleRevokeKey(keyId: string) {
    try {
      await revokeKey(keyId);
      await loadKeys();
      toast({
        title: "Key revoked",
        description: "The API key has been revoked and can no longer be used.",
      });
    } catch (error) {
      console.error("Failed to revoke key:", error);
      const apiError = parseApiError(error);
      toast({
        variant: "destructive",
        title: `Error (${apiError.code})`,
        description: getFriendlyErrorMessage(apiError),
      });
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function handleCloseKeyDialog() {
    if (keySavedConfirmed) {
      setShowKeyDialogOpen(false);
      setKeySavedConfirmed(false);
    }
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen text-caption">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const activeKeys = keys.filter((k) => k.status === "active");
  const hasNoActiveKeys = activeKeys.length === 0;

  return (
    <>
      <Helmet>
        <title>API Keys | NexArt Dashboard</title>
        <meta name="description" content="Manage your NexArt API keys for certified execution." />
      </Helmet>
      
      <DashboardLayout title="API Keys">
        <div className="space-y-6">
          {/* Error State */}
          {loadError && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  {loadError.isServiceUnavailable ? "Service Unavailable" : "Error Loading Keys"}
                </CardTitle>
                <CardDescription className="text-destructive/80">
                  {getFriendlyErrorMessage(loadError)}
                  {loadError.code && <span className="ml-2 font-mono text-xs">({loadError.code})</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => loadKeys()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* No Keys CTA */}
          {hasNoActiveKeys && !loading && !loadError && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5" />
                  Create your first API key
                </CardTitle>
                <CardDescription>
                  You need an API key to authenticate with the canonical renderer and run certified executions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Key className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <p className="text-caption text-sm">
              Keys are hashed and stored securely. Plaintext is shown once only.
            </p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key for certified execution. You'll only see the key once.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Production Key"
                      value={newKeyLabel}
                      onChange={(e) => setNewKeyLabel(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-plan">Plan</Label>
                    <Select value={newKeyPlan} onValueChange={setNewKeyPlan}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_OPTIONS.map((plan) => (
                          <SelectItem key={plan.value} value={plan.value}>
                            {plan.label} ({plan.limit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey} disabled={creating}>
                    {creating ? "Creating..." : "Create Key"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* New Key Dialog - One-time display with confirmation checkbox */}
          <Dialog open={showKeyDialogOpen} onOpenChange={(open) => {
            // Only allow closing if confirmed
            if (!open && !keySavedConfirmed) {
              return;
            }
            setShowKeyDialogOpen(open);
          }}>
            <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => {
              // Prevent closing on outside click unless confirmed
              if (!keySavedConfirmed) {
                e.preventDefault();
              }
            }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Your New API Key
                </DialogTitle>
              </DialogHeader>
              {newKeyResult && (
                <div className="space-y-4 py-4">
                  {/* Strong Warning */}
                  <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-900 dark:text-amber-200">
                    <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold">This key will not be shown again.</p>
                      <p className="mt-1 opacity-90">Store it securely. If you lose it, you'll need to create a new key.</p>
                    </div>
                  </div>

                  {/* Key Display - Auto-selected */}
                  <div className="bg-muted p-4 rounded-md">
                    <code 
                      ref={keyDisplayRef}
                      className="text-sm break-all font-mono select-all"
                    >
                      {newKeyResult.apiKey}
                    </code>
                  </div>
                  
                  {/* Copy Button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => copyToClipboard(newKeyResult.apiKey)}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>

                  {/* Key Details */}
                  <div className="text-sm space-y-2 pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-caption">Label</span>
                      <span className="font-medium">{newKeyResult.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-caption">Plan</span>
                      <Badge variant={PLAN_BADGE_VARIANTS[newKeyResult.plan] || "outline"} className="capitalize">
                        {newKeyResult.plan}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-caption">Monthly Limit</span>
                      <span>{newKeyResult.monthlyLimit.toLocaleString()} runs</span>
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-border">
                    <Checkbox 
                      id="confirm-saved"
                      checked={keySavedConfirmed}
                      onCheckedChange={(checked) => setKeySavedConfirmed(checked === true)}
                    />
                    <label 
                      htmlFor="confirm-saved"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I have securely saved this API key
                    </label>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button 
                  onClick={handleCloseKeyDialog}
                  disabled={!keySavedConfirmed}
                  className={!keySavedConfirmed ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Keys Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your API Keys</CardTitle>
              <CardDescription>
                Active and revoked keys for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-caption">Loading...</p>
              ) : loadError ? (
                <p className="text-caption">Unable to load keys. Please try again.</p>
              ) : keys.length === 0 ? (
                <p className="text-caption">No API keys yet. Create one to get started.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Monthly Limit</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.id} className={key.status === "revoked" ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{key.label}</TableCell>
                        <TableCell>
                          <Badge variant={PLAN_BADGE_VARIANTS[key.plan] || "outline"} className="capitalize">
                            {key.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={key.status === "active" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {key.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{key.monthly_limit.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(key.created_at)}</TableCell>
                        <TableCell className="text-right">
                          {key.status === "active" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRotateKey(key.id)}
                                title="Rotate key"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeKey(key.id)}
                                title="Revoke key"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Terminal className="h-5 w-5" />
                Quick Start
              </CardTitle>
              <CardDescription>
                Use your API key with the canonical renderer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto space-y-3">
                <div>
                  <div className="text-caption"># Set environment variables</div>
                  <div className="mt-1">export NEXART_RENDERER_ENDPOINT="https://nexart-canonical-renderer-production.up.railway.app"</div>
                  <div className="mt-1">export NEXART_API_KEY="nx_live_..."</div>
                </div>
                <div>
                  <div className="text-caption"># Run a certified render</div>
                  <div className="mt-1">npx --yes @nexart/cli@0.2.3 nexart run ./examples/sketch.js \</div>
                  <div className="pl-4">--seed 12345 --vars "50,50,50,0,0,0,0,0,0,0" \</div>
                  <div className="pl-4">--include-code --out out.png</div>
                </div>
                <div>
                  <div className="text-caption"># Verify the snapshot</div>
                  <div className="mt-1">npx --yes @nexart/cli@0.2.3 nexart verify out.snapshot.json</div>
                </div>
              </div>

              {/* PNG Warning */}
              <div className="flex items-start gap-3 text-sm bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 p-3 rounded-md">
                <FileImage className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">The canonical renderer returns a PNG (image/png), not JSON.</p>
                  <p className="text-caption mt-1">Treat responses as binary data. Parse the snapshot file separately.</p>
                </div>
              </div>

              {/* Canvas Warning */}
              <div className="flex items-start gap-3 text-sm text-caption bg-muted/50 p-3 rounded-md">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Canonical size is enforced (1950×2400). Do not pass custom width/height.</span>
              </div>

              <Link to="/builders/cli" className="inline-block">
                <Button variant="link" className="p-0 h-auto text-sm">
                  View full CLI documentation →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}
