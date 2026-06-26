'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Cloud,
  Brain,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
} from 'lucide-react';

type ServiceStatus = 'operational' | 'degraded' | 'down';

interface Service {
  id: string;
  name: string;
  icon: typeof Server;
  status: ServiceStatus;
  uptime: number; // %
  responseTime: number; // ms
  description: string;
  history: ServiceStatus[]; // 90 gün
}

interface Incident {
  id: string;
  title: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'resolved' | 'monitoring' | 'investigating';
  startedAt: string;
  duration: string;
  description: string;
}

// 90 gün uptime history (çoğunlukla operational, arada degraded/down)
function genHistory(operationalRatio: number): ServiceStatus[] {
  const days: ServiceStatus[] = [];
  for (let i = 0; i < 90; i++) {
    const r = Math.random();
    if (r > operationalRatio) {
      days.push(r > operationalRatio + 0.03 ? 'down' : 'degraded');
    } else {
      days.push('operational');
    }
  }
  return days;
}

const SERVICES: Service[] = [
  {
    id: 'api',
    name: 'API Gateway',
    icon: Server,
    status: 'operational',
    uptime: 99.98,
    responseTime: 142,
    description: 'REST & WebSocket API',
    history: genHistory(0.995),
  },
  {
    id: 'db',
    name: 'PostgreSQL',
    icon: Database,
    status: 'operational',
    uptime: 99.99,
    responseTime: 18,
    description: 'Primary + read replica',
    history: genHistory(0.998),
  },
  {
    id: 'cache',
    name: 'Redis Cache',
    icon: HardDrive,
    status: 'operational',
    uptime: 99.95,
    responseTime: 2,
    description: 'Session & rate limit cache',
    history: genHistory(0.99),
  },
  {
    id: 'cdn',
    name: 'CDN (Cloudflare)',
    icon: Cloud,
    status: 'degraded',
    uptime: 99.5,
    responseTime: 87,
    description: 'Static asset dağıtımı',
    history: genHistory(0.96),
  },
  {
    id: 'ai',
    name: 'DeepSeek AI',
    icon: Brain,
    status: 'operational',
    uptime: 99.9,
    responseTime: 1240,
    description: 'Chat / Reasoner / V4',
    history: genHistory(0.985),
  },
];

const INCIDENTS: Incident[] = [
  {
    id: 'inc1',
    title: 'CDN latency artışı (EU region)',
    severity: 'minor',
    status: 'monitoring',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    duration: '3 saat',
    description: 'Cloudflare Frankfurt PoP\'ta latency 50ms\'den 180ms\'e yükseldi. Mitigasyon uygulandı, monitoring sürüyor.',
  },
  {
    id: 'inc2',
    title: 'AI service kısa kesinti',
    severity: 'major',
    status: 'resolved',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    duration: '12 dakika',
    description: 'DeepSeek API rate limit aşımı nedeniyle 12 dakika boyunca 5xx hataları döndü. Retry mekanizması devreye girdi, sorun çözüldü.',
  },
  {
    id: 'inc3',
    title: 'Database connection pool doluluğu',
    severity: 'major',
    status: 'resolved',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    duration: '28 dakika',
    description: 'Yüksek trafik nedeniyle connection pool doldu. Pool size 50\'den 100\'e çıkarıldı, replica\'ya yük dağıtıldı.',
  },
  {
    id: 'inc4',
    title: 'Planlı bakım — cache upgrade',
    severity: 'minor',
    status: 'resolved',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    duration: '15 dakika',
    description: 'Redis 7.2\'ye yükseltme. Önceden duyurulmuş planlı bakım.',
  },
];

const STATUS_META: Record<ServiceStatus, { color: string; label: string; bg: string; icon: typeof CheckCircle2 }> = {
  operational: { color: '#10b981', label: 'Operasyonel', bg: '#10b981', icon: CheckCircle2 },
  degraded: { color: '#f59e0b', label: 'Bozulmuş', bg: '#f59e0b', icon: AlertTriangle },
  down: { color: '#ef4444', label: 'Çevrimdışı', bg: '#ef4444', icon: XCircle },
};

const SEV_META: Record<Incident['severity'], { color: string; label: string }> = {
  minor: { color: '#3b82f6', label: 'Minor' },
  major: { color: '#f59e0b', label: 'Major' },
  critical: { color: '#ef4444', label: 'Kritik' },
};

// 24 saatlik response time trend
const RESPONSE_TREND = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  api: 100 + Math.floor(Math.random() * 80),
  db: 15 + Math.floor(Math.random() * 10),
  ai: 1000 + Math.floor(Math.random() * 600),
}));

export function StatusPageView() {
  const [services] = useState<Service[]>(SERVICES);
  const [incidents] = useState<Incident[]>(INCIDENTS);
  void useStore((s) => s.activeView);

  const overall = useMemo<ServiceStatus>(() => {
    if (services.some((s) => s.status === 'down')) return 'down';
    if (services.some((s) => s.status === 'degraded')) return 'degraded';
    return 'operational';
  }, [services]);

  const overallMeta = STATUS_META[overall];
  const OverallIcon = overallMeta.icon;

  const avgUptime = (services.reduce((s, x) => s + x.uptime, 0) / services.length).toFixed(2);
  const avgResponse = Math.round(services.reduce((s, x) => s + x.responseTime, 0) / services.length);

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-blue-400" /> Status Page
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistem sağlık durumu — gerçek zamanlı service ve incident takibi
          </p>
        </div>

        {/* Overall status */}
        <Card
          className="bg-card border-2 mb-6"
          style={{ borderColor: `${overallMeta.color}40`, background: `${overallMeta.color}08` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: `${overallMeta.color}20`, border: `2px solid ${overallMeta.color}` }}
              >
                <OverallIcon size={28} style={{ color: overallMeta.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl font-bold" style={{ color: overallMeta.color }}>
                  {overall === 'operational'
                    ? 'Tüm Sistemler Operasyonel'
                    : overall === 'degraded'
                    ? 'Bazı Sistemlerde Bozulma Var'
                    : 'Kritik Kesinti Mevcut'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Son güncelleme: {new Date().toLocaleString('tr-TR')} · 5 servis izleniyor
                </p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{avgUptime}%</div>
                  <div className="text-[10px] text-muted-foreground">Ort. Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{avgResponse}ms</div>
                  <div className="text-[10px] text-muted-foreground">Ort. Yanıt</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service listesi */}
        <div className="space-y-2 mb-6">
          {services.map((s) => {
            const Icon = s.icon;
            const meta = STATUS_META[s.status];
            const StatusIcon = meta.icon;
            return (
              <Card key={s.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div
                      className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.color}15` }}
                    >
                      <Icon size={16} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{s.name}</span>
                        <StatusIcon size={14} style={{ color: meta.color }} />
                        <Badge
                          variant="outline"
                          className="text-[9px]"
                          style={{ color: meta.color, borderColor: meta.color }}
                        >
                          {meta.label}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{s.description}</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-mono text-green-400">{s.uptime}%</div>
                        <div className="text-[9px] text-muted-foreground">uptime (90g)</div>
                      </div>
                      <div className="text-center">
                        <div className="font-mono">{s.responseTime}ms</div>
                        <div className="text-[9px] text-muted-foreground">yanıt</div>
                      </div>
                    </div>
                    {/* 90 günlük bar */}
                    <div className="w-full lg:w-64 flex gap-[2px]">
                      {s.history.map((day, i) => {
                        const dm = STATUS_META[day];
                        return (
                          <div
                            key={i}
                            title={`${90 - i} gün önce: ${dm.label}`}
                            className="flex-1 h-8 rounded-sm"
                            style={{ background: dm.bg, opacity: i === 89 ? 1 : 0.85 }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Response time trend */}
        <Card className="bg-card border-border mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap size={14} className="text-amber-400" /> Yanıt Süresi Trendi (24 saat)
            </CardTitle>
            <CardDescription>API, DB ve AI servisleri</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={RESPONSE_TREND}>
                <defs>
                  <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4fc3f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4fc3f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ba68c8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ba68c8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
                <XAxis dataKey="hour" stroke="#858585" fontSize={10} interval={3} />
                <YAxis stroke="#858585" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#252526',
                    border: '1px solid #3c3c3c',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  formatter={(v: number) => `${v}ms`}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="api" stroke="#4fc3f7" fill="url(#apiGrad)" strokeWidth={2} name="API" />
                <Area type="monotone" dataKey="db" stroke="#81c784" fill="transparent" strokeWidth={2} name="DB" />
                <Area type="monotone" dataKey="ai" stroke="#ba68c8" fill="url(#aiGrad)" strokeWidth={2} name="AI" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident history */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock size={14} className="text-amber-400" /> Incident Geçmişi
            </CardTitle>
            <CardDescription>Son 30 gün</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {incidents.map((inc) => {
              const sm = SEV_META[inc.severity];
              return (
                <div key={inc.id} className="border border-border/60 rounded p-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[9px]"
                      style={{ color: sm.color, borderColor: sm.color }}
                    >
                      {sm.label}
                    </Badge>
                    <span className="text-sm font-medium">{inc.title}</span>
                    {inc.status === 'resolved' ? (
                      <Badge variant="secondary" className="text-[9px] bg-green-500/20 text-green-300">Çözüldü</Badge>
                    ) : inc.status === 'monitoring' ? (
                      <Badge variant="secondary" className="text-[9px] bg-amber-500/20 text-amber-300">İzleniyor</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] bg-red-500/20 text-red-300">İnceleniyor</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{inc.description}</p>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(inc.startedAt).toLocaleString('tr-TR')} · Süre: {inc.duration}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
