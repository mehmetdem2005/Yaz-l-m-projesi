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
import { History, GitBranch, RotateCcw, Clock, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectWithVersions {
  id: string;
  name: string;
  versions: Array<{
    id: string;
    version: string;
    message: string | null;
    createdAt: string;
  }>;
  files: Array<{ id: string; path: string; content: string }>;
  messages: Array<{ id: string; role: string; createdAt: string }>;
}

export function HistoryView() {
  const setActiveProject = useStore((s) => s.setActiveProject);
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);
  const setView = useStore((s) => s.setView);
  const setFiles = useStore((s) => s.setFiles);
  const [projects, setProjects] = useState<ProjectWithVersions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects?status=all')
      .then((r) => r.json())
      .then(async (d) => {
        const detailed = await Promise.all(
          (d.projects || []).map((p: { id: string }) =>
            fetch(`/api/projects/${p.id}`).then((r) => r.json())
          )
        );
        setProjects(detailed.map((d) => d.project).filter(Boolean));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRestore = async (projectId: string, version: string) => {
    if (!confirm(`${version} sürümüne geri dönmek istediğinize emin misiniz?`)) return;
    toast.success(`${version} sürümü geri yüklendi (simülasyon)`);
  };

  const handleOpen = (p: ProjectWithVersions) => {
    setActiveProjectId(p.id);
    setActiveProject(p as any);
    setFiles(p.files || []);
    setView('editor');
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History /> Sürüm Geçmişi
          </h1>
          <p className="text-sm text-muted-foreground">
            Proje sürümleri, değişiklik geçmişi ve rollback
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <History size={48} className="mx-auto mb-4 opacity-30" />
            Henüz proje yok
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <Card key={p.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <GitBranch size={16} className="text-blue-400" />
                        {p.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {p.files?.length || 0} dosya · {p.messages?.length || 0} mesaj
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpen(p)}>
                      Aç
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {p.versions && p.versions.length > 0 ? (
                    <div className="space-y-2">
                      {p.versions.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {v.version}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {v.message || 'Sürüm'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(v.createdAt).toLocaleString('tr-TR')}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => handleRestore(p.id, v.version)}
                            >
                              <RotateCcw size={10} className="mr-1" /> Geri al
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground py-4 text-center">
                      Bu projede kayıtlı sürüm yok. Editörde &quot;Sürüm Oluştur&quot; butonu ile
                      sürüm kaydedebilirsiniz.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
