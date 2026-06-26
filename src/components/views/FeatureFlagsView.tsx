'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Flag,
  Plus,
  FlaskConical,
  Rocket,
  Code,
} from 'lucide-react';
import { toast } from 'sonner';

type Env = 'dev' | 'staging' | 'prod';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: Env;
  percentage: number;
}

const INITIAL_FLAGS: FeatureFlag[] = [
  { id: 'f1', name: 'new_ai_reasoner', description: 'DeepSeek V4 Reasoner modeli tüm kullanıcılarda aktif', enabled: true, environment: 'prod', percentage: 100 },
  { id: 'f2', name: 'agent_planning_v2', description: 'ReAct planner\'a multi-step lookahead ekle', enabled: true, environment: 'staging', percentage: 50 },
  { id: 'f3', name: 'policy_compliance_check', description: 'ISO 27001 + SOC 2 gerçek zamanlı kontrol', enabled: true, environment: 'prod', percentage: 25 },
  { id: 'f4', name: 'dark_mode_v2', description: 'Yeni tema altyapısı (Tailwind 4)', enabled: false, environment: 'dev', percentage: 0 },
  { id: 'f5', name: 'realtime_collab', description: 'Socket.io ile canlı işbirliği', enabled: false, environment: 'dev', percentage: 0 },
  { id: 'f6', name: 'agent_memory_persistence', description: 'Vector DB ile uzun süreli hafıza', enabled: true, environment: 'staging', percentage: 100 },
  { id: 'f7', name: 'billing_stripe', description: 'Stripe ile abonelik yönetimi', enabled: false, environment: 'prod', percentage: 0 },
  { id: 'f8', name: 'audit_log_export', description: 'Audit log CSV dışa aktarımı', enabled: true, environment: 'prod', percentage: 100 },
  { id: 'f9', name: 'experimental_code_completion', description: 'Tab completion (FIM modeli)', enabled: true, environment: 'dev', percentage: 80 },
];

const ENV_META: Record<Env, { color: string; label: string; icon: typeof Code }> = {
  dev: { color: '#3b82f6', label: 'Development', icon: Code },
  staging: { color: '#f59e0b', label: 'Staging', icon: FlaskConical },
  prod: { color: '#10b981', label: 'Production', icon: Rocket },
};

export function FeatureFlagsView() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [envFilter, setEnvFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFlag, setNewFlag] = useState({ name: '', description: '', environment: 'dev' as Env, percentage: 0 });
  void useStore((s) => s.activeView);

  const filtered = useMemo(() => {
    return envFilter === 'all' ? flags : flags.filter((f) => f.environment === envFilter);
  }, [flags, envFilter]);

  const toggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, enabled: !f.enabled, percentage: !f.enabled ? (f.percentage === 0 ? 100 : f.percentage) : 0 }
          : f
      )
    );
    const f = flags.find((x) => x.id === id);
    if (f) toast.success(`${f.name} ${f.enabled ? 'kapatıldı' : 'açtıldı'}`);
  };

  const setPercentage = (id: string, value: number) => {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, percentage: value, enabled: value > 0 } : f)));
  };

  const handleCreate = () => {
    if (!newFlag.name.trim()) {
      toast.error('Flag adı gerekli');
      return;
    }
    const flag: FeatureFlag = {
      id: `f${Date.now()}`,
      name: newFlag.name.trim().replace(/\s+/g, '_').toLowerCase(),
      description: newFlag.description,
      enabled: newFlag.percentage > 0,
      environment: newFlag.environment,
      percentage: newFlag.percentage,
    };
    setFlags((prev) => [flag, ...prev]);
    toast.success(`Yeni flag oluşturuldu: ${flag.name}`);
    setNewFlag({ name: '', description: '', environment: 'dev', percentage: 0 });
    setDialogOpen(false);
  };

  const stats = {
    total: flags.length,
    active: flags.filter((f) => f.enabled).length,
    prod: flags.filter((f) => f.environment === 'prod' && f.enabled).length,
    exp: flags.filter((f) => f.environment === 'dev' && f.enabled).length,
  };

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Flag className="text-blue-400" /> Feature Flags
            </h1>
            <p className="text-sm text-muted-foreground">
              Runtime feature toggle — environment bazlı, percentage rollout
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={14} className="mr-1" /> Yeni Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#252526] border-border">
              <DialogHeader>
                <DialogTitle>Yeni Feature Flag</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label className="text-xs">Flag Adı</Label>
                  <Input
                    value={newFlag.name}
                    onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                    placeholder="ornek: new_dashboard_v2"
                    className="mt-1 font-mono text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Açıklama</Label>
                  <Textarea
                    value={newFlag.description}
                    onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                    placeholder="Bu flag ne yapar?"
                    rows={2}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Environment</Label>
                  <Select
                    value={newFlag.environment}
                    onValueChange={(v) => setNewFlag({ ...newFlag, environment: v as Env })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="prod">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Rollout Percentage: {newFlag.percentage}%</Label>
                  <Slider
                    value={[newFlag.percentage]}
                    onValueChange={(v) => setNewFlag({ ...newFlag, percentage: v[0] })}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                <Button onClick={handleCreate}>Oluştur</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Metrikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Flag size={16} className="text-blue-400" />
                <span className="text-xs text-muted-foreground">Toplam</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Rocket size={16} className="text-green-400" />
                <span className="text-xs text-muted-foreground">Aktif</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Rocket size={16} className="text-green-400" />
                <span className="text-xs text-muted-foreground">Prod Aktif</span>
              </div>
              <div className="text-2xl font-bold">{stats.prod}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Code size={16} className="text-blue-400" />
                <span className="text-xs text-muted-foreground">Dev Aktif</span>
              </div>
              <div className="text-2xl font-bold">{stats.exp}</div>
            </CardContent>
          </Card>
        </div>

        {/* Env filter */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">Environment:</span>
          <Select value={envFilter} onValueChange={setEnvFilter}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="dev">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="prod">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Flag listesi */}
        <div className="space-y-2">
          {filtered.map((f) => {
            const meta = ENV_META[f.environment];
            const Icon = meta.icon;
            return (
              <Card key={f.id} className={`bg-card border-border ${f.enabled ? '' : 'opacity-70'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <code className="text-sm font-mono font-medium">{f.name}</code>
                        <Badge
                          variant="outline"
                          className="text-[9px]"
                          style={{ color: meta.color, borderColor: meta.color }}
                        >
                          <Icon size={10} className="mr-1" />
                          {meta.label}
                        </Badge>
                        {f.enabled ? (
                          <Badge variant="secondary" className="text-[9px] bg-green-500/20 text-green-300">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px]">Kapalı</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{f.description}</p>
                      <div className="flex items-center gap-3">
                        <Label className="text-[10px] text-muted-foreground whitespace-nowrap">Rollout: {f.percentage}%</Label>
                        <Slider
                          value={[f.percentage]}
                          onValueChange={(v) => setPercentage(f.id, v[0])}
                          max={100}
                          step={5}
                          className="flex-1 max-w-xs"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch checked={f.enabled} onCheckedChange={() => toggleFlag(f.id)} />
                      <span className="text-[10px] text-muted-foreground">{f.enabled ? 'ON' : 'OFF'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
