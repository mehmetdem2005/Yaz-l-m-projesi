'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Bell,
  BellOff,
  CheckCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FolderGit2,
  Bot,
  Settings2,
  Shield,
  Mail,
  Smartphone,
  MessageSquare,
  Monitor,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type NotifType = 'info' | 'success' | 'warning' | 'error';
type Category = 'project' | 'agent' | 'system' | 'security';

interface Notification {
  id: string;
  type: NotifType;
  category: Category;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  important?: boolean;
}

const INITIAL_NOTIFS: Notification[] = [
  { id: '1', type: 'success', category: 'project', title: 'Deploy başarılı', message: 'my-app v1.4.2 production\'a deploy edildi', timestamp: '2 dk önce', read: false, important: true },
  { id: '2', type: 'info', category: 'agent', title: 'Agent tamamlandı', message: 'Refactor agent 12 dosyayı güncelledi', timestamp: '5 dk önce', read: false },
  { id: '3', type: 'warning', category: 'system', title: 'Yüksek bellek kullanımı', message: 'Server bellek %85\'e ulaştı', timestamp: '12 dk önce', read: false },
  { id: '4', type: 'error', category: 'security', title: 'Başarısız giriş denemesi', message: '5 kez hatalı şifre — IP: 203.45.x.x', timestamp: '18 dk önce', read: false, important: true },
  { id: '5', type: 'info', category: 'project', title: 'Yeni yorum', message: 'Zeynep K. "App.tsx"e yorum yaptı', timestamp: '25 dk önce', read: true },
  { id: '6', type: 'success', category: 'agent', title: 'Test suite geçti', message: '147/147 test başarılı (3.2s)', timestamp: '1 saat önce', read: true },
  { id: '7', type: 'warning', category: 'security', title: 'API anahtarı süresi doluyor', message: 'DEEPSEEK_API_KEY 3 gün içinde sona erecek', timestamp: '2 saat önce', read: true, important: true },
  { id: '8', type: 'info', category: 'system', title: 'Yedekleme tamamlandı', message: 'Günlük DB yedeği (2.3 GB) alındı', timestamp: '3 saat önce', read: true },
  { id: '9', type: 'success', category: 'project', title: 'Pull request birleştirildi', message: 'PR #142 main branch\'e merge edildi', timestamp: '5 saat önce', read: true },
  { id: '10', type: 'error', category: 'agent', title: 'Agent hatası', message: 'Build agent timeout — 60sn limit aşıldı', timestamp: '6 saat önce', read: true },
  { id: '11', type: 'info', category: 'system', title: 'Sistem güncellemesi', message: 'Yeni sürüm v2.1 mevcut', timestamp: '8 saat önce', read: true },
  { id: '12', type: 'warning', category: 'project', title: 'Merge conflict', message: 'feat/auth branch\'inde 3 conflict var', timestamp: '10 saat önce', read: true },
];

const TYPE_META: Record<NotifType, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
};

const CATEGORY_META: Record<Category, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  project: { label: 'Proje', icon: FolderGit2, color: 'text-blue-400' },
  agent: { label: 'Agent', icon: Bot, color: 'text-purple-400' },
  system: { label: 'Sistem', icon: Settings2, color: 'text-gray-400' },
  security: { label: 'Güvenlik', icon: Shield, color: 'text-red-400' },
};

export function NotificationsView() {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    email: true,
    push: true,
    inApp: true,
    slack: false,
  });

  const filtered = notifs.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'important') return n.important;
    return true;
  });

  const unreadCount = notifs.filter((n) => !n.read).length;
  const importantCount = notifs.filter((n) => n.important).length;

  const markRead = (id: string) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
    toast.success('Tüm bildirimler okundu olarak işaretlendi');
  };

  const togglePref = (key: string) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const PREF_META = [
    { key: 'email', label: 'E-posta', desc: 'Önemli olaylarda e-posta gönder', icon: Mail },
    { key: 'push', label: 'Push Bildirim', desc: 'Tarayıcı push notification', icon: Smartphone },
    { key: 'inApp', label: 'Uygulama İçi', desc: 'Arayüz içinde göster', icon: Monitor },
    { key: 'slack', label: 'Slack', desc: 'Slack kanalına bildir', icon: MessageSquare },
  ];

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="text-blue-400" /> Bildirim Merkezi
            </h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount} okunmamış · {importantCount} önemli
            </p>
          </div>
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck size={14} className="mr-1" /> Tümünü Okundu İşaretle
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Notifications */}
          <div className="lg:col-span-2">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="mb-3">
                <TabsTrigger value="all" className="text-xs">Tümü ({notifs.length})</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">Okunmamış ({unreadCount})</TabsTrigger>
                <TabsTrigger value="important" className="text-xs">Önemli ({importantCount})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 flex flex-col items-center text-center">
                    <BellOff size={32} className="text-muted-foreground mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">Bu filtrede bildirim yok</p>
                  </CardContent>
                </Card>
              ) : (
                filtered.map((n, i) => {
                  const TypeIcon = TYPE_META[n.type].icon;
                  const CatIcon = CATEGORY_META[n.category].icon;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card
                        className={`bg-card border-border cursor-pointer transition-all hover:border-white/20 ${
                          !n.read ? 'border-blue-500/30 bg-blue-500/5' : ''
                        }`}
                        onClick={() => markRead(n.id)}
                      >
                        <CardContent className="p-3 flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg ${TYPE_META[n.type].bg} flex items-center justify-center shrink-0`}>
                            <TypeIcon size={16} className={TYPE_META[n.type].color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-sm truncate">{n.title}</span>
                              {n.important && (
                                <Badge variant="destructive" className="text-[9px] px-1 py-0">Önemli</Badge>
                              )}
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className={`text-[9px] ${CATEGORY_META[n.category].color}`}>
                                <CatIcon size={9} className="mr-0.5" /> {CATEGORY_META[n.category].label}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">{n.timestamp}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Preferences */}
          <div>
            <Card className="bg-card border-border sticky top-0">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 size={16} className="text-purple-400" /> Bildirim Tercihleri
                </CardTitle>
                <CardDescription className="text-xs">Hangi kanallara gönderilecek</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PREF_META.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div key={p.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs font-medium cursor-pointer">{p.label}</Label>
                        <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                      </div>
                      <Switch
                        checked={prefs[p.key]}
                        onCheckedChange={() => togglePref(p.key)}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Category breakdown */}
            <Card className="bg-card border-border mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Kategorilere Göre</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(Object.keys(CATEGORY_META) as Category[]).map((c) => {
                  const count = notifs.filter((n) => n.category === c).length;
                  const CatIcon = CATEGORY_META[c].icon;
                  return (
                    <div key={c} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <CatIcon size={12} className={CATEGORY_META[c].color} />
                        {CATEGORY_META[c].label}
                      </span>
                      <Badge variant="secondary" className="text-[9px]">{count}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
