'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Webhook,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type EventType = 'project.created' | 'file.saved' | 'agent.completed' | 'deploy.success';

const EVENT_LABELS: Record<EventType, string> = {
  'project.created': 'Proje Oluşturuldu',
  'file.saved': 'Dosya Kaydedildi',
  'agent.completed': 'Agent Tamamlandı',
  'deploy.success': 'Deploy Başarılı',
};

interface Webhook {
  id: string;
  url: string;
  event: EventType;
  status: 'active' | 'paused' | 'error';
  lastDelivery: string;
  successRate: number;
  totalDeliveries: number;
}

interface DeliveryLog {
  id: string;
  webhookUrl: string;
  event: EventType;
  status: 'success' | 'failed';
  statusCode: number;
  duration: number;
  time: string;
}

const INITIAL_WEBHOOKS: Webhook[] = [
  { id: '1', url: 'https://hooks.slack.com/services/T0/B0/xxx', event: 'project.created', status: 'active', lastDelivery: '2 dk önce', successRate: 100, totalDeliveries: 142 },
  { id: '2', url: 'https://api.github.com/repos/org/app/dispatches', event: 'deploy.success', status: 'active', lastDelivery: '15 dk önce', successRate: 98, totalDeliveries: 87 },
  { id: '3', url: 'https://maker.ifttt.com/trigger/save/json', event: 'file.saved', status: 'paused', lastDelivery: '1 saat önce', successRate: 95, totalDeliveries: 1240 },
  { id: '4', url: 'https://internal.corp/api/agent-done', event: 'agent.completed', status: 'error', lastDelivery: '5 saat önce', successRate: 72, totalDeliveries: 56 },
  { id: '5', url: 'https://discord.com/api/webhooks/123/abc', event: 'deploy.success', status: 'active', lastDelivery: '30 dk önce', successRate: 100, totalDeliveries: 34 },
];

const INITIAL_LOGS: DeliveryLog[] = [
  { id: '1', webhookUrl: 'hooks.slack.com/...', event: 'project.created', status: 'success', statusCode: 200, duration: 245, time: '2 dk önce' },
  { id: '2', webhookUrl: 'api.github.com/...', event: 'deploy.success', status: 'success', statusCode: 200, duration: 580, time: '15 dk önce' },
  { id: '3', webhookUrl: 'internal.corp/...', event: 'agent.completed', status: 'failed', statusCode: 500, duration: 1200, time: '5 saat önce' },
  { id: '4', webhookUrl: 'discord.com/...', event: 'deploy.success', status: 'success', statusCode: 204, duration: 180, time: '30 dk önce' },
  { id: '5', webhookUrl: 'hooks.slack.com/...', event: 'project.created', status: 'success', statusCode: 200, duration: 210, time: '1 saat önce' },
  { id: '6', webhookUrl: 'api.github.com/...', event: 'deploy.success', status: 'failed', statusCode: 422, duration: 320, time: '2 saat önce' },
  { id: '7', webhookUrl: 'maker.ifttt.com/...', event: 'file.saved', status: 'success', statusCode: 200, duration: 150, time: '3 saat önce' },
  { id: '8', webhookUrl: 'hooks.slack.com/...', event: 'project.created', status: 'success', statusCode: 200, duration: 230, time: '4 saat önce' },
  { id: '9', webhookUrl: 'discord.com/...', event: 'deploy.success', status: 'success', statusCode: 204, duration: 195, time: '5 saat önce' },
  { id: '10', webhookUrl: 'internal.corp/...', event: 'agent.completed', status: 'failed', statusCode: 503, duration: 5000, time: '6 saat önce' },
];

export function WebhooksView() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS);
  const [logs, setLogs] = useState<DeliveryLog[]>(INITIAL_LOGS);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [event, setEvent] = useState<EventType>('project.created');
  const [testing, setTesting] = useState<string | null>(null);

  const handleAdd = () => {
    if (!url.startsWith('http')) {
      toast.error('Geçerli bir URL girin');
      return;
    }
    const newHook: Webhook = {
      id: Date.now().toString(),
      url,
      event,
      status: 'active',
      lastDelivery: 'henüz yok',
      successRate: 0,
      totalDeliveries: 0,
    };
    setWebhooks([...webhooks, newHook]);
    toast.success('Webhook eklendi');
    setUrl('');
    setEvent('project.created');
    setOpen(false);
  };

  const handleTest = (id: string) => {
    setTesting(id);
    setTimeout(() => {
      setTesting(null);
      const hook = webhooks.find((w) => w.id === id);
      if (!hook) return;
      const success = Math.random() > 0.2;
      const newLog: DeliveryLog = {
        id: Date.now().toString(),
        webhookUrl: hook.url.length > 25 ? hook.url.slice(0, 25) + '...' : hook.url,
        event: hook.event,
        status: success ? 'success' : 'failed',
        statusCode: success ? 200 : 500,
        duration: Math.floor(Math.random() * 800) + 100,
        time: 'az önce',
      };
      setLogs([newLog, ...logs].slice(0, 10));
      toast[success ? 'success' : 'error'](
        success ? 'Test başarılı (200)' : 'Test başarısız (500)'
      );
    }, 1200);
  };

  const handleDelete = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    toast.success('Webhook silindi');
  };

  const statusColor = (s: Webhook['status']) =>
    s === 'active' ? 'default' : s === 'paused' ? 'secondary' : 'destructive';

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Webhook className="text-blue-400" /> Webhook Yönetimi
            </h1>
            <p className="text-sm text-muted-foreground">
              Olay tabanlı webhook'lar — {webhooks.length} aktif endpoint
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus size={14} className="mr-1" /> Yeni Webhook</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Yeni Webhook</DialogTitle>
                <DialogDescription>Olay gerçekleştiğinde HTTP POST gönderilir</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://hooks.example.com/..."
                    className="text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">Olay (Event)</Label>
                  <Select value={event} onValueChange={(v) => setEvent(v as EventType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(EVENT_LABELS) as EventType[]).map((e) => (
                        <SelectItem key={e} value={e}>
                          <div className="flex flex-col">
                            <span className="text-xs">{EVENT_LABELS[e]}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{e}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
                <Button onClick={handleAdd}>Ekle</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Webhook list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {webhooks.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-card border-border group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={statusColor(w.status)} className="text-[9px]">{w.status}</Badge>
                        <Badge variant="outline" className="text-[9px] font-mono">{w.event}</Badge>
                      </div>
                      <code className="text-xs text-blue-400 truncate block">{w.url}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
                      onClick={() => handleDelete(w.id)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div>
                      <div className="text-sm font-bold">{w.totalDeliveries}</div>
                      <div className="text-[9px] text-muted-foreground">Gönderim</div>
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${w.successRate >= 95 ? 'text-green-400' : w.successRate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                        %{w.successRate}
                      </div>
                      <div className="text-[9px] text-muted-foreground">Başarı</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                        <Clock size={9} /> {w.lastDelivery}
                      </div>
                      <div className="text-[9px] text-muted-foreground">Son</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs"
                    disabled={testing === w.id}
                    onClick={() => handleTest(w.id)}
                  >
                    <Send size={11} className="mr-1" />
                    {testing === w.id ? 'Gönderiliyor...' : 'Test Gönder'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Delivery log */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={16} className="text-purple-400" /> Delivery Log
            </CardTitle>
            <CardDescription className="text-xs">Son {logs.length} istek</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-2 rounded text-xs hover:bg-white/5"
                >
                  {log.status === 'success' ? (
                    <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-red-400 shrink-0" />
                  )}
                  <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                    {log.statusCode}
                  </Badge>
                  <code className="text-blue-400 truncate flex-1 text-[11px]">{log.webhookUrl}</code>
                  <span className="text-muted-foreground font-mono text-[10px] shrink-0">{log.event}</span>
                  <span className="text-muted-foreground text-[10px] shrink-0">{log.duration}ms</span>
                  <span className="text-muted-foreground text-[10px] shrink-0 w-20 text-right">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
