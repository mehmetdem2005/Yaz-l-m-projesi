'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Play,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  FlaskConical,
  Clock,
  FileCode,
} from 'lucide-react';
import { toast } from 'sonner';

type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'skipped';

interface TestCase {
  id: string;
  name: string;
  status: TestStatus;
  duration?: number;
  error?: string;
}

interface TestSuite {
  id: string;
  name: string;
  file: string;
  tests: TestCase[];
  coverage: number;
}

const INITIAL_SUITES: TestSuite[] = [
  {
    id: 's1',
    name: 'Auth Service',
    file: 'src/lib/auth.test.ts',
    coverage: 87,
    tests: [
      { id: 't1', name: 'should hash password with bcrypt', status: 'idle' },
      { id: 't2', name: 'should verify valid JWT token', status: 'idle' },
      { id: 't3', name: 'should reject expired token', status: 'idle' },
      { id: 't4', name: 'should throw on invalid credentials', status: 'idle' },
      { id: 't5', name: 'should refresh token pair', status: 'idle' },
    ],
  },
  {
    id: 's2',
    name: 'User Repository',
    file: 'src/lib/user.repo.test.ts',
    coverage: 72,
    tests: [
      { id: 't6', name: 'should create new user', status: 'idle' },
      { id: 't7', name: 'should find by email', status: 'idle' },
      { id: 't8', name: 'should paginate results', status: 'idle' },
      { id: 't9', name: 'should handle unique constraint', status: 'idle' },
    ],
  },
  {
    id: 's3',
    name: 'Policy Engine',
    file: 'src/lib/policy.test.ts',
    coverage: 91,
    tests: [
      { id: 't10', name: 'should evaluate TOGAF rules', status: 'idle' },
      { id: 't11', name: 'should apply ISO 27001 controls', status: 'idle' },
      { id: 't12', name: 'should validate OWASP Top 10', status: 'idle' },
      { id: 't13', name: 'should skip unknown standard', status: 'idle' },
    ],
  },
  {
    id: 's4',
    name: 'Agent Runtime',
    file: 'src/lib/agent.test.ts',
    coverage: 65,
    tests: [
      { id: 't14', name: 'should execute ReAct loop', status: 'idle' },
      { id: 't15', name: 'should call tool with args', status: 'idle' },
      { id: 't16', name: 'should preserve memory', status: 'idle' },
      { id: 't17', name: 'should fail on invalid tool schema', status: 'idle' },
    ],
  },
  {
    id: 's5',
    name: 'API Routes',
    file: 'src/app/api/health.test.ts',
    coverage: 80,
    tests: [
      { id: 't18', name: 'GET /api/health returns 200', status: 'idle' },
      { id: 't19', name: 'POST /api/auth requires body', status: 'idle' },
      { id: 't20', name: 'rate limit blocks after 100 req', status: 'idle' },
    ],
  },
];

const STATUS_STYLE: Record<TestStatus, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  idle: { color: '#6b7280', label: 'Bekliyor', icon: MinusCircle },
  running: { color: '#3b82f6', label: 'Çalışıyor', icon: Loader2 },
  passed: { color: '#10b981', label: 'Geçti', icon: CheckCircle2 },
  failed: { color: '#ef4444', label: 'Başarısız', icon: XCircle },
  skipped: { color: '#f59e0b', label: 'Atlandı', icon: MinusCircle },
};

export function TestRunnerView() {
  const [suites, setSuites] = useState<TestSuite[]>(INITIAL_SUITES);
  const [running, setRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(INITIAL_SUITES[0].id);
  const toastFn = useStore((s) => s.setView);
  void toastFn;

  const runAll = async () => {
    setRunning(true);
    // Önce tüm testleri idle → running
    setSuites((prev) =>
      prev.map((s) => ({
        ...s,
        tests: s.tests.map((t) => ({ ...t, status: 'running' as TestStatus, error: undefined, duration: undefined })),
      }))
    );

    // Simüle sıralı çalıştırma
    for (const suite of INITIAL_SUITES) {
      for (const t of suite.tests) {
        await new Promise((r) => setTimeout(r, 120));
        // %85 pass, %10 fail, %5 skip
        const roll = Math.random();
        const status: TestStatus = roll < 0.05 ? 'skipped' : roll < 0.15 ? 'failed' : 'passed';
        const error = status === 'failed' ? genError(t.name) : undefined;
        const duration = 5 + Math.round(Math.random() * 60);

        setSuites((prev) =>
          prev.map((s) =>
            s.id === suite.id
              ? { ...s, tests: s.tests.map((x) => (x.id === t.id ? { ...x, status, error, duration } : x)) }
              : s
          )
        );
      }
    }
    setRunning(false);
    toast.success('Test koşusuu tamamlandı');
  };

  const stats = suites.reduce(
    (acc, s) => {
      s.tests.forEach((t) => {
        if (t.status === 'passed') acc.pass++;
        else if (t.status === 'failed') acc.fail++;
        else if (t.status === 'skipped') acc.skip++;
        else acc.idle++;
      });
      return acc;
    },
    { pass: 0, fail: 0, skip: 0, idle: 0 }
  );

  const total = stats.pass + stats.fail + stats.skip + stats.idle;
  const passRate = total > 0 ? Math.round((stats.pass / total) * 100) : 0;
  const avgCoverage = Math.round(suites.reduce((s, x) => s + x.coverage, 0) / suites.length);

  const currentSuite = suites.find((s) => s.id === selectedSuite) || null;

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FlaskConical className="text-green-400" /> Test Runner
            </h1>
            <p className="text-sm text-muted-foreground">
              Unit test suites — simüle test çalıştırma (frontend-only)
            </p>
          </div>
          <Button onClick={runAll} disabled={running}>
            {running ? <Loader2 size={14} className="animate-spin mr-1" /> : <Play size={14} className="mr-1" />}
            {running ? 'Çalışıyor...' : 'Tümünü Çalıştır'}
          </Button>
        </div>

        {/* Özet kartlar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-xs text-muted-foreground">Geçti</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{stats.pass}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <XCircle size={16} className="text-red-400" />
                <span className="text-xs text-muted-foreground">Başarısız</span>
              </div>
              <div className="text-2xl font-bold text-red-400">{stats.fail}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <MinusCircle size={16} className="text-amber-400" />
                <span className="text-xs text-muted-foreground">Atlandı</span>
              </div>
              <div className="text-2xl font-bold text-amber-400">{stats.skip}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical size={16} className="text-blue-400" />
                <span className="text-xs text-muted-foreground">Pass Rate</span>
              </div>
              <div className="text-2xl font-bold">{passRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Coverage */}
        <Card className="bg-card border-border mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ortalama Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress value={avgCoverage} className="flex-1 h-3" />
              <span className="text-sm font-mono w-12 text-right">{avgCoverage}%</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Suites sidebar */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Test Suites ({suites.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 max-h-[500px] overflow-auto">
              {suites.map((s) => {
                const pass = s.tests.filter((t) => t.status === 'passed').length;
                const fail = s.tests.filter((t) => t.status === 'failed').length;
                const isActive = s.id === selectedSuite;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSuite(s.id)}
                    className={`w-full text-left p-2 rounded border transition-colors ${
                      isActive
                        ? 'border-blue-500/40 bg-blue-500/10'
                        : 'border-border hover:border-border/80 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate">{s.file}</div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex gap-1">
                          {pass > 0 && <Badge variant="secondary" className="text-[9px] bg-green-500/20 text-green-300">{pass}</Badge>}
                          {fail > 0 && <Badge variant="secondary" className="text-[9px] bg-red-500/20 text-red-300">{fail}</Badge>}
                        </div>
                        <span className="text-[9px] text-muted-foreground">{s.coverage}% cov</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Detay */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCode size={14} />
                {currentSuite ? currentSuite.name : 'Suite seçin'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!currentSuite ? (
                <div className="py-8 text-center text-muted-foreground text-sm">Detay için suite seçin</div>
              ) : (
                <div className="space-y-2">
                  {currentSuite.tests.map((t) => {
                    const st = STATUS_STYLE[t.status];
                    const Icon = st.icon;
                    return (
                      <div
                        key={t.id}
                        className="flex items-start gap-2 p-2 rounded border border-border/60"
                        style={{ background: `${st.color}08` }}
                      >
                        <Icon
                          size={16}
                          style={{ color: st.color }}
                          className={`mt-0.5 flex-shrink-0 ${t.status === 'running' ? 'animate-spin' : ''}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm truncate">{t.name}</span>
                            {t.duration !== undefined && (
                              <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                <Clock size={10} /> {t.duration}ms
                              </span>
                            )}
                          </div>
                          {t.error && (
                            <pre className="mt-1 bg-red-500/5 border border-red-500/20 p-2 rounded text-[10px] font-mono text-red-300 overflow-auto">
                              {t.error}
                            </pre>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function genError(testName: string): string {
  const errors = [
    `AssertionError: expected 200 to equal 201\n  at ${testName} (src/test.ts:42:14)`,
    `TypeError: Cannot read property 'id' of undefined\n  at Object.<anonymous> (src/lib/auth.ts:18:22)`,
    `Error: expected promise to be resolved but got rejected\n  TimeoutError: 5000ms exceeded`,
    `AssertionError: expected array length 3 to equal 4\n  at ${testName} (src/test.ts:67:9)`,
  ];
  return errors[Math.floor(Math.random() * errors.length)];
}
