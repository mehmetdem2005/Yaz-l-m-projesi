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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookMarked, ExternalLink, Copy, Sparkles } from 'lucide-react';
import { STANDARDS, STANDARD_CATEGORIES, type EnterpriseStandard } from '@/lib/standards';
import { toast } from 'sonner';

export function Standards() {
  const [selected, setSelected] = useState<EnterpriseStandard | null>(null);

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Prompt kopyalandı');
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookMarked /> Kurumsal Standartlar
          </h1>
          <p className="text-sm text-muted-foreground">
            {STANDARDS.length} kurumsal standart — mimari, güvenlik, kalite, gizlilik, governance, AI, DevOps
          </p>
        </div>

        {/* Category tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all" className="text-xs">Tümü ({STANDARDS.length})</TabsTrigger>
            {STANDARD_CATEGORIES.map((c) => {
              const count = STANDARDS.filter((s) => s.category === c.id).length;
              if (count === 0) return null;
              return (
                <TabsTrigger key={c.id} value={c.id} className="text-xs">
                  {c.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STANDARDS.map((s) => (
                <StandardCard key={s.id} standard={s} onClick={() => setSelected(s)} />
              ))}
            </div>
          </TabsContent>

          {STANDARD_CATEGORIES.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STANDARDS.filter((s) => s.category === c.id).map((s) => (
                  <StandardCard key={s.id} standard={s} onClick={() => setSelected(s)} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
            {selected && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{selected.category}</Badge>
                    <Badge variant="secondary">v{selected.version}</Badge>
                    <Badge variant="default">{selected.issuer}</Badge>
                  </div>
                  <DialogTitle className="text-xl">{selected.fullName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm">{selected.description}</p>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Ana Prensipler</h4>
                    <ul className="text-sm space-y-1">
                      {selected.keyPrinciples.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Uygulama Senaryoları</h4>
                    <div className="flex flex-wrap gap-2">
                      {selected.applicableScenarios.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center gap-1">
                        <Sparkles size={14} className="text-blue-400" /> AI Prompt Şablonu
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPrompt(selected.promptTemplate)}
                      >
                        <Copy size={12} className="mr-1" /> Kopyala
                      </Button>
                    </div>
                    <div className="bg-[#1e1e1e] border border-border p-3 rounded text-xs font-mono whitespace-pre-wrap">
                      {selected.promptTemplate}
                    </div>
                  </div>

                  <a
                    href={selected.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline"
                  >
                    Resmi dokümantasyon <ExternalLink size={12} />
                  </a>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function StandardCard({
  standard,
  onClick,
}: {
  standard: EnterpriseStandard;
  onClick: () => void;
}) {
  const cat = STANDARD_CATEGORIES.find((c) => c.id === standard.category);
  return (
    <Card
      className="bg-card border-border hover:border-blue-500/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{standard.name}</CardTitle>
            <CardDescription className="text-xs">{standard.fullName}</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {cat?.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {standard.description}
        </p>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>v{standard.version}</span>
          <span>{standard.keyPrinciples.length} prensip</span>
        </div>
      </CardContent>
    </Card>
  );
}
