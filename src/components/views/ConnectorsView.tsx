'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Github,
  MessageSquare,
  Database,
  Globe,
  ClipboardList,
  FileText,
  Cloud,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  Zap,
  Plug,
} from 'lucide-react';
import { CONNECTOR_SCHEMAS, type ConnectorType } from '@/lib/connectors';
import { MCP_SERVER_CATALOG, type MCPServerTemplate } from '@/lib/mcp';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Github,
  MessageSquare,
  Database,
  Globe,
  ClipboardList,
  FileText,
  Cloud,
};

interface Connector {
  id: string;
  type: string;
  name: string;
  description?: string;
  status: string;
  config: Record<string, unknown>;
  lastSync?: string;
}

export function ConnectorsView() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ConnectorType>('github');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [mcpConnected, setMcpConnected] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/connectors');
      const data = await res.json();
      setConnectors(data.connectors || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    const schema = CONNECTOR_SCHEMAS.find((s) => s.type === selectedType);
    if (!schema) return;

    // Validate required fields
    for (const field of schema.authFields) {
      if (field.required && !config[field.key]) {
        toast.error(`${field.label} gerekli`);
        return;
      }
    }

    setTesting(true);
    try {
      const res = await fetch('/api/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          name: schema.label,
          description: schema.description,
          config,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Connector eklendi');
        setOpen(false);
        setConfig({});
        load();
      } else {
        toast.error(data.error || 'Hata');
      }
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu connector\'u silmek istediğinize emin misiniz?')) return;
    await fetch(`/api/connectors?id=${id}`, { method: 'DELETE' });
    load();
    toast.success('Silindi');
  };

  const handleMCPConnect = async (template: MCPServerTemplate) => {
    setMcpConnected((prev) => new Set(prev).add(template.id));
    toast.success(`${template.name} MCP server bağlandı (simülasyon)`);
  };

  const currentSchema = CONNECTOR_SCHEMAS.find((s) => s.type === selectedType);

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Plug className="text-blue-400" /> Connector'lar & MCP
            </h1>
            <p className="text-sm text-muted-foreground">
              Dış sistem entegrasyonları — GitHub, Slack, DB, REST API + MCP server'ları
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={14} className="mr-1" /> Connector Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto bg-card border-border">
              <DialogHeader>
                <DialogTitle>Yeni Connector</DialogTitle>
                <DialogDescription>
                  Dış sistem bağlantısı ekleyin
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-xs">Tip</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(v) => {
                      setSelectedType(v as ConnectorType);
                      setConfig({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONNECTOR_SCHEMAS.map((s) => {
                        const Icon = ICONS[s.icon] || Globe;
                        return (
                          <SelectItem key={s.type} value={s.type}>
                            <div className="flex items-center gap-2">
                              <Icon size={12} />
                              {s.label}
                              {s.popular && (
                                <Badge variant="secondary" className="text-[9px] ml-1">
                                  Popüler
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {currentSchema && (
                  <>
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded text-xs text-blue-300">
                      {currentSchema.description}
                    </div>
                    <div className="space-y-3">
                      {currentSchema.authFields.map((field) => (
                        <div key={field.key}>
                          <Label className="text-xs flex items-center gap-1">
                            {field.label}
                            {field.required && <span className="text-red-400">*</span>}
                          </Label>
                          <Input
                            type={field.type === 'password' ? 'password' : 'text'}
                            value={config[field.key] || ''}
                            onChange={(e) =>
                              setConfig({ ...config, [field.key]: e.target.value })
                            }
                            placeholder={field.placeholder}
                            className="text-sm"
                          />
                          {field.description && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {field.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label className="text-xs">Mevcut Aksiyonlar</Label>
                      <div className="mt-2 space-y-1 max-h-32 overflow-auto">
                        {currentSchema.actions.map((a) => (
                          <div
                            key={a.id}
                            className="p-2 bg-white/5 border border-white/10 rounded text-xs"
                          >
                            <div className="font-medium text-blue-400">{a.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {a.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleAdd} disabled={testing}>
                  {testing ? (
                    <>
                      <Loader2 size={12} className="mr-1 animate-spin" /> Test ediliyor...
                    </>
                  ) : (
                    'Ekle'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="connectors">
          <TabsList>
            <TabsTrigger value="connectors" className="text-xs">
              Connector'lar ({connectors.length})
            </TabsTrigger>
            <TabsTrigger value="mcp" className="text-xs">
              MCP Server'ları ({MCP_SERVER_CATALOG.length})
            </TabsTrigger>
          </TabsList>

          {/* Connectors tab */}
          <TabsContent value="connectors" className="mt-4">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin mx-auto" size={24} />
              </div>
            ) : connectors.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Plug size={48} className="opacity-30 mb-3" />
                  <p className="text-muted-foreground mb-4">Henüz connector yok</p>
                  <Button onClick={() => setOpen(true)}>
                    <Plus size={14} className="mr-1" /> İlk connector'ı ekle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {connectors.map((c, i) => {
                  const schema = CONNECTOR_SCHEMAS.find((s) => s.type === c.type);
                  const Icon = ICONS[schema?.icon || 'Globe'] || Globe;
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="bg-card border-border group">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center">
                              <Icon size={20} className="text-blue-400" />
                            </div>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <CardTitle className="text-base mt-2">{c.name}</CardTitle>
                          <CardDescription className="text-xs capitalize">
                            {c.type}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-xs">
                            <Badge
                              variant={
                                c.status === 'connected'
                                  ? 'default'
                                  : c.status === 'error'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-[10px]"
                            >
                              {c.status}
                            </Badge>
                            {c.lastSync && (
                              <span className="text-muted-foreground text-[10px]">
                                {new Date(c.lastSync).toLocaleDateString('tr-TR')}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* MCP tab */}
          <TabsContent value="mcp" className="mt-4">
            <Card className="mb-3 bg-blue-500/5 border-blue-500/20">
              <CardContent className="py-3 text-xs text-blue-300">
                <strong>MCP (Model Context Protocol)</strong> — AI agent'larının dış araçlara
                standart bir protokolle bağlanmasını sağlar. Anthropic tarafından geliştirilmiştir.
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MCP_SERVER_CATALOG.map((template, i) => {
                const isConnected = mcpConnected.has(template.id);
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className={`bg-card border-border ${isConnected ? 'border-green-500/30' : ''}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {template.name}
                              {template.popular && (
                                <Badge variant="secondary" className="text-[9px]">
                                  Popüler
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {template.description}
                            </CardDescription>
                          </div>
                          {isConnected ? (
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Check className="text-green-400" size={14} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                              <Zap className="text-gray-500" size={14} />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-[10px] font-mono text-muted-foreground bg-black/30 p-2 rounded break-all">
                            {template.command} {template.args.join(' ')}
                          </div>
                          {template.env && (
                            <div className="text-[10px] text-muted-foreground">
                              <strong>Env:</strong> {Object.keys(template.env).join(', ')}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant={isConnected ? 'outline' : 'default'}
                            className="w-full h-7 text-xs"
                            onClick={() => handleMCPConnect(template)}
                          >
                            {isConnected ? (
                              <>
                                <Check size={12} className="mr-1" /> Bağlı
                              </>
                            ) : (
                              <>
                                <Plug size={12} className="mr-1" /> Bağlan
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
