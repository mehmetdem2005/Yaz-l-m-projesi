'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Package,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowUpCircle,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

type DepStatus = 'up-to-date' | 'outdated' | 'vulnerable';

interface Dependency {
  name: string;
  version: string;
  latest: string;
  status: DepStatus;
  type: 'dependencies' | 'devDependencies';
  cvss?: number;
  advisory?: string;
  description: string;
}

const DEPS: Dependency[] = [
  { name: 'next', version: '15.1.3', latest: '16.0.0', status: 'outdated', type: 'dependencies', description: 'React framework' },
  { name: 'react', version: '19.0.0', latest: '19.0.0', status: 'up-to-date', type: 'dependencies', description: 'UI library' },
  { name: 'react-dom', version: '19.0.0', latest: '19.0.0', status: 'up-to-date', type: 'dependencies', description: 'React DOM renderer' },
  { name: 'recharts', version: '2.13.0', latest: '2.15.4', status: 'outdated', type: 'dependencies', description: 'Chart library' },
  { name: 'lucide-react', version: '0.460.0', latest: '0.525.0', status: 'outdated', type: 'dependencies', description: 'Icons' },
  { name: 'zustand', version: '5.0.2', latest: '5.0.2', status: 'up-to-date', type: 'dependencies', description: 'State management' },
  { name: 'framer-motion', version: '11.15.0', latest: '12.23.2', status: 'outdated', type: 'dependencies', description: 'Animation' },
  { name: 'axios', version: '1.6.0', latest: '1.7.9', status: 'vulnerable', type: 'dependencies', cvss: 7.5, advisory: 'CVE-2024-39338: SSRF vulnerability', description: 'HTTP client' },
  { name: 'lodash', version: '4.17.20', latest: '4.17.21', status: 'vulnerable', type: 'dependencies', cvss: 9.1, advisory: 'CVE-2021-23337: Command injection', description: 'Utility library' },
  { name: '@prisma/client', version: '6.11.1', latest: '6.11.1', status: 'up-to-date', type: 'dependencies', description: 'ORM client' },
  { name: 'zod', version: '3.22.4', latest: '3.24.1', status: 'outdated', type: 'dependencies', description: 'Schema validation' },
  { name: 'ws', version: '8.11.0', latest: '8.18.0', status: 'vulnerable', type: 'dependencies', cvss: 6.5, advisory: 'CVE-2024-37890: DoS via HTTP headers', description: 'WebSocket' },
  { name: 'typescript', version: '5.7.2', latest: '5.7.2', status: 'up-to-date', type: 'devDependencies', description: 'Type system' },
  { name: 'eslint', version: '8.57.0', latest: '9.17.0', status: 'outdated', type: 'devDependencies', description: 'Linter' },
  { name: 'vitest', version: '2.1.8', latest: '2.1.8', status: 'up-to-date', type: 'devDependencies', description: 'Test runner' },
  { name: '@types/node', version: '20.10.0', latest: '22.10.0', status: 'outdated', type: 'devDependencies', description: 'Node typings' },
];

const STATUS_META: Record<DepStatus, { color: string; label: string; icon: any; bg: string }> = {
  'up-to-date': { color: '#10b981', label: 'Güncel', icon: ShieldCheck, bg: 'rgba(16,185,129,0.1)' },
  'outdated': { color: '#f59e0b', label: 'Güncelliğini Yitirmiş', icon: ArrowUpCircle, bg: 'rgba(245,158,11,0.1)' },
  'vulnerable': { color: '#ef4444', label: 'Zafiyetli', icon: ShieldAlert, bg: 'rgba(239,68,68,0.1)' },
};

function cvssSeverity(score?: number): 'critical' | 'high' | 'medium' | 'low' | 'none' {
  if (!score) return 'none';
  if (score >= 9) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

export function DependencyMonitorView() {
  const [filter, setFilter] = useState<'all' | 'outdated' | 'vulnerable'>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dependencies' | 'devDependencies'>('all');
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const activeProject = useStore((s) => s.activeProject);

  const filtered = useMemo(() => {
    return DEPS.filter((d) => {
      if (filter === 'outdated' && d.status !== 'outdated') return false;
      if (filter === 'vulnerable' && d.status !== 'vulnerable') return false;
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, search, typeFilter]);

  const stats = useMemo(() => {
    const total = DEPS.length;
    const outdated = DEPS.filter((d) => d.status === 'outdated').length;
    const vulnerable = DEPS.filter((d) => d.status === 'vulnerable').length;
    const upToDate = DEPS.filter((d) => d.status === 'up-to-date').length;
    const avgCvss = DEPS.filter((d) => d.cvss).reduce((s, d) => s + (d.cvss || 0), 0) /
      Math.max(1, DEPS.filter((d) => d.cvss).length);
    return { total, outdated, vulnerable, upToDate, avgCvss };
  }, []);

  const handleUpdate = async (name: string) => {
    setUpdating((p) => ({ ...p, [name]: true }));
    await new Promise((r) => setTimeout(r, 1200));
    setUpdating((p) => ({ ...p, [name]: false }));
    toast.success(`${name} güncellendi (simülasyon)`);
  };

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="text-blue-400" /> Dependency Monitor
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeProject ? (
                <>Aktif proje: <span className="font-medium">{activeProject.name}</span> · package.json</>
              ) : (
                'Demo package.json — bağımlılık durumu takibi'
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={() => toast.info('Tüm paketler tarandı (simülasyon)')}>
            <RefreshCw size={14} className="mr-1" /> Yeniden Tara
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Package size={14} className="text-blue-400" />
                <span className="text-[10px] text-muted-foreground">Toplam</span>
              </div>
              <div className="text-xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <CheckCircle2 size={14} className="text-green-400" />
                <span className="text-[10px] text-muted-foreground">Güncel</span>
              </div>
              <div className="text-xl font-bold text-green-400">{stats.upToDate}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <ArrowUpCircle size={14} className="text-amber-400" />
                <span className="text-[10px] text-muted-foreground">Outdated</span>
              </div>
              <div className="text-xl font-bold text-amber-400">{stats.outdated}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <ShieldAlert size={14} className="text-red-400" />
                <span className="text-[10px] text-muted-foreground">Zafiyetli</span>
              </div>
              <div className="text-xl font-bold text-red-400">{stats.vulnerable}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Activity size={14} className="text-purple-400" />
                <span className="text-[10px] text-muted-foreground">Ort. CVSS</span>
              </div>
              <div className="text-xl font-bold text-purple-400">{stats.avgCvss.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            {(['all', 'outdated', 'vulnerable'] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'ghost'}
                className="h-7 text-xs"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Tümü' : f === 'outdated' ? 'Güncelliğini Yitiren' : 'Zafiyetli'}
              </Button>
            ))}
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tüm tipler</SelectItem>
              <SelectItem value="dependencies" className="text-xs">dependencies</SelectItem>
              <SelectItem value="devDependencies" className="text-xs">devDependencies</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Paket ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 h-8 text-xs"
          />
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} paket</span>
        </div>

        {/* Dependency list */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 px-3 font-medium">Paket</th>
                    <th className="py-2 px-3 font-medium">Mevcut</th>
                    <th className="py-2 px-3 font-medium">Son</th>
                    <th className="py-2 px-3 font-medium">Durum</th>
                    <th className="py-2 px-3 font-medium">Zafiyet</th>
                    <th className="py-2 px-3 font-medium text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => {
                    const meta = STATUS_META[d.status];
                    const Icon = meta.icon;
                    const sev = cvssSeverity(d.cvss);
                    return (
                      <tr key={d.name} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <Package size={12} className="text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-mono font-medium truncate">{d.name}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{d.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">{d.version}</td>
                        <td className="py-2.5 px-3 font-mono">
                          {d.latest !== d.version ? (
                            <span className="text-green-400">{d.latest}</span>
                          ) : (
                            <span className="text-muted-foreground">{d.latest}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant="outline"
                            className="text-[10px] flex items-center gap-1 w-fit"
                            style={{ color: meta.color, borderColor: `${meta.color}55`, background: meta.bg }}
                          >
                            <Icon size={10} /> {meta.label}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          {d.cvss ? (
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className="text-[10px] font-mono"
                                style={{
                                  color:
                                    sev === 'critical' ? '#dc2626' :
                                    sev === 'high' ? '#ea580c' :
                                    sev === 'medium' ? '#ca8a04' : '#0891b2',
                                  borderColor: 'currentColor',
                                }}
                              >
                                CVSS {d.cvss}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[180px]" title={d.advisory}>
                                {d.advisory}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {d.status !== 'up-to-date' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px]"
                              disabled={updating[d.name]}
                              onClick={() => handleUpdate(d.name)}
                            >
                              {updating[d.name] ? (
                                <RefreshCw size={11} className="animate-spin mr-1" />
                              ) : (
                                <ArrowUpCircle size={11} className="mr-1" />
                              )}
                              Güncelle
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        <XCircle size={24} className="mx-auto mb-2 opacity-30" />
                        Bu filtre ile eşleşen paket yok
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        {stats.vulnerable > 0 && (
          <Card className="mt-4 bg-red-500/5 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-400 mb-1">
                    Acil güncelleme önerisi
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {stats.vulnerable} paket güvenlik zafiyeti içeriyor. Ortalama CVSS skoru {stats.avgCvss.toFixed(1)}.
                    Kritik paketleri öncelikli güncelleyin.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      DEPS.filter((d) => d.status === 'vulnerable').forEach((d) => handleUpdate(d.name));
                    }}
                  >
                    <Shield size={12} className="mr-1" /> Tüm Zafiyetlileri Güncelle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
