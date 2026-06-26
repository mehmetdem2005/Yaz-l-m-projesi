'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
  Legend,
} from 'recharts';
import {
  Package,
  RefreshCw,
  FileCode,
  TrendingDown,
  Split,
  Zap,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#4fc3f7', '#81c784', '#ffb74d', '#e57373', '#ba68c8', '#4dd0e1', '#fff176'];

// Uzantı -> renk & label
const EXT_META: Record<string, { label: string; weight: number }> = {
  ts: { label: 'TypeScript', weight: 1.0 },
  tsx: { label: 'TSX', weight: 1.2 },
  js: { label: 'JavaScript', weight: 0.9 },
  jsx: { label: 'JSX', weight: 1.1 },
  css: { label: 'CSS', weight: 0.6 },
  json: { label: 'JSON', weight: 0.4 },
  md: { label: 'Markdown', weight: 0.2 },
  html: { label: 'HTML', weight: 0.7 },
  svg: { label: 'SVG', weight: 0.5 },
};

function extOf(path: string): string {
  const m = path.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : 'other';
}

function analyzeFiles(files: Array<{ path: string; content: string }>) {
  const byExt: Record<string, { count: number; size: number }> = {};
  const fileSizes: Array<{ name: string; size: number; ext: string }> = [];

  files.forEach((f) => {
    const ext = extOf(f.path);
    const size = new Blob([f.content]).size;
    if (!byExt[ext]) byExt[ext] = { count: 0, size: 0 };
    byExt[ext].count += 1;
    byExt[ext].size += size;
    const name = f.path.split('/').pop() || f.path;
    fileSizes.push({ name, size, ext });
  });

  return { byExt, fileSizes };
}

function genRecommendations(byExt: Record<string, { count: number; size: number }>, totalSize: number) {
  const recs: Array<{ type: string; title: string; detail: string; icon: typeof Split }> = [];
  const totalKB = totalSize / 1024;

  if (totalKB > 500) {
    recs.push({
      type: 'code-split',
      title: 'Code Splitting Öner',
      detail: `Toplam bundle ${Math.round(totalKB)}KB. React.lazy + Suspense ile route bazlı splitting uygulayın. Tahmini kazanç: %30-40.`,
      icon: Split,
    });
  }

  if (byExt.js && byExt.ts) {
    recs.push({
      type: 'tree-shake',
      title: 'Tree Shaking Kontrolü',
      detail: "JavaScript ve TypeScript karışık. Named import kullanın, side-effect'li modülleri package.json \"sideEffects\": false ile işaretleyin.",
      icon: Layers,
    });
  }

  recs.push({
    type: 'lazy-load',
    title: 'Lazy Load Ağır Bileşenler',
    detail: 'Büyük图表 (recharts, d3) ve editör (monaco) kütüphanelerini dinamik import ile yükleyin. İlk paint ~%50 hızlanır.',
    icon: Zap,
  });

  if (byExt.svg && byExt.svg.count > 5) {
    recs.push({
      type: 'svg-sprite',
      title: 'SVG Sprite Kullan',
      detail: `${byExt.svg.count} SVG dosyası tespit edildi. Sprite sheet veya inline import ile HTTP istek sayısını azaltın.`,
      icon: TrendingDown,
    });
  }

  if (byExt.json && byExt.json.size > 100 * 1024) {
    recs.push({
      type: 'json-minify',
      title: 'JSON Veriyi Sıkıştır',
      detail: 'Büyük JSON dosyaları runtime\'da fetch edilebilir; static import yerine API/CDN üzerinden yükleyin.',
      icon: TrendingDown,
    });
  }

  return recs;
}

export function BundleAnalyzerView() {
  const files = useStore((s) => s.files);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
      toast.success(`${files.length} dosya analiz edildi`);
    }, 500);
  };

  const { byExt, fileSizes } = useMemo(() => analyzeFiles(files), [files]);
  const totalSize = useMemo(() => Object.values(byExt).reduce((s, e) => s + e.size, 0), [byExt]);
  const totalCount = useMemo(() => Object.values(byExt).reduce((s, e) => s + e.count, 0), [byExt]);

  const pieData = Object.entries(byExt).map(([ext, info]) => ({
    name: EXT_META[ext]?.label || ext,
    value: info.size,
    count: info.count,
  }));

  const topFiles = [...fileSizes].sort((a, b) => b.size - a.size).slice(0, 10).map((f) => ({
    name: f.name.length > 20 ? f.name.slice(0, 17) + '...' : f.name,
    size: Math.round(f.size / 1024 * 100) / 100,
    ext: f.ext,
  }));

  const recommendations = useMemo(() => genRecommendations(byExt, totalSize), [byExt, totalSize]);

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="text-blue-400" /> Bundle Analyzer
            </h1>
            <p className="text-sm text-muted-foreground">
              Proje dosyalarını analiz et, boyut dağılımı ve optimizasyon önerileri
            </p>
          </div>
          <Button onClick={handleAnalyze} disabled={analyzing}>
            <RefreshCw size={14} className={`mr-1 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analiz ediliyor...' : 'Yeniden Analiz Et'}
          </Button>
        </div>

        {/* Metrik kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <FileCode size={16} className="text-blue-400" />
                <Badge variant="secondary" className="text-[10px]">Toplam</Badge>
              </div>
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-xs text-muted-foreground">Dosya</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Package size={16} className="text-green-400" />
              </div>
              <div className="text-2xl font-bold">{(totalSize / 1024).toFixed(1)} KB</div>
              <p className="text-xs text-muted-foreground">Toplam Boyut</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Layers size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-bold">{Object.keys(byExt).length}</div>
              <p className="text-xs text-muted-foreground">Dosya Tipi</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown size={16} className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold">
                {totalCount > 0 ? (totalSize / totalCount / 1024).toFixed(1) : '0'} KB
              </div>
              <p className="text-xs text-muted-foreground">Ort. Dosya Boyutu</p>
            </CardContent>
          </Card>
        </div>

        {files.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Analiz için bir proje açın ve dosya ekleyin.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Pie chart */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Dosya Tipi Dağılımı (Boyut)</CardTitle>
                  <CardDescription>Uzantı bazında byte dağılımı</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                        style={{ fontSize: '11px' }}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#252526',
                          border: '1px solid #3c3c3c',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                        formatter={(v: number) => `${(v / 1024).toFixed(1)} KB`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar chart - top files */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm">En Büyük 10 Dosya (KB)</CardTitle>
                  <CardDescription>Optimizasyon önceliği</CardDescription>
                </CardHeader>
                <CardContent>
                  {topFiles.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={topFiles} layout="vertical" margin={{ left: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
                        <XAxis type="number" stroke="#858585" fontSize={10} />
                        <YAxis dataKey="name" type="category" stroke="#858585" fontSize={10} width={120} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#252526',
                            border: '1px solid #3c3c3c',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                          formatter={(v: number) => `${v} KB`}
                        />
                        <Bar dataKey="size" fill="#4fc3f7" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                      Dosya yok
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Öneriler */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" /> Optimizasyon Önerileri
                </CardTitle>
                <CardDescription>Bundle boyutunu küçültmek için</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendations.map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded border border-blue-500/20 bg-blue-500/5"
                      >
                        <Icon size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium mb-1">{r.title}</div>
                          <p className="text-xs text-muted-foreground">{r.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
