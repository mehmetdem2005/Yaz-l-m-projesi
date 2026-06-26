'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ScrollText,
  Search,
  Download,
  ShieldCheck,
  ShieldX,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

type LogStatus = 'success' | 'failed' | 'warning';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  status: LogStatus;
}

const ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'CREATE_PROJECT',
  'DELETE_PROJECT',
  'UPDATE_FILE',
  'RUN_AGENT',
  'EXPORT_REPORT',
  'INVITE_USER',
  'CHANGE_ROLE',
  'API_KEY_ROTATE',
  'POLICY_UPDATE',
  'DELETE_USER',
];

const USERS = ['ahmet.yilmaz', 'meryem.demir', 'can.ozkan', 'selin.aydin', 'burak.kaya', 'system', 'admin'];
const RESOURCES = ['project:42', 'project:13', 'user:8', 'policy:ISO27001', 'agent:react-v1', 'file:auth.ts', 'apikey:deepseek', 'role:editor'];
const IPS = ['85.34.21.10', '78.142.223.5', '192.168.1.1', '212.252.10.77', '176.40.88.122', '10.0.0.5'];

function genLogs(n: number): AuditLog[] {
  const logs: AuditLog[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const ts = new Date(now - i * 1000 * 60 * Math.floor(Math.random() * 47 + 3));
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const failProb = ['LOGIN', 'DELETE_USER', 'CHANGE_ROLE', 'API_KEY_ROTATE'].includes(action) ? 0.3 : 0.1;
    const warnProb = 0.05;
    const roll = Math.random();
    const status: LogStatus = roll < warnProb ? 'warning' : roll < warnProb + failProb ? 'failed' : 'success';
    logs.push({
      id: `log_${i}_${ts.getTime()}`,
      timestamp: ts.toISOString(),
      user: USERS[Math.floor(Math.random() * USERS.length)],
      action,
      resource: RESOURCES[Math.floor(Math.random() * RESOURCES.length)],
      ip: IPS[Math.floor(Math.random() * IPS.length)],
      status,
    });
  }
  return logs;
}

const ALL_LOGS = genLogs(24);

const STATUS_META: Record<LogStatus, { color: string; label: string; icon: typeof ShieldCheck }> = {
  success: { color: '#10b981', label: 'Başarılı', icon: ShieldCheck },
  failed: { color: '#ef4444', label: 'Başarısız', icon: ShieldX },
  warning: { color: '#f59e0b', label: 'Uyarı', icon: Filter },
};

export function AuditLogView() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  void useStore((s) => s.activeView);

  const filtered = useMemo(() => {
    return ALL_LOGS.filter((l) => {
      if (actionFilter !== 'all' && l.action !== actionFilter) return false;
      if (userFilter !== 'all' && l.user !== userFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${l.user} ${l.action} ${l.resource} ${l.ip}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (dateFrom) {
        if (new Date(l.timestamp) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        if (new Date(l.timestamp) > new Date(dateTo + 'T23:59:59')) return false;
      }
      return true;
    });
  }, [search, actionFilter, userFilter, dateFrom, dateTo]);

  const handleExport = () => {
    const header = 'timestamp,user,action,resource,ip,status\n';
    const rows = filtered
      .map((l) => `${l.timestamp},${l.user},${l.action},${l.resource},${l.ip},${l.status}`)
      .join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} kayıt CSV olarak dışa aktarıldı`);
  };

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ScrollText className="text-purple-400" /> Audit Log
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistem aktivite kayıtları — kim, ne zaman, ne yaptı
            </p>
          </div>
          <Button onClick={handleExport} disabled={filtered.length === 0}>
            <Download size={14} className="mr-1" /> CSV Dışa Aktar
          </Button>
        </div>

        {/* Filtreler */}
        <Card className="bg-card border-border mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter size={14} /> Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative md:col-span-2">
                <Search size={14} className="absolute left-2 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Kullanıcı, aksiyon, kaynak, IP ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Aksiyon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Aksiyonlar</SelectItem>
                  {ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Kullanıcı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                  {USERS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 text-xs"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tablo */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Kayıtlar ({filtered.length})</CardTitle>
              <div className="flex gap-2">
                {filtered.filter((l) => l.status === 'success').length > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-green-500/20 text-green-300">
                    {filtered.filter((l) => l.status === 'success').length} Başarılı
                  </Badge>
                )}
                {filtered.filter((l) => l.status === 'failed').length > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-red-500/20 text-red-300">
                    {filtered.filter((l) => l.status === 'failed').length} Başarısız
                  </Badge>
                )}
                {filtered.filter((l) => l.status === 'warning').length > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-amber-500/20 text-amber-300">
                    {filtered.filter((l) => l.status === 'warning').length} Uyarı
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Filtre ile eşleşen kayıt bulunamadı</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left border-b border-border text-muted-foreground">
                      <th className="py-2 pr-3">Zaman</th>
                      <th className="py-2 pr-3">Kullanıcı</th>
                      <th className="py-2 pr-3">Aksiyon</th>
                      <th className="py-2 pr-3">Kaynak</th>
                      <th className="py-2 pr-3">IP</th>
                      <th className="py-2 pr-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => {
                      const meta = STATUS_META[l.status];
                      const Icon = meta.icon;
                      return (
                        <tr key={l.id} className="border-b border-border/40 hover:bg-muted/20">
                          <td className="py-2 pr-3 font-mono text-[10px] whitespace-nowrap">
                            {new Date(l.timestamp).toLocaleString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-2 pr-3 font-medium">{l.user}</td>
                          <td className="py-2 pr-3">
                            <Badge variant="outline" className="text-[9px] font-mono">{l.action}</Badge>
                          </td>
                          <td className="py-2 pr-3 font-mono text-[10px] text-muted-foreground">{l.resource}</td>
                          <td className="py-2 pr-3 font-mono text-[10px]">{l.ip}</td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-1" style={{ color: meta.color }}>
                              <Icon size={12} />
                              <span className="text-[10px]">{meta.label}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
