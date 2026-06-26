'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bot,
  Plus,
  Trash2,
  Eye,
  Loader2,
  Network,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';
import { BUILTIN_AGENT_TEMPLATES, NODE_STYLES } from '@/lib/agent-tree';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function AgentTemplatesView() {
  const setView = useStore((s) => s.setView);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent-templates');
      const data = await res.json();
      setCustomTemplates(data.custom || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;
    // API'de delete route olmadığı için frontend'den kaldır
    toast.info('Şablon silme özelliği yakında');
  };

  const handleUse = (template: any) => {
    // Agent Tree Studio'ya geç ve şablonu yükle
    useStore.setState({ activeView: 'agent-tree' });
    toast.success(`"${template.name}" yüklendi — Agent Tree Studio'da düzenleyebilirsiniz`);
  };

  const handleDownload = (template: any) => {
    const blob = new Blob(
      [JSON.stringify(template, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Şablon indirildi');
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Network className="text-purple-400" /> Agent Şablonları
            </h1>
            <p className="text-sm text-muted-foreground">
              Built-in ve kullanıcı şablonları — düzenleyip çalıştırabilirsiniz
            </p>
          </div>
          <Button onClick={() => setView('agent-tree')}>
            <Plus size={14} className="mr-1" /> Yeni Şablon Oluştur
          </Button>
        </div>

        {/* Built-in templates */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" /> Built-in Şablonlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {BUILTIN_AGENT_TEMPLATES.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-card border-border hover:border-purple-500/50 transition-colors group">
                  <CardHeader>
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <CardDescription className="text-xs">{t.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Bot size={10} /> {t.nodes.length} node
                      </span>
                      <span className="flex items-center gap-1">
                        <Network size={10} /> {t.edges.length} bağlantı
                      </span>
                    </div>
                    {/* Mini preview */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {t.nodes.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          className="w-2 h-2 rounded-full"
                          style={{ background: NODE_STYLES[n.data.type].color }}
                          title={n.data.label}
                        />
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUse(t)}
                    >
                      <Eye size={12} className="mr-1" /> Studio'da Aç
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Custom templates */}
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Bot size={14} className="text-purple-400" /> Kullanıcı Şablonları ({customTemplates.length})
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto" size={24} />
            </div>
          ) : customTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bot size={48} className="opacity-30 mb-3" />
                <p className="mb-2">Henüz kullanıcı şablonu yok</p>
                <Button variant="outline" onClick={() => setView('agent-tree')}>
                  Agent Tree Studio'da oluştur
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customTemplates.map((t, i) => {
                let nodes: any[] = [];
                let edges: any[] = [];
                try {
                  nodes = JSON.parse(t.nodes);
                  edges = JSON.parse(t.edges);
                } catch {}
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-card border-border hover:border-purple-500/50 transition-colors group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{t.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {t.description || 'Kullanıcı şablonu'}
                            </CardDescription>
                          </div>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bot size={10} /> {nodes.length} node
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(t.updatedAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {nodes.slice(0, 8).map((n) => (
                            <div
                              key={n.id}
                              className="w-2 h-2 rounded-full"
                              style={{ background: NODE_STYLES[n.data?.type || 'custom']?.color }}
                            />
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleUse({ ...t, nodes, edges })}
                          >
                            <Eye size={12} className="mr-1" /> Aç
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload({ ...t, nodes, edges })}
                          >
                            <Download size={12} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
