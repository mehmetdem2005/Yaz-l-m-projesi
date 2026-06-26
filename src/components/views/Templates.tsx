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
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Settings,
  Server,
  Rocket,
  Bot,
  Database,
  Clock,
  Check,
  ArrowRight,
} from 'lucide-react';
import { TEMPLATES, type ProjectTemplate } from '@/lib/templates';
import { STANDARDS } from '@/lib/standards';
import { DEEPSEEK_MODELS } from '@/lib/deepseek';
import { toast } from 'sonner';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Settings,
  Server,
  Rocket,
  Bot,
  Database,
};

export function Templates() {
  const setView = useStore((s) => s.setView);
  const [loading, setLoading] = useState<string | null>(null);

  const handleUse = async (t: ProjectTemplate) => {
    setLoading(t.id);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${t.name} — ${new Date().toLocaleDateString('tr-TR')}`,
        description: t.description,
        template: t.id,
        standard: t.recommendedStandards[0] || '',
      }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Proje oluşturuldu: ${data.project.name}`);
      // Open project
      const detail = await fetch(`/api/projects/${data.project.id}`).then((r) => r.json());
      useStore.getState().setActiveProjectId(detail.project.id);
      useStore.getState().setActiveProject(detail.project);
      useStore.getState().setFiles(detail.project.files || []);
      setView('editor');
    } else {
      toast.error(data.error || 'Hata');
    }
    setLoading(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Proje Şablonları</h1>
          <p className="text-sm text-muted-foreground">
            Hazır başlangıç noktaları ile projenizi hızlıca başlatın
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => {
            const Icon = ICONS[t.icon] || FileText;
            const difficultyColor =
              t.difficulty === 'beginner'
                ? 'text-green-400'
                : t.difficulty === 'intermediate'
                ? 'text-amber-400'
                : 'text-red-400';
            return (
              <Card
                key={t.id}
                className="bg-card border-border hover:border-blue-500/50 transition-colors flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center">
                      <Icon size={20} className="text-blue-400" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${difficultyColor}`}>
                      {t.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {t.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-2 mb-3 flex-1">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground mb-1">
                        Önerilen Standartlar
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {t.recommendedStandards.map((s) => {
                          const std = STANDARDS.find((x) => x.id === s);
                          return (
                            <Badge key={s} variant="secondary" className="text-[9px]">
                              {std?.name ?? s}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground mb-1">
                        Önerilen Modeller
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {t.recommendedModels.map((m) => {
                          const model = DEEPSEEK_MODELS.find((x) => x.id === m);
                          return (
                            <Badge key={m} variant="outline" className="text-[9px]">
                              {model?.name ?? m}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>{t.estimatedTime}</span>
                      <span className="mx-1">·</span>
                      <Check size={12} />
                      <span>{t.files.length} dosya</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleUse(t)}
                    disabled={loading === t.id}
                    className="w-full"
                  >
                    {loading === t.id ? (
                      'Oluşturuluyor...'
                    ) : (
                      <>
                        Şablonu Kullan <ArrowRight size={14} className="ml-1" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
