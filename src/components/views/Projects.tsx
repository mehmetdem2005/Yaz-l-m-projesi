'use client';

import { useEffect, useState } from 'react';
import { useStore, type Project } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderGit2, Plus, Search, Trash2, FileText, MessageSquare, ArrowRight, Clock } from 'lucide-react';
import { STANDARDS } from '@/lib/standards';
import { TEMPLATES } from '@/lib/templates';
import { toast } from 'sonner';

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', template: '', standard: '' });

  const setActiveProject = useStore((s) => s.setActiveProject);
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);
  const setView = useStore((s) => s.setView);

  const load = () => {
    setLoading(true);
    fetch('/api/projects?status=all')
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const d = await fetch('/api/projects?status=all').then((r) => r.json());
      if (mounted) {
        setProjects(d.projects || []);
        setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Proje adı gerekli');
      return;
    }
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Proje oluşturuldu');
      setOpen(false);
      setForm({ name: '', description: '', template: '', standard: '' });
      // Yeni projeyi detaylı yükle ve editöre aç
      const detail = await fetch(`/api/projects/${data.project.id}`).then((r) => r.json());
      setActiveProjectId(detail.project.id);
      setActiveProject(detail.project);
      useStore.getState().setFiles(detail.project.files || []);
      setView('editor');
    } else {
      toast.error(data.error || 'Hata');
    }
  };

  const handleOpen = async (p: Project) => {
    const res = await fetch(`/api/projects/${p.id}`);
    const data = await res.json();
    if (res.ok) {
      setActiveProjectId(data.project.id);
      setActiveProject(data.project);
      useStore.getState().setFiles(data.project.files || []);
      setView('editor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Proje silindi');
      load();
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Projeler</h1>
            <p className="text-sm text-muted-foreground">
              AI stüdyo projelerinizi yönetin
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2" size={16} />
                Yeni Proje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Yeni Proje Oluştur</DialogTitle>
                <DialogDescription>
                  Şablon ve standart seçerek projenizi başlatın
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Proje Adı *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="örn: Kurumsal SaaS Dashboard"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Açıklama</Label>
                  <Textarea
                    id="desc"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Bu projenin amacı..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Şablon (opsiyonel)</Label>
                  <Select
                    value={form.template}
                    onValueChange={(v) => setForm({ ...form, template: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Boş başla veya şablon seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} — {t.difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Standart (opsiyonel)</Label>
                  <Select
                    value={form.standard}
                    onValueChange={(v) => setForm({ ...form, standard: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kurumsal standart seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {STANDARDS.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — {s.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleCreate}>Oluştur</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Proje ara..."
            className="pl-9 max-w-md"
          />
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FolderGit2 size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground mb-4">Henüz proje yok</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2" size={16} /> İlk projeyi oluştur
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Card
                key={p.id}
                className="bg-card border-border hover:border-blue-500/50 transition-colors cursor-pointer group"
                onClick={() => handleOpen(p)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate flex items-center gap-2">
                        <FolderGit2 size={16} className="text-blue-400" />
                        {p.name}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {p.description || 'Açıklama yok'}
                      </CardDescription>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.template && (
                      <Badge variant="secondary" className="text-[10px]">
                        {TEMPLATES.find((t) => t.id === p.template)?.name ?? p.template}
                      </Badge>
                    )}
                    {p.standard && (
                      <Badge variant="outline" className="text-[10px]">
                        {STANDARDS.find((s) => s.id === p.standard)?.name ?? p.standard}
                      </Badge>
                    )}
                    <Badge
                      variant={p.status === 'active' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {p.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FileText size={12} />
                        {p._count?.files ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {p._count?.messages ?? 0}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(p.updatedAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-end text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Aç <ArrowRight className="ml-1" size={12} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
