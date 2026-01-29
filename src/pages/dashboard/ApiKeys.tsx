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
  getAccountPlan,
  ApiKey, 
  AccountPlan,
  ProvisionKeyResponse,
  parseApiError,
  getFriendlyErrorMessage,
  ApiError 
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Check, RefreshCw, Ban, Key, Terminal, AlertTriangle, FileImage, ShieldAlert, AlertCircle, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PLAN_NAMES: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  team: "Pro+ / Team",
  enterprise: "Enterprise",
};

// Key Limit Reached Dialog Component
function KeyLimitDialog({ 
  open, 
  onOpenChange, 
  maxKeys, 
  keysUsed 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  maxKeys: number; 
  keysUsed: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Key Limit Reached
          </DialogTitle>
          <DialogDescription>
            Your plan allows {maxKeys} API key{maxKeys !== 1 ? 's' : ''} and you currently have {keysUsed}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-body">
            To create a new API key, you can:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-caption list-disc list-inside">
            <li>Revoke an existing key you no longer need</li>
            <li>Upgrade your plan to get more keys</li>
          </ul>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Manage Keys
          </Button>
          <Button asChild>
            <Link to="/dashboard/billing">View Plans</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ApiKeys() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [accountPlan, setAccountPlan] = useState<AccountPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<ProvisionKeyResponse | null>(null);
  const [showKeyDialogOpen, setShowKeyDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keySavedConfirmed, setKeySavedConfirmed] = useState(false);
  const [keyLimitDialogOpen, setKeyLimitDialogOpen] = useState(false);
  const keyDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadData();
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

  async function loadData() {
    setLoadError(null);
    try {
      const [keysData, planData] = await Promise.all([
        listKeys(),
        getAccountPlan(),
      ]);
      setKeys(keysData);
      setAccountPlan(planData);
    } catch (error) {
      console.error("Failed to load data:", error);
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
      const result = await provisionKey(newKeyLabel);
      setNewKeyResult(result);
      setCreateDialogOpen(false);
      setShowKeyDialogOpen(true);
      setNewKeyLabel("");
      await loadData();
    } catch (error) {
      console.error("Failed to create key:", error);
      const apiError = parseApiError(error);
      
      // Handle KEY_LIMIT_REACHED specifically
      if (apiError.code === "KEY_LIMIT_REACHED") {
        setCreateDialogOpen(false);
        setKeyLimitDialogOpen(true);
        await loadData(); // Refresh to get updated counts
      } else {
        toast({
          variant: "destructive",
          title: `Error (${apiError.code})`,
          description: getFriendlyErrorMessage(apiError),
        });
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleRotateKey(keyId: string) {
    try {
      const result = await rotateKey(keyId);
      setNewKeyResult(result);
      setShowKeyDialogOpen(true);
      await loadData();
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
      await loadData();
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
                <Button variant="outline" onClick={() => loadData()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Account Plan Info with Key Limits */}
          {accountPlan && !loadError && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Account Limits</CardTitle>
                <CardDescription>
                  Quota and key limits are shared across all your API keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="default">{accountPlan.planName}</Badge>
                  <span className="text-sm text-caption">
                    <strong>{accountPlan.keysUsed}</strong> / {accountPlan.maxKeys} API keys
                  </span>
                  <span className="text-sm text-caption">
                    <strong>{accountPlan.used.toLocaleString()}</strong> / {accountPlan.monthlyLimit.toLocaleString()} certified runs this month
                  </span>
                </div>
                <p className="text-xs text-caption">
                  API keys are credentials for separating environments. Creating more keys does not increase your certified run quota.
                </p>
                {accountPlan.keysRemaining === 0 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-900 dark:text-amber-200 text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Key limit reached.</span>{" "}
                      Revoke an existing key or{" "}
                      <Link to="/dashboard/billing" className="underline font-medium">
                        upgrade your plan
                      </Link>{" "}
                      to add more keys.
                    </div>
                  </div>
                )}
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
              Keys are credentials only. Quota is enforced at the account level.
            </p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={accountPlan?.keysRemaining === 0}>
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
                    <p className="text-xs text-caption">
                      Use descriptive names to identify keys (e.g., "Production", "CI/CD", "Development")
                    </p>
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

          {/* Key Limit Reached Error Dialog */}
          <KeyLimitDialog 
            open={keyLimitDialogOpen} 
            onOpenChange={setKeyLimitDialogOpen}
            maxKeys={accountPlan?.maxKeys || 2}
            keysUsed={accountPlan?.keysUsed || 0}
          />

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
                      <p className="mt-1 opacity-90">Store it securely. If you lose it, you'll need to rotate it.</p>
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

          {/* Keys Table - Simplified: no per-key plan/limit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your API Keys</CardTitle>
              <CardDescription>
                Active and revoked keys for your account. Keys share your account quota.
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
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.id} className={key.status === "revoked" ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{key.label}</TableCell>
                        <TableCell>
                          <Badge
                            variant={key.status === "active" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {key.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(key.created_at)}</TableCell>
                        <TableCell className="text-right">
                          {key.status === "active" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRotateKey(key.id)}
                                title="Lost this key? Rotate to get a new one"
                              >
                                <RefreshCw className="h-4 w-4" />
                                <span className="sr-only">Rotate</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeKey(key.id)}
                                title="Revoke key"
                              >
                                <Ban className="h-4 w-4" />
                                <span className="sr-only">Revoke</span>
                              </Button>
                            </div>
                          )}
                          {key.status === "revoked" && (
                            <span className="text-xs text-caption">Revoked</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Lost Key Help */}
              {activeKeys.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-2 text-sm text-caption">
                    <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Lost a key?</span> Click the rotate button (
                      <RefreshCw className="h-3 w-3 inline mx-1" />) to revoke the old key and create a new one.
                      Keys cannot be retrieved after creation.
                    </div>
                  </div>
                </div>
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
                  <div className="mt-1">npx --yes @nexart/cli@0.2.3 run ./examples/sketch.js \</div>
                  <div className="pl-4">--seed 12345 --vars "50,50,50,0,0,0,0,0,0,0" \</div>
                  <div className="pl-4">--include-code --out out.png</div>
                </div>
                <div>
                  <div className="text-caption"># Verify the snapshot</div>
                  <div className="mt-1">npx --yes @nexart/cli@0.2.3 verify out.snapshot.json</div>
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
