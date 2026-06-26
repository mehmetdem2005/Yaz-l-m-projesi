'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Filter,
  Globe2,
  Activity,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

// ---- Sahte veriler ----
const dauMauData = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const base = 320 + Math.sin(i / 3) * 40;
  return {
    name: `${day}`,
    DAU: Math.round(base + Math.random() * 80),
    MAU: Math.round(base * 6 + Math.random() * 400 + 1800),
  };
});

const featureUsage = [
  { view: 'Dashboard', kullanım: 4820 },
  { view: 'Projects', kullanım: 3960 },
  { view: 'Editor', kullanım: 3540 },
  { view: 'Agent', kullanım: 2480 },
  { view: 'Policies', kullanım: 1920 },
  { view: 'Security', kullanım: 1640 },
  { view: 'Analytics', kullanım: 1280 },
  { view: 'Templates', kullanım: 980 },
  { view: 'Connectors', kullanım: 720 },
];

const funnelSteps = [
  { adım: 'Dashboard', kullanıcı: 12000, oran: 100 },
  { adım: 'Project', kullanıcı: 8400, oran: 70 },
  { adım: 'Editor', kullanıcı: 5600, oran: 47 },
  { adım: 'Deploy', kullanıcı: 2100, oran: 18 },
];

const countries = [
  { name: 'Türkiye', value: 3240, color: '#e30a17' },
  { name: 'ABD', value: 2880, color: '#3b82f6' },
  { name: 'Almanya', value: 1620, color: '#facc15' },
  { name: 'Birleşik Krallık', value: 980, color: '#8b5cf6' },
  { name: 'Hollanda', value: 720, color: '#f97316' },
  { name: 'Diğer', value: 1560, color: '#64748b' },
];

// Cohort retention (hafta 0..6) — sahte %
const cohorts = [
  { name: 'Mayıs W1', sizes: [100], w0: 100, w1: 64, w2: 48, w3: 39, w4: 32, w5: 28, w6: 24 },
  { name: 'Mayıs W2', sizes: [100], w0: 100, w1: 71, w2: 55, w3: 44, w4: 36, w5: 30, w6: 0 },
  { name: 'Mayıs W3', sizes: [100], w0: 100, w1: 68, w2: 52, w3: 41, w4: 33, w5: 0, w6: 0 },
  { name: 'Mayıs W4', sizes: [100], w0: 100, w1: 75, w2: 58, w3: 46, w4: 0, w5: 0, w6: 0 },
  { name: 'Haziran W1', sizes: [100], w0: 100, w1: 80, w2: 62, w3: 0, w4: 0, w5: 0, w6: 0 },
  { name: 'Haziran W2', sizes: [100], w0: 100, w1: 78, w2: 0, w3: 0, w4: 0, w5: 0, w6: 0 },
  { name: 'Haziran W3', sizes: [100], w0: 100, w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, w6: 0 },
];

const weeks = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6'] as const;

function heatColor(v: number): string {
  if (v === 0) return 'transparent';
  if (v >= 70) return '#10b981';
  if (v >= 50) return '#22c55e';
  if (v >= 30) return '#eab308';
  if (v >= 15) return '#f97316';
  return '#ef4444';
}

const tooltipStyle = {
  backgroundColor: '#252526',
  border: '1px solid #3c3c3c',
  borderRadius: '4px',
  fontSize: '12px',
};

export function AnalyticsView2() {
  const [range, setRange] = useState<'7g' | '30g' | '90g'>('30g');

  const maxFunnel = Math.max(...funnelSteps.map((f) => f.kullanıcı));

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-cyan-400" /> Kullanıcı Analitik
            </h1>
            <p className="text-sm text-muted-foreground">
              DAU/MAU, feature usage, cohort retention, funnel & coğrafi dağılım
            </p>
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            {(['7g', '30g', '90g'] as const).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={range === r ? 'default' : 'ghost'}
                className="h-7 text-xs"
                onClick={() => setRange(r)}
              >
                {r === '7g' ? '7 Gün' : r === '30g' ? '30 Gün' : '90 Gün'}
              </Button>
            ))}
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'DAU', value: '1.284', trend: '+12%', icon: Users, color: '#06b6d4' },
            { label: 'MAU', value: '8.940', trend: '+8%', icon: TrendingUp, color: '#10b981' },
            { label: 'Stickiness', value: '14,3%', trend: '+1,2%', icon: Activity, color: '#a855f7' },
            { label: 'Churn', value: '3,1%', trend: '-0,4%', icon: ArrowDown, color: '#f97316' },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.label} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={16} style={{ color: k.color }} />
                    <Badge variant="secondary" className="text-[10px]">{k.trend}</Badge>
                  </div>
                  <div className="text-2xl font-bold">{k.value}</div>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* DAU/MAU line chart */}
        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle className="text-sm">DAU & MAU Trendleri</CardTitle>
            <CardDescription>Son 30 gün aktif kullanıcılar</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dauMauData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
                <XAxis dataKey="name" stroke="#858585" fontSize={11} />
                <YAxis yAxisId="left" stroke="#4fc3f7" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#81c784" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="DAU"
                  stroke="#4fc3f7"
                  name="Günlük Aktif"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="MAU"
                  stroke="#81c784"
                  name="Aylık Aktif"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature usage + Top countries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter size={14} /> Feature Usage
              </CardTitle>
              <CardDescription>Hangi view ne kadar kullanılıyor</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={featureUsage} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" horizontal={false} />
                  <XAxis type="number" stroke="#858585" fontSize={11} />
                  <YAxis type="category" dataKey="view" stroke="#858585" fontSize={11} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="kullanım" fill="#a855f7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe2 size={14} /> Coğrafi Dağılım
              </CardTitle>
              <CardDescription>Kullanıcıların ülke bazında dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={countries}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    style={{ fontSize: '11px' }}
                  >
                    {countries.map((c, i) => (
                      <Cell key={i} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cohort retention heatmap */}
        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Cohort Retention (Haftalık)</CardTitle>
            <CardDescription>
              Kullanıcıların kayıt olduktan sonraki haftalarda elde tutulma oranları
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left py-1 pr-3 font-medium">Cohort</th>
                  {weeks.map((w, i) => (
                    <th key={w} className="px-1 font-medium text-center">W{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.name}>
                    <td className="py-1 pr-3 font-medium whitespace-nowrap">{c.name}</td>
                    {weeks.map((w) => {
                      const v = c[w] as number;
                      return (
                        <td key={w} className="px-1 py-1">
                          <div
                            className="w-14 h-9 rounded flex items-center justify-center text-[10px] font-mono"
                            style={{
                              background: v === 0 ? 'rgba(255,255,255,0.03)' : `${heatColor(v)}33`,
                              color: v === 0 ? '#444' : heatColor(v),
                              border: `1px solid ${v === 0 ? 'transparent' : heatColor(v)}55`,
                            }}
                          >
                            {v === 0 ? '-' : `${v}%`}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
              <span>Düşük</span>
              <div className="flex gap-0.5">
                {[10, 25, 40, 60, 80, 100].map((v) => (
                  <div
                    key={v}
                    className="w-6 h-3 rounded-sm"
                    style={{ background: `${heatColor(v)}55`, border: `1px solid ${heatColor(v)}` }}
                  />
                ))}
              </div>
              <span>Yüksek</span>
            </div>
          </CardContent>
        </Card>

        {/* Funnel analysis */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Funnel Analizi</CardTitle>
            <CardDescription>
              Dashboard → Project → Editor → Deploy dönüşüm hunisi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelSteps.map((s, i) => {
              const widthPct = (s.kullanıcı / maxFunnel) * 100;
              const dropOff = i > 0
                ? ((funnelSteps[i - 1].kullanıcı - s.kullanıcı) / funnelSteps[i - 1].kullanıcı) * 100
                : 0;
              return (
                <div key={s.adım}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-medium">{s.adım}</span>
                    <span className="text-muted-foreground">
                      {s.kullanıcı.toLocaleString('tr-TR')} kullanıcı · %{s.oran}
                      {i > 0 && (
                        <Badge variant="outline" className="ml-2 text-[9px] text-red-400 border-red-500/30">
                          -{dropOff.toFixed(0)}% drop-off
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="h-7 bg-muted/30 rounded relative overflow-hidden">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${widthPct}%`,
                        background: `linear-gradient(90deg, #4fc3f7, #a855f7)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Toplam dönüşüm oranı</span>
              <Badge variant="secondary" className="text-sm">
                %{((funnelSteps[funnelSteps.length - 1].kullanıcı / funnelSteps[0].kullanıcı) * 100).toFixed(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
