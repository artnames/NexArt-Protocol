import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { listKeys, provisionKey, revokeKey, rotateKey, ApiKey, ProvisionKeyResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Check, RefreshCw, Ban, Key } from "lucide-react";

export default function ApiKeys() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyPlan, setNewKeyPlan] = useState("free");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<ProvisionKeyResponse | null>(null);
  const [showKeyDialogOpen, setShowKeyDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const data = await listKeys();
      setKeys(data);
    } catch (error) {
      console.error("Failed to load keys:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load API keys",
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create API key",
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rotate API key",
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke API key",
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

  return (
    <>
      <Helmet>
        <title>API Keys | NexArt Dashboard</title>
        <meta name="description" content="Manage your NexArt API keys for certified execution." />
      </Helmet>
      
      <DashboardLayout title="API Keys">
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex justify-between items-center">
            <p className="text-caption">
              Manage your API keys for certified execution. Keys are hashed and stored securely.
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
                        <SelectItem value="free">Free (100 runs/month)</SelectItem>
                        <SelectItem value="pro">Pro (10,000 runs/month)</SelectItem>
                        <SelectItem value="team">Team (100,000 runs/month)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1,000,000 runs/month)</SelectItem>
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

          {/* New Key Dialog */}
          <Dialog open={showKeyDialogOpen} onOpenChange={setShowKeyDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Your New API Key
                </DialogTitle>
                <DialogDescription>
                  Copy this key now. You won't be able to see it again.
                </DialogDescription>
              </DialogHeader>
              {newKeyResult && (
                <div className="space-y-4 py-4">
                  <div className="bg-muted p-4 rounded-md">
                    <code className="text-sm break-all">{newKeyResult.apiKey}</code>
                  </div>
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
                  <div className="text-sm text-caption space-y-1">
                    <p><strong>Label:</strong> {newKeyResult.label}</p>
                    <p><strong>Plan:</strong> {newKeyResult.plan}</p>
                    <p><strong>Monthly Limit:</strong> {newKeyResult.monthlyLimit.toLocaleString()} runs</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setShowKeyDialogOpen(false)}>
                  I've Saved My Key
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
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.label}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
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
        </div>
      </DashboardLayout>
    </>
  );
}
