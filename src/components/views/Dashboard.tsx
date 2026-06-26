'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FolderGit2,
  FileText,
  MessageSquare,
  ScrollText,
  Bot,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Activity,
  Cpu,
  DollarSign,
  Code2,
  BookMarked,
  Download,
} from 'lucide-react';
import { DEEPSEEK_MODELS } from '@/lib/deepseek';

interface Stats {
  counts: {
    projects: number;
    files: number;
    messages: number;
    versions: number;
    policies: number;
    standards: number;
  };
  modelUsage: Record<
    string,
    { count: number; tokensIn: number; tokensOut: number; avgLatency: number }
  >;
  recentActivity: Array<{
    modelUsed: string | null;
    tokensIn: number | null;
    tokensOut: number | null;
    latencyMs: number | null;
    createdAt: string;
  }>;
  totals: { tokensIn: number; tokensOut: number; sampleSize: number };
}

export function Dashboard() {
  const setView = useStore((s) => s.setView);
  const apiKeysSet = useStore((s) => s.apiKeysSet);
  const model = useStore((s) => s.deepseekModel);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Aktif Projeler', value: stats?.counts.projects ?? 0, icon: FolderGit2, color: 'blue' },
    { label: 'Toplam Dosya', value: stats?.counts.files ?? 0, icon: FileText, color: 'green' },
    { label: 'AI Mesajları', value: stats?.counts.messages ?? 0, icon: MessageSquare, color: 'purple' },
    { label: 'Politikalar', value: stats?.counts.policies ?? 20, icon: ScrollText, color: 'amber' },
    { label: 'Kurumsal Standartlar', value: stats?.counts.standards ?? 18, icon: ScrollText, color: 'pink' },
    { label: 'Versiyonlar', value: stats?.counts.versions ?? 0, icon: Bot, color: 'cyan' },
  ];

  return (
    <div className="flex-1 overflow-auto jarvis-grid-bg" style={{ background: 'rgba(5,10,20,0.95)' }}>
      <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Hero — Jarvis Style */}
        <div
          className="rounded-lg p-6 md:p-8 relative overflow-hidden jarvis-border"
          style={{
            background: 'linear-gradient(135deg, rgba(0,30,60,0.9) 0%, rgba(5,15,30,0.95) 50%, rgba(10,5,25,0.9) 100%)',
            boxShadow: '0 0 30px rgba(0,200,255,0.15), inset 0 0 20px rgba(0,100,200,0.05)',
          }}
        >
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 jarvis-pulse" />
              <span className="text-cyan-400 text-[10px] font-mono uppercase tracking-widest jarvis-glow-sm">System Online</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-cyan-100 jarvis-glow-sm">
              DeepSeek App Studio
            </h1>
            <p className="text-cyan-300/60 mb-6 text-sm">
              Kurumsal standartlarda AI kod üretimi. TOGAF, ISO 27001, SOC 2, GDPR uyumlu.
              Çoklu DeepSeek modeli ile Google/Amazon ölçeğinde mimari.
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <button
                onClick={() => setView('projects')}
                className="px-4 py-2 rounded text-sm font-medium transition-all jarvis-btn-active"
              >
                <Plus className="mr-2 inline" size={14} />
                Yeni Proje
              </button>
              <button
                onClick={() => setView('templates')}
                className="px-4 py-2 rounded text-sm font-medium jarvis-btn"
              >
                Şablonlardan Başla
              </button>
              <button
                onClick={() => setView('docs')}
                className="px-4 py-2 rounded text-sm font-medium jarvis-btn"
              >
                Dokümantasyon
              </button>
            </div>
          </div>
          {/* Decorative arc */}
          <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-2 border-cyan-400 jarvis-arc" style={{ borderTopColor: 'transparent' }} />
            </div>
          </div>
          
        </div>

        {/* API Key Warning */}
        {!apiKeysSet && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="text-yellow-500" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium">DeepSeek API Key gerekli</p>
                <p className="text-xs text-muted-foreground">
                  AI özelliklerini kullanabilmek için API keyinizi ayarlardan girin.
                </p>
              </div>
              <Button size="sm" onClick={() => setView('settings')}>
                Ayarlar
                <ArrowRight className="ml-1" size={14} />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.label} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={16} className="text-muted-foreground" />
                    <TrendingUp size={12} className="text-green-400" />
                  </div>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : c.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Model Usage */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu size={18} />
                Model Kullanımı
              </CardTitle>
              <CardDescription>Son {stats?.totals.sampleSize ?? 0} mesaj baz alınmıştır</CardDescription>
            </CardHeader>
            <CardContent>
              {!loading && stats && Object.keys(stats.modelUsage).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.modelUsage).map(([modelId, usage]) => {
                    const info = DEEPSEEK_MODELS.find((m) => m.id === modelId);
                    return (
                      <div key={modelId} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Bot size={14} />
                            {info?.name ?? modelId}
                          </span>
                          <span className="text-muted-foreground font-mono text-xs">
                            {usage.count} çağrı · {(usage.tokensIn + usage.tokensOut).toLocaleString('tr-TR')} tok
                          </span>
                        </div>
                        <Progress value={Math.min(100, (usage.count / 50) * 100)} className="h-1.5" />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Ortalama latency: {Math.round(usage.avgLatency)}ms</span>
                          <span>
                            Tahmini maliyet: $
                            {(
                              (usage.tokensIn * (info?.inputPricePer1M ?? 0) +
                                usage.tokensOut * (info?.outputPricePer1M ?? 0)) /
                              1_000_000
                            ).toFixed(4)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Activity className="mx-auto mb-2 opacity-50" size={32} />
                  Henüz AI aktivitesi yok. İlk sohbetinizi başlatın.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap size={18} />
                Hızlı Aksiyonlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setView('editor')}
              >
                <Code2 className="mr-2" size={16} /> Editörü Aç
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setView('agent')}
              >
                <Bot className="mr-2" size={16} /> Agent Çalıştır
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setView('policies')}
              >
                <ScrollText className="mr-2" size={16} /> Politikaları İncele
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setView('standards')}
              >
                <BookMarked className="mr-2" size={16} /> Standartları Keşfet
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setView('export')}
              >
                <Download className="mr-2" size={16} /> Projeyi Export Et
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Model Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu size={18} />
              Aktif Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const m = DEEPSEEK_MODELS.find((x) => x.id === model);
              if (!m) return null;
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Model</p>
                    <p className="font-semibold flex items-center gap-2">
                      {m.name}
                      {m.maturity === 'beta' && (
                        <Badge variant="secondary" className="text-[10px]">Beta</Badge>
                      )}
                      {m.maturity === 'preview' && (
                        <Badge variant="outline" className="text-[10px]">Preview</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bağlam Penceresi</p>
                    <p className="font-semibold">{m.contextWindow.toLocaleString('tr-TR')} token</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fiyatlandırma</p>
                    <p className="font-semibold flex items-center gap-1">
                      <DollarSign size={12} />
                      {m.inputPricePer1M} / {m.outputPricePer1M} per 1M
                    </p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-muted-foreground mb-2">Kullanım Senaryoları</p>
                    <div className="flex flex-wrap gap-2">
                      {m.bestFor.map((b) => (
                        <Badge key={b} variant="secondary" className="text-xs">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-muted-foreground mb-1">Açıklama</p>
                    <p className="text-sm">{m.description}</p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} />
              Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {stats.recentActivity.slice(0, 8).map((a, i) => {
                  const info = DEEPSEEK_MODELS.find((m) => m.id === a.modelUsed);
                  return (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-green-400" />
                        <span className="font-medium">{info?.name ?? a.modelUsed}</span>
                        <span className="text-muted-foreground text-xs">
                          {(a.tokensIn ?? 0) + (a.tokensOut ?? 0)} token
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                Henüz aktivite yok.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
