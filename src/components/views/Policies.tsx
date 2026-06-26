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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScrollText, FileText, ChevronRight, Layers, Download } from 'lucide-react';
import { POLICIES, POLICY_CATEGORIES, type PolicyMeta } from '@/lib/policies-data';

export function Policies() {
  const [selected, setSelected] = useState<PolicyMeta | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const loadPolicy = async (p: PolicyMeta) => {
    setSelected(p);
    setLoading(true);
    const res = await fetch(`/api/policies?id=${p.id}&content=true`);
    const data = await res.json();
    setContent(data.content || 'İçerik okunamadı.');
    setLoading(false);
  };

  const filtered = filter === 'all' ? POLICIES : POLICIES.filter((p) => p.category === filter);

  const handleDownload = () => {
    if (!selected) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `politika-${selected.id}-${selected.title.split(' ')[0].toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* Sidebar: Policy List */}
      <aside className="w-80 border-r border-border flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <ScrollText size={16} /> 20 Kurumsal Politika
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            4 fazda yazılmış derin politikalar
          </p>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-[#3c3c3c] border border-border text-xs px-2 py-1 rounded"
          >
            <option value="all">Tüm Kategoriler ({POLICIES.length})</option>
            {POLICY_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} ({POLICIES.filter((p) => p.category === c.id).length})
              </option>
            ))}
          </select>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => loadPolicy(p)}
                className={`w-full text-left p-2 rounded hover:bg-white/5 transition-colors ${
                  selected?.id === p.id ? 'bg-blue-500/20' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono text-muted-foreground mt-0.5">
                    P{p.id.toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{p.title}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge
                        variant="outline"
                        className="text-[9px] py-0 px-1"
                      >
                        Faz {p.phase}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[9px] py-0 px-1"
                      >
                        {POLICY_CATEGORIES.find((c) => c.id === p.category)?.label}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-muted-foreground mt-1" />
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main: Policy Content */}
      <main className="flex-1 overflow-auto">
        {selected ? (
          <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Politika #{selected.id}</Badge>
                  <Badge variant="secondary">Faz {selected.phase}</Badge>
                  <Badge variant="default">
                    {POLICY_CATEGORIES.find((c) => c.id === selected.category)?.label}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold">{selected.title}</h1>
                <p className="text-sm text-muted-foreground mt-2">{selected.summary}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download size={14} className="mr-1" /> İndir
              </Button>
            </div>

            <Card className="mb-4 bg-[#2d2d2d] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers size={14} /> İlgili Standartlar
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {selected.standards.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4 bg-[#2d2d2d] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Uygulama Senaryoları</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm space-y-1">
                  {selected.applicableScenarios.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#1e1e1e] border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText size={14} /> Politika Metni
                </CardTitle>
                <CardDescription>Detaylı kurumsal politika dokümanı</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Yükleniyor...
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none text-sm">
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {content}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <ScrollText size={64} className="mx-auto mb-4 opacity-30" />
              <h2 className="text-xl font-semibold mb-2">20 Derin Politika</h2>
              <p className="text-sm max-w-md mx-auto mb-4">
                TOGAF, ISO 27001, SOC 2, GDPR, HIPAA, PCI-DSS, OWASP, EU AI Act ve daha fazlasına
                uygun, faz faz yazılmış kurumsal politika dosyaları.
              </p>
              <p className="text-xs">Soldan bir politika seçin</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
