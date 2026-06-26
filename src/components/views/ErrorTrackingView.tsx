'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Bug,
  CheckCircle2,
  EyeOff,
  Flame,
  AlertTriangle,
  Clock,
  User,
  Server,
} from 'lucide-react';
import { toast } from 'sonner';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type ErrorStatus = 'unresolved' | 'resolved' | 'ignored';

interface TrackedError {
  id: string;
  message: string;
  count: number;
  lastSeen: string;
  severity: Severity;
  file: string;
  stack: string;
  environment: 'production' | 'staging' | 'development';
  user: string;
  status: ErrorStatus;
}

const INITIAL_ERRORS: TrackedError[] = [
  {
    id: 'e1',
    message: 'TypeError: Cannot read properties of undefined (reading \'id\')',
    count: 142,
    lastSeen: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    severity: 'critical',
    file: 'src/components/views/Projects.tsx:87',
    stack: `TypeError: Cannot read properties of undefined (reading 'id')
    at ProjectCard (src/components/views/Projects.tsx:87:22)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at mountIndeterminateComponent (node_modules/react-dom/cjs/react-dom.development.js:17811:13)`,
    environment: 'production',
    user: 'user_8a4f2c',
    status: 'unresolved',
  },
  {
    id: 'e2',
    message: 'ChunkLoadError: Loading chunk 42 failed',
    count: 67,
    lastSeen: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    severity: 'high',
    file: 'src/app/layout.tsx:12',
    stack: `ChunkLoadError: Loading chunk 42 failed.
  (timeout: https://example.com/_next/static/chunks/42.js)
    at Object.__webpack_require__.f.j (webpack/runtime:184:22)
    at webpack/runtime:74:40`,
    environment: 'production',
    user: 'user_2d1e8a',
    status: 'unresolved',
  },
  {
    id: 'e3',
    message: 'Network Error: API request timeout (5000ms)',
    count: 89,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    severity: 'high',
    file: 'src/lib/api.ts:34',
    stack: `AxiosError: timeout of 5000ms exceeded
    at XMLHttpRequest.handleTimeout (node_modules/axios/lib/adapters/xhr.js:118:16)
    at apiClient.get (src/lib/api.ts:34:9)`,
    environment: 'production',
    user: 'user_b81c9d',
    status: 'unresolved',
  },
  {
    id: 'e4',
    message: 'ValidationError: project name must be unique',
    count: 23,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    severity: 'medium',
    file: 'src/app/api/projects/route.ts:42',
    stack: `ValidationError: project name must be unique
    at validateProject (src/lib/validation.ts:18:11)
    at POST (src/app/api/projects/route.ts:42:5)`,
    environment: 'staging',
    user: 'ahmet.yilmaz',
    status: 'unresolved',
  },
  {
    id: 'e5',
    message: 'Hydration failed: server HTML doesn\'t match client',
    count: 12,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    severity: 'medium',
    file: 'src/components/ThemeToggle.tsx:24',
    stack: `Hydration failed because the initial UI does not match what was rendered on the server.
    at ThemeToggle (src/components/ThemeToggle.tsx:24:5)
    at Layout (src/app/layout.tsx:42:3)`,
    environment: 'production',
    user: 'user_5fae21',
    status: 'ignored',
  },
  {
    id: 'e6',
    message: 'RangeError: Maximum call stack size exceeded',
    count: 4,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    severity: 'critical',
    file: 'src/lib/agent.ts:128',
    stack: `RangeError: Maximum call stack size exceeded
    at recursivePlan (src/lib/agent.ts:128:9)
    at recursivePlan (src/lib/agent.ts:132:16)
    at recursivePlan (src/lib/agent.ts:132:16)`,
    environment: 'development',
    user: 'system',
    status: 'resolved',
  },
  {
    id: 'e7',
    message: 'SyntaxError: Unexpected token \'<\' in JSON',
    count: 31,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    severity: 'low',
    file: 'src/lib/api.ts:67',
    stack: `SyntaxError: Unexpected token '<', "<!DOCTYPE html>... is not valid JSON
    at JSON.parse (<anonymous>)
    at handleResponse (src/lib/api.ts:67:21)`,
    environment: 'production',
    user: 'user_7c2b8e',
    status: 'unresolved',
  },
];

const SEV_META: Record<Severity, { color: string; label: string; icon: typeof Flame }> = {
  critical: { color: '#dc2626', label: 'Kritik', icon: Flame },
  high: { color: '#ea580c', label: 'Yüksek', icon: AlertTriangle },
  medium: { color: '#ca8a04', label: 'Orta', icon: Bug },
  low: { color: '#0891b2', label: 'Düşük', icon: Bug },
};

// 14 günlük trend
const TREND_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `${14 - i}g`,
  errors: Math.floor(Math.random() * 40) + 5 + (i < 3 ? 30 : 0),
}));

export function ErrorTrackingView() {
  const [errors, setErrors] = useState<TrackedError[]>(INITIAL_ERRORS);
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_ERRORS[0].id);
  const [sevFilter, setSevFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  void useStore((s) => s.activeView);

  const filtered = useMemo(() => {
    return errors.filter((e) => {
      if (sevFilter !== 'all' && e.severity !== sevFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      return true;
    });
  }, [errors, sevFilter, statusFilter]);

  const selected = errors.find((e) => e.id === selectedId) || null;

  const updateStatus = (id: string, status: ErrorStatus) => {
    setErrors((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    toast.success(`Hata "${status}" olarak işaretlendi`);
  };

  const unresolved = errors.filter((e) => e.status === 'unresolved').length;
  const totalEvents = errors.reduce((s, e) => s + e.count, 0);

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="text-red-400" /> Error Tracking
          </h1>
          <p className="text-sm text-muted-foreground">
            Sentry benzeri hata izleme — toplam olay, son görülme, stack trace
          </p>
        </div>

        {/* Metrikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-amber-400" />
                <span className="text-xs text-muted-foreground">Çözülmemiş</span>
              </div>
              <div className="text-2xl font-bold text-amber-400">{unresolved}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Bug size={16} className="text-red-400" />
                <span className="text-xs text-muted-foreground">Toplam Olay</span>
              </div>
              <div className="text-2xl font-bold text-red-400">{totalEvents}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-xs text-muted-foreground">Çözüldü</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {errors.filter((e) => e.status === 'resolved').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <EyeOff size={16} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Yoksayılan</span>
              </div>
              <div className="text-2xl font-bold">
                {errors.filter((e) => e.status === 'ignored').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend */}
        <Card className="bg-card border-border mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Son 14 Gün Hata Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
                <XAxis dataKey="day" stroke="#858585" fontSize={10} />
                <YAxis stroke="#858585" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#252526',
                    border: '1px solid #3c3c3c',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="url(#errGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Hata listesi */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Hatalar ({filtered.length})</CardTitle>
                <div className="flex gap-2">
                  <Select value={sevFilter} onValueChange={setSevFilter}>
                    <SelectTrigger className="w-28 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Seviye</SelectItem>
                      <SelectItem value="critical">Kritik</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="low">Düşük</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durum</SelectItem>
                      <SelectItem value="unresolved">Çözülmemiş</SelectItem>
                      <SelectItem value="resolved">Çözüldü</SelectItem>
                      <SelectItem value="ignored">Yoksayılan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 max-h-[500px] overflow-auto">
              {filtered.map((e) => {
                const meta = SEV_META[e.severity];
                const Icon = meta.icon;
                const isActive = e.id === selectedId;
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelectedId(e.id)}
                    className={`w-full text-left p-2.5 rounded border transition-colors ${
                      isActive
                        ? 'border-blue-500/40 bg-blue-500/10'
                        : 'border-border/60 hover:bg-muted/30'
                    } ${e.status === 'resolved' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon size={14} style={{ color: meta.color }} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{e.message}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[9px]"
                            style={{ color: meta.color, borderColor: meta.color }}
                          >
                            {meta.label}
                          </Badge>
                          <Badge variant="secondary" className="text-[9px]">{e.count}x</Badge>
                          <span className="text-[9px] text-muted-foreground font-mono">{e.file}</span>
                          {e.status === 'resolved' && (
                            <Badge variant="secondary" className="text-[9px] bg-green-500/20 text-green-300">Çözüldü</Badge>
                          )}
                          {e.status === 'ignored' && (
                            <Badge variant="secondary" className="text-[9px] bg-muted text-muted-foreground">Yoksay</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Detay */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Hata Detayı</CardTitle>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Detay için hata seçin
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    {(() => {
                      const meta = SEV_META[selected.severity];
                      const Icon = meta.icon;
                      return <Icon size={18} style={{ color: meta.color }} className="mt-0.5 flex-shrink-0" />;
                    })()}
                    <div>
                      <div className="text-sm font-medium">{selected.message}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{selected.file}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded border border-border/60">
                      <Clock size={12} className="text-muted-foreground" />
                      <div>
                        <div className="text-[9px] text-muted-foreground">Son Görülme</div>
                        <div>{new Date(selected.lastSeen).toLocaleString('tr-TR')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded border border-border/60">
                      <Server size={12} className="text-muted-foreground" />
                      <div>
                        <div className="text-[9px] text-muted-foreground">Ortam</div>
                        <div>{selected.environment}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded border border-border/60">
                      <Bug size={12} className="text-muted-foreground" />
                      <div>
                        <div className="text-[9px] text-muted-foreground">Toplam Olay</div>
                        <div>{selected.count}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded border border-border/60">
                      <User size={12} className="text-muted-foreground" />
                      <div>
                        <div className="text-[9px] text-muted-foreground">Son Kullanıcı</div>
                        <div className="font-mono text-[10px]">{selected.user}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1 uppercase">Stack Trace</div>
                    <pre className="bg-[#1e1e1e] border border-border p-2 rounded text-[10px] font-mono overflow-auto max-h-48">
                      {selected.stack}
                    </pre>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selected.id, 'resolved')}
                      disabled={selected.status === 'resolved'}
                      className="text-xs h-8"
                    >
                      <CheckCircle2 size={12} className="mr-1" /> Çözüldü
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selected.id, 'ignored')}
                      disabled={selected.status === 'ignored'}
                      className="text-xs h-8"
                    >
                      <EyeOff size={12} className="mr-1" /> Yoksay
                    </Button>
                    {selected.status !== 'unresolved' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(selected.id, 'unresolved')}
                        className="text-xs h-8"
                      >
                        Tekrar Aç
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
