'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Radio,
  Activity,
  FileCode2,
  MousePointer2,
  Zap,
  CircleDot,
  GitBranch,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveUser {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  file: string;
  action: string;
}

interface ActivityItem {
  id: string;
  user: string;
  color: string;
  action: string;
  target: string;
  time: string;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

const INITIAL_USERS: ActiveUser[] = [
  { id: '1', name: 'Ahmet Y.', color: COLORS[0], cursor: { x: 30, y: 40 }, file: 'src/components/App.tsx', action: 'düzenliyor' },
  { id: '2', name: 'Zeynep K.', color: COLORS[1], cursor: { x: 70, y: 25 }, file: 'src/lib/store.ts', action: 'inceliyor' },
  { id: '3', name: 'Ayşe Ş.', color: COLORS[2], cursor: { x: 50, y: 65 }, file: 'src/components/App.tsx', action: 'yazıyor' },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
  { id: '1', user: 'Ahmet Y.', color: COLORS[0], action: 'düzenledi', target: 'App.tsx', time: 'az önce' },
  { id: '2', user: 'Zeynep K.', color: COLORS[1], action: 'yorumladı', target: 'store.ts:42', time: '1 dk önce' },
  { id: '3', user: 'Ayşe Ş.', color: COLORS[2], action: 'oluşturdu', target: 'components/Card.tsx', time: '3 dk önce' },
  { id: '4', user: 'Ahmet Y.', color: COLORS[0], action: 'kaydetti', target: 'App.tsx', time: '5 dk önce' },
  { id: '5', user: 'Zeynep K.', color: COLORS[1], action: 'branch açtı', target: 'feat/auth', time: '8 dk önce' },
];

export function CollabView() {
  const activeProject = useStore((s) => s.activeProject);
  const [liveMode, setLiveMode] = useState(false);
  const [users, setUsers] = useState<ActiveUser[]>(INITIAL_USERS);
  const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate cursor movement
  useEffect(() => {
    if (!liveMode) return;
    intervalRef.current = setInterval(() => {
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          cursor: {
            x: Math.max(5, Math.min(95, u.cursor.x + (Math.random() - 0.5) * 20)),
            y: Math.max(5, Math.min(95, u.cursor.y + (Math.random() - 0.5) * 20)),
          },
        }))
      );
    }, 1200);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [liveMode]);

  const toggleLive = () => {
    setLiveMode((v) => {
      const next = !v;
      toast.success(next ? 'Canlı düzenleme başlatıldı' : 'Canlı düzenleme durduruldu');
      return next;
    });
  };

  // Group users by file
  const fileGroups = users.reduce<Record<string, ActiveUser[]>>((acc, u) => {
    (acc[u.file] = acc[u.file] || []).push(u);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Radio className={`text-purple-400 ${liveMode ? 'animate-pulse' : ''}`} /> Canlı İşbirliği
            </h1>
            <p className="text-sm text-muted-foreground">
              {users.length} kişi bu projede çalışıyor —{' '}
              <span className="text-purple-400 font-medium">
                {activeProject?.name || 'Aktif proje'}
              </span>
            </p>
          </div>
          <Button
            variant={liveMode ? 'destructive' : 'default'}
            onClick={toggleLive}
          >
            {liveMode ? (
              <><CircleDot size={14} className="mr-1 animate-pulse" /> Canlı Mod Açık</>
            ) : (
              <><Zap size={14} className="mr-1" /> Canlı Düzenleme Başlat</>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cursor canvas */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MousePointer2 size={16} className="text-purple-400" /> Cursor Takibi
              </CardTitle>
              <CardDescription className="text-xs">
                {liveMode ? 'Gerçek zamanlı konumlar güncelleniyor' : 'Canlı mod kapalı — başlatmak için yukarıdaki butona tıkla'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-[#0d0d0d] border border-border rounded-lg overflow-hidden bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:20px_20px]">
                {/* Mock code lines */}
                <div className="absolute inset-0 p-4 space-y-1 opacity-30 pointer-events-none">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="h-3 bg-white/5 rounded" style={{ width: `${30 + Math.random() * 60}%` }} />
                  ))}
                </div>
                {/* Cursors */}
                <AnimatePresence>
                  {users.map((u) => (
                    <motion.div
                      key={u.id}
                      className="absolute pointer-events-none z-10"
                      animate={{ left: `${u.cursor.x}%`, top: `${u.cursor.y}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={u.color} className="drop-shadow-lg">
                        <path d="M5.5 3.21L18.5 10.7l-5.51 1.45L9.74 18z" stroke="#000" strokeWidth="0.5" />
                      </svg>
                      <div
                        className="absolute top-4 left-3 px-1.5 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap"
                        style={{ background: u.color }}
                      >
                        {u.name}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!liveMode && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Radio size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Canlı mod kapalı</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active users + activity feed */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users size={16} className="text-green-400" /> Aktif Kullanıcılar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <div className="relative">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback
                          className="text-[10px] text-white"
                          style={{ background: u.color }}
                        >
                          {u.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{u.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{u.action} • {u.file.split('/').pop()}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: u.color }} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity size={16} className="text-blue-400" /> Aktivite Akışı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-72 overflow-auto">
                {activity.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 text-xs"
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.color }} />
                    <div className="flex-1">
                      <span className="font-medium" style={{ color: a.color }}>{a.user}</span>{' '}
                      <span className="text-muted-foreground">{a.action}</span>{' '}
                      <code className="text-blue-400 text-[10px]">{a.target}</code>
                      <div className="text-[10px] text-muted-foreground">{a.time}</div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Files being worked on */}
        <Card className="mt-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileCode2 size={16} className="text-amber-400" /> Üzerinde Çalışılan Dosyalar
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(fileGroups).map(([file, fileUsers]) => (
              <div key={file} className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <FileCode2 size={14} className="text-amber-400" />
                  <code className="text-xs text-amber-300 truncate">{file.split('/').pop()}</code>
                </div>
                <div className="flex items-center gap-1">
                  {fileUsers.map((u) => (
                    <div
                      key={u.id}
                      className="w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: u.color }}
                      title={u.name}
                    >
                      {u.name[0]}
                    </div>
                  ))}
                  <Badge variant="secondary" className="text-[9px] ml-1">
                    {fileUsers.length} kişi
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
