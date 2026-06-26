'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Clock,
  Plus,
  Play,
  Pause,
  Trash2,
  Timer,
  Calendar,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type JobStatus = 'active' | 'paused' | 'error';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  command: string;
  status: JobStatus;
  lastRun: string;
  nextRun: string;
  duration: number;
}

interface Execution {
  id: string;
  jobId: string;
  jobName: string;
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  duration: number;
}

const INITIAL_JOBS: CronJob[] = [
  { id: '1', name: 'Veritabanı Yedeği', schedule: '0 3 * * *', command: 'pg_dump db > backup.sql', status: 'active', lastRun: 'Bugün 03:00', nextRun: 'Yarın 03:00', duration: 45 },
  { id: '2', name: 'Log Temizliği', schedule: '0 * * * *', command: 'rm -f /var/log/*.old', status: 'active', lastRun: '1 saat önce', nextRun: 'Bir sonraki saat', duration: 2 },
  { id: '3', name: 'Health Check', schedule: '*/5 * * * *', command: 'curl https://api/health', status: 'active', lastRun: '3 dk önce', nextRun: '2 dk sonra', duration: 1 },
  { id: '4', name: 'Mail Kuyruğu', schedule: '*/15 * * * *', command: 'node send-mails.js', status: 'paused', lastRun: '2 saat önce', nextRun: '—', duration: 18 },
  { id: '5', name: 'Analytics Raporu', schedule: '0 9 * * 1', command: 'node weekly-report.js', status: 'error', lastRun: 'Pzt 09:00', nextRun: 'Önümüzdeki Pzt', duration: 120 },
  { id: '6', name: 'Cache Temizleme', schedule: '0 0 * * *', command: 'redis-cli flushdb', status: 'active', lastRun: 'Bugün 00:00', nextRun: 'Yarın 00:00', duration: 5 },
];

const INITIAL_EXECUTIONS: Execution[] = [
  { id: '1', jobId: '3', jobName: 'Health Check', status: 'success', startedAt: '3 dk önce', duration: 1 },
  { id: '2', jobId: '2', jobName: 'Log Temizliği', status: 'success', startedAt: '1 saat önce', duration: 2 },
  { id: '3', jobId: '1', jobName: 'Veritabanı Yedeği', status: 'success', startedAt: 'Bugün 03:00', duration: 45 },
  { id: '4', jobId: '5', jobName: 'Analytics Raporu', status: 'failed', startedAt: 'Pzt 09:00', duration: 120 },
  { id: '5', jobId: '6', jobName: 'Cache Temizleme', status: 'success', startedAt: 'Bugün 00:00', duration: 5 },
];

const PRESETS = [
  { label: 'Her 5 dk', value: '*/5 * * * *' },
  { label: 'Her 15 dk', value: '*/15 * * * *' },
  { label: 'Her saat', value: '0 * * * *' },
  { label: 'Her gün 09:00', value: '0 9 * * *' },
  { label: 'Her gün 03:00', value: '0 3 * * *' },
  { label: 'Her Pzt 09:00', value: '0 9 * * 1' },
  { label: 'Ay başı', value: '0 0 1 * *' },
];

export function CronJobsView() {
  const [jobs, setJobs] = useState<CronJob[]>(INITIAL_JOBS);
  const [executions, setExecutions] = useState<Execution[]>(INITIAL_EXECUTIONS);
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('*/5 * * * *');
  const [command, setCommand] = useState('');

  const handleAdd = () => {
    if (!name || !command) {
      toast.error('İsim ve komut gerekli');
      return;
    }
    const newJob: CronJob = {
      id: Date.now().toString(),
      name,
      schedule,
      command,
      status: 'active',
      lastRun: 'henüz çalışmadı',
      nextRun: 'bir sonraki periyot',
      duration: 0,
    };
    setJobs([...jobs, newJob]);
    toast.success('Job eklendi');
    setName('');
    setSchedule('*/5 * * * *');
    setCommand('');
    setOpen(false);
  };

  const handleRun = (id: string) => {
    setRunning(id);
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    const exec: Execution = {
      id: Date.now().toString(),
      jobId: id,
      jobName: job.name,
      status: 'running',
      startedAt: 'az önce',
      duration: 0,
    };
    setExecutions([exec, ...executions].slice(0, 5));
    setTimeout(() => {
      const success = Math.random() > 0.15;
      setExecutions((prev) =>
        prev.map((e) =>
          e.id === exec.id
            ? { ...e, status: success ? 'success' : 'failed', duration: Math.floor(Math.random() * 30) + 1 }
            : e
        )
      );
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, lastRun: 'az önce', duration: Math.floor(Math.random() * 30) + 1 } : j
        )
      );
      setRunning(null);
      toast[success ? 'success' : 'error'](
        success ? `${job.name} tamamlandı` : `${job.name} başarısız`
      );
    }, 1500);
  };

  const togglePause = (id: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: j.status === 'paused' ? 'active' : 'paused' }
          : j
      )
    );
  };

  const handleDelete = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
    toast.success('Job silindi');
  };

  const statusMeta: Record<JobStatus, { label: string; color: 'default' | 'secondary' | 'destructive'; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
    active: { label: 'Aktif', color: 'default', icon: CheckCircle2 },
    paused: { label: 'Duraklatıldı', color: 'secondary', icon: Pause },
    error: { label: 'Hata', color: 'destructive', icon: AlertCircle },
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="text-blue-400" /> Zamanlanmış Görevler
            </h1>
            <p className="text-sm text-muted-foreground">
              {jobs.filter((j) => j.status === 'active').length} aktif / {jobs.length} toplam job
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus size={14} className="mr-1" /> Yeni Job</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Yeni Zamanlanmış Görev</DialogTitle>
                <DialogDescription>Cron expression ile çalışma planı</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label className="text-xs">İsim</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Veritabanı Yedeği" className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Cron Expression</Label>
                  <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="*/5 * * * *" className="text-sm font-mono" />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {PRESETS.map((p) => (
                      <Button
                        key={p.value}
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px]"
                        onClick={() => setSchedule(p.value)}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Komut</Label>
                  <Textarea value={command} onChange={(e) => setCommand(e.target.value)} placeholder="node backup.js" rows={2} className="text-sm font-mono" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
                <Button onClick={handleAdd}>Ekle</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Job list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
          {jobs.map((job, i) => {
            const meta = statusMeta[job.status];
            const StatusIcon = meta.icon;
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="bg-card border-border group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Timer size={14} className="text-blue-400 shrink-0" />
                          <span className="font-medium text-sm truncate">{job.name}</span>
                        </div>
                        <code className="text-[11px] text-muted-foreground font-mono block truncate">{job.command}</code>
                      </div>
                      <Badge variant={meta.color} className="text-[9px] ml-2 shrink-0">
                        <StatusIcon size={9} className="mr-0.5" /> {meta.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                      <div className="p-2 rounded bg-white/5">
                        <div className="text-muted-foreground flex items-center gap-1"><Calendar size={10} /> Çalışma</div>
                        <code className="text-blue-400 text-[10px]">{job.schedule}</code>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <div className="text-muted-foreground flex items-center gap-1"><Clock size={10} /> Süre</div>
                        <span className="text-green-400">{job.duration}s</span>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <div className="text-muted-foreground text-[9px]">Son Çalışma</div>
                        <span>{job.lastRun}</span>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <div className="text-muted-foreground text-[9px]">Sonraki</div>
                        <span className="text-amber-300">{job.nextRun}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs flex-1"
                        disabled={running === job.id}
                        onClick={() => handleRun(job.id)}
                      >
                        {running === job.id ? (
                          <><RefreshCw size={11} className="mr-1 animate-spin" /> Çalışıyor...</>
                        ) : (
                          <><Play size={11} className="mr-1" /> Çalıştır</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => togglePause(job.id)}
                        title={job.status === 'paused' ? 'Devam et' : 'Duraklat'}
                      >
                        {job.status === 'paused' ? <Play size={12} /> : <Pause size={12} />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Execution history */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw size={16} className="text-purple-400" /> Çalıştırma Geçmişi
            </CardTitle>
            <CardDescription className="text-xs">Son {executions.length} çalıştırma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {executions.map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-2 rounded text-xs hover:bg-white/5">
                  {e.status === 'success' ? (
                    <CheckCircle2 size={14} className="text-green-400" />
                  ) : e.status === 'failed' ? (
                    <XCircle size={14} className="text-red-400" />
                  ) : (
                    <RefreshCw size={14} className="text-blue-400 animate-spin" />
                  )}
                  <span className="font-medium flex-1">{e.jobName}</span>
                  <Badge variant="outline" className="text-[9px]">{e.status}</Badge>
                  <span className="text-muted-foreground w-20 text-right">{e.startedAt}</span>
                  <span className="text-muted-foreground font-mono w-12 text-right">{e.duration}s</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
