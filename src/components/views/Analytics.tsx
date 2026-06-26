'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { TrendingUp, Cpu, DollarSign, Zap, Activity } from 'lucide-react';
import { DEEPSEEK_MODELS } from '@/lib/deepseek';

const COLORS = ['#4fc3f7', '#81c784', '#ffb74d', '#e57373', '#ba68c8'];

interface Stats {
  counts: { projects: number; files: number; messages: number; versions: number; policies: number; standards: number };
  modelUsage: Record<string, { count: number; tokensIn: number; tokensOut: number; avgLatency: number }>;
  recentActivity: Array<{ modelUsed: string | null; tokensIn: number | null; tokensOut: number | null; latencyMs: number | null; createdAt: string }>;
  totals: { tokensIn: number; tokensOut: number; sampleSize: number };
}

export function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats(d));
  }, []);

  const modelData = stats
    ? Object.entries(stats.modelUsage).map(([id, u]) => ({
        name: DEEPSEEK_MODELS.find((m) => m.id === id)?.name.split(' ')[0] || id,
        çağrı: u.count,
        token: u.tokensIn + u.tokensOut,
        latency: Math.round(u.avgLatency),
      }))
    : [];

  const tokenData = stats
    ? Object.entries(stats.modelUsage).map(([id, u], i) => ({
        name: DEEPSEEK_MODELS.find((m) => m.id === id)?.name.split(' ')[0] || id,
        value: u.tokensIn + u.tokensOut,
        color: COLORS[i % COLORS.length],
      }))
    : [];

  const timelineData = stats?.recentActivity
    .slice()
    .reverse()
    .map((a, i) => ({
      name: `${i + 1}`,
      tokens: (a.tokensIn || 0) + (a.tokensOut || 0),
      latency: a.latencyMs || 0,
    })) || [];

  const totalCost = stats
    ? Object.entries(stats.modelUsage).reduce((sum, [id, u]) => {
        const m = DEEPSEEK_MODELS.find((x) => x.id === id);
        if (!m) return sum;
        return (
          sum +
          (u.tokensIn * m.inputPricePer1M + u.tokensOut * m.outputPricePer1M) / 1_000_000
        );
      }, 0)
    : 0;

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity /> Analitik & Metrikler
          </h1>
          <p className="text-sm text-muted-foreground">
            AI kullanım, token, maliyet ve performans metrikleri
          </p>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap size={16} className="text-blue-400" />
                <Badge variant="secondary" className="text-[10px]">Toplam</Badge>
              </div>
              <div className="text-2xl font-bold">{stats?.totals.sampleSize ?? 0}</div>
              <p className="text-xs text-muted-foreground">AI Çağrı</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Cpu size={16} className="text-green-400" />
              </div>
              <div className="text-2xl font-bold">
                {((stats?.totals.tokensIn ?? 0) + (stats?.totals.tokensOut ?? 0)).toLocaleString('tr-TR')}
              </div>
              <p className="text-xs text-muted-foreground">Toplam Token</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-bold">${totalCost.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">Tahmini Maliyet</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={16} className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold">
                {stats
                  ? Math.round(
                      Object.values(stats.modelUsage).reduce(
                        (s, u) => s + u.avgLatency,
                        0
                      ) / Math.max(1, Object.keys(stats.modelUsage).length)
                    )
                  : 0}
                ms
              </div>
              <p className="text-xs text-muted-foreground">Ort. Latency</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Model Usage Bar Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Model Bazlı Çağrı Sayısı</CardTitle>
              <CardDescription>Hangi model ne kadar kullanıldı</CardDescription>
            </CardHeader>
            <CardContent>
              {modelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={modelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
                    <XAxis dataKey="name" stroke="#858585" fontSize={11} />
                    <YAxis stroke="#858585" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#252526',
                        border: '1px solid #3c3c3c',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="çağrı" fill="#4fc3f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  Henüz veri yok
                </div>
              )}
            </CardContent>
          </Card>

          {/* Token Distribution Pie */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Token Dağılımı</CardTitle>
              <CardDescription>Modele göre token kullanımı</CardDescription>
            </CardHeader>
            <CardContent>
              {tokenData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={tokenData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      style={{ fontSize: '11px' }}
                    >
                      {tokenData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#252526',
                        border: '1px solid #3c3c3c',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  Henüz veri yok
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Son Aktivite Zaman Çizelgesi</CardTitle>
            <CardDescription>Token & Latency trendleri</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
                  <XAxis dataKey="name" stroke="#858585" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#4fc3f7" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ffb74d" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#252526',
                      border: '1px solid #3c3c3c',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="tokens"
                    stroke="#4fc3f7"
                    name="Token"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="latency"
                    stroke="#ffb74d"
                    name="Latency (ms)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Henüz aktivite yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Performance Table */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Model Performans Detayı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="py-2 pr-4">Model</th>
                    <th className="py-2 pr-4">Çağrı</th>
                    <th className="py-2 pr-4">Tokens (In)</th>
                    <th className="py-2 pr-4">Tokens (Out)</th>
                    <th className="py-2 pr-4">Ort. Latency</th>
                    <th className="py-2 pr-4">Tahmini Maliyet</th>
                  </tr>
                </thead>
                <tbody>
                  {stats && Object.entries(stats.modelUsage).map(([id, u]) => {
                    const m = DEEPSEEK_MODELS.find((x) => x.id === id);
                    const cost =
                      ((u.tokensIn * (m?.inputPricePer1M ?? 0) +
                        u.tokensOut * (m?.outputPricePer1M ?? 0)) /
                        1_000_000);
                    return (
                      <tr key={id} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-medium">{m?.name ?? id}</td>
                        <td className="py-2 pr-4 font-mono">{u.count}</td>
                        <td className="py-2 pr-4 font-mono">{u.tokensIn.toLocaleString('tr-TR')}</td>
                        <td className="py-2 pr-4 font-mono">{u.tokensOut.toLocaleString('tr-TR')}</td>
                        <td className="py-2 pr-4 font-mono">{Math.round(u.avgLatency)}ms</td>
                        <td className="py-2 pr-4 font-mono">${cost.toFixed(4)}</td>
                      </tr>
                    );
                  })}
                  {(!stats || Object.keys(stats.modelUsage).length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-muted-foreground">
                        Henüz veri yok
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
