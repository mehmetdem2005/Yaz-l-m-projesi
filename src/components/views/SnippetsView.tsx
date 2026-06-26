'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Code2,
  Server,
  Lock,
  Layout,
  FlaskConical,
  Wrench,
  Star,
  Plus,
  Copy,
  Trash2,
  Search,
  Triangle,
} from 'lucide-react';
import {
  BUILTIN_SNIPPETS,
  SNIPPET_CATEGORIES,
  type Snippet,
} from '@/lib/snippets';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Code2, Server, Lock, Layout, FlaskConical, Wrench, Star, Triangle,
};

const STORAGE_KEY = 'user_snippets';

export function SnippetsView() {
  const [snippets, setSnippets] = useState<Snippet[]>(BUILTIN_SNIPPETS);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Snippet | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    language: 'tsx',
    category: 'custom' as Snippet['category'],
    code: '',
    tags: '',
  });

  // Load user snippets from localStorage (lazy init via useState)
  const [userSnippets, setUserSnippets] = useState<Snippet[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveUserSnippets = (snips: Snippet[]) => {
    setUserSnippets(snips);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snips));
    } catch {}
  };

  const allSnippets = [...snippets, ...userSnippets];

  const filtered = allSnippets.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q)) ||
      s.code.toLowerCase().includes(q)
    );
  });

  const handleCreate = () => {
    if (!form.title.trim() || !form.code.trim()) {
      toast.error('Başlık ve kod gerekli');
      return;
    }
    const newSnippet: Snippet = {
      id: `user_${Date.now()}`,
      title: form.title,
      description: form.description,
      language: form.language,
      category: form.category,
      code: form.code,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      isBuiltin: false,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    saveUserSnippets([...userSnippets, newSnippet]);
    toast.success('Snippet eklendi');
    setOpen(false);
    setForm({ title: '', description: '', language: 'tsx', category: 'custom', code: '', tags: '' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bu snippet silinsin mi?')) return;
    saveUserSnippets(userSnippets.filter((s) => s.id !== id));
    toast.success('Silindi');
  };

  const handleCopy = (snippet: Snippet) => {
    navigator.clipboard.writeText(snippet.code);
    // Usage count artır
    const updated = allSnippets.map((s) =>
      s.id === snippet.id ? { ...s, usageCount: s.usageCount + 1 } : s
    );
    if (snippet.isBuiltin) {
      setSnippets(updated.filter((s) => s.isBuiltin));
    } else {
      saveUserSnippets(updated.filter((s) => !s.isBuiltin));
    }
    toast.success('Kopyalandı');
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Code2 className="text-purple-400" /> Snippet Kütüphanesi
            </h1>
            <p className="text-sm text-muted-foreground">
              Sık kullanılan kod parçaları — {BUILTIN_SNIPPETS.length} built-in + {userSnippets.length} özel
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus size={14} className="mr-1" /> Yeni Snippet
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Snippet ara (başlık, açıklama, kod)..."
            className="pl-9 max-w-md"
          />
        </div>

        {/* Category tabs */}
        <Tabs defaultValue="all" className="mb-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all" className="text-xs">Tümü ({allSnippets.length})</TabsTrigger>
            {SNIPPET_CATEGORIES.map((c) => {
              const count = allSnippets.filter((s) => s.category === c.id).length;
              if (count === 0) return null;
              return (
                <TabsTrigger key={c.id} value={c.id} className="text-xs">
                  {c.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <SnippetGrid
              snippets={filtered}
              onCopy={handleCopy}
              onView={setSelected}
              onDelete={handleDelete}
            />
          </TabsContent>

          {SNIPPET_CATEGORIES.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-4">
              <SnippetGrid
                snippets={filtered.filter((s) => s.category === c.id)}
                onCopy={handleCopy}
                onView={setSelected}
                onDelete={handleDelete}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Create dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Yeni Snippet</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Başlık *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="örn: useDebounce hook"
                />
              </div>
              <div>
                <Label className="text-xs">Açıklama</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Bu snippet ne işe yarar?"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Dil</Label>
                  <Select
                    value={form.language}
                    onValueChange={(v) => setForm({ ...form, language: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['tsx', 'ts', 'js', 'jsx', 'css', 'html', 'json', 'python', 'shell'].map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Kategori</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v as Snippet['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SNIPPET_CATEGORIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Etiketler (virgülle)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="hook, state, react"
                />
              </div>
              <div>
                <Label className="text-xs">Kod *</Label>
                <Textarea
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  rows={10}
                  className="font-mono text-xs"
                  placeholder="Kodunuzu buraya yapıştırın..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
              <Button onClick={handleCreate}>Kaydet</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View dialog */}
        <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-auto">
            {selected && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px]">
                      {selected.language}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {selected.category}
                    </Badge>
                    {!selected.isBuiltin && (
                      <Badge variant="default" className="text-[10px]">Özel</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {selected.usageCount} kullanım
                    </Badge>
                  </div>
                  <DialogTitle>{selected.title}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
                <pre className="bg-[#1e1e1e] border border-border p-4 rounded text-xs font-mono overflow-auto max-h-[500px]">
                  {selected.code}
                </pre>
                <div className="flex flex-wrap gap-1">
                  {selected.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
                <DialogFooter>
                  <Button onClick={() => handleCopy(selected)}>
                    <Copy size={12} className="mr-1" /> Kopyala
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function SnippetGrid({
  snippets,
  onCopy,
  onView,
  onDelete,
}: {
  snippets: Snippet[];
  onCopy: (s: Snippet) => void;
  onView: (s: Snippet) => void;
  onDelete: (id: string) => void;
}) {
  if (snippets.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground text-sm">
          Bu kategoride snippet yok
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {snippets.map((snippet, i) => {
        const cat = SNIPPET_CATEGORIES.find((c) => c.id === snippet.category);
        const Icon = cat ? ICONS[cat.icon] || Code2 : Code2;
        return (
          <motion.div
            key={snippet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card
              className="bg-card border-border hover:border-purple-500/50 transition-colors cursor-pointer group"
              onClick={() => onView(snippet)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cat?.color || '#64748b'}20` }}
                  >
                    <Icon size={14} style={{ color: cat?.color }} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(snippet);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
                      title="Kopyala"
                    >
                      <Copy size={12} />
                    </button>
                    {!snippet.isBuiltin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(snippet.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                        title="Sil"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <CardTitle className="text-sm mt-2">{snippet.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {snippet.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <pre className="bg-[#1e1e1e] border border-border p-2 rounded text-[9px] font-mono line-clamp-3 max-h-12 overflow-hidden">
                  {snippet.code}
                </pre>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-[9px]">
                    {snippet.language}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {snippet.usageCount} kullanım
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
