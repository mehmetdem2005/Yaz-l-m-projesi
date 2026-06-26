'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  KeyRound,
  Scan,
  Download,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { toast } from 'sonner';

type Severity = 'critical' | 'high' | 'medium' | 'low';

interface Finding {
  id: string;
  severity: Severity;
  line: number;
  type: string;
  match: string;
  recommendation: string;
}

const PATTERNS: Array<{ type: string; regex: RegExp; severity: Severity; recommendation: string }> = [
  {
    type: 'Stripe API Key',
    regex: /sk_(live|test)_[a-zA-Z0-9]{20,}/g,
    severity: 'critical',
    recommendation: 'Stripe anahtarını environment variable olarak saklayın (.env.local) ve production secrets manager kullanın.',
  },
  {
    type: 'GitHub Personal Access Token',
    regex: /ghp_[a-zA-Z0-9]{36,}/g,
    severity: 'critical',
    recommendation: 'Token\'ı hemen revoke edin, GitHub Actions secrets veya vault kullanın.',
  },
  {
    type: 'AWS Access Key ID',
    regex: /AKIA[0-9A-Z]{16}/g,
    severity: 'critical',
    recommendation: 'AWS IAM rolü veya STS temporary credentials kullanın.',
  },
  {
    type: 'JWT Token',
    regex: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
    severity: 'high',
    recommendation: 'JWT\'yi kodda tutmayın, httpOnly cookie + short TTL kullanın.',
  },
  {
    type: 'Private Key (PEM)',
    regex: /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/g,
    severity: 'critical',
    recommendation: 'Private key dosyayı codebase\'ten kaldırın, secrets manager (Vault/AWS SM) kullanın.',
  },
  {
    type: 'Hardcoded Password',
    regex: /(password|passwd|pwd|secret|api_key|apikey|token)\s*[=:]\s*["'][^"'\s]{8,}["']/gi,
    severity: 'high',
    recommendation: 'Hardcoded kimlik bilgisi yerine process.env veya secrets manager kullanın.',
  },
  {
    type: 'Connection String',
    regex: /(mongodb|postgres|postgresql|mysql|redis|amqp):\/\/[^:\s]+:[^@\s]+@[^\s/$?]+/gi,
    severity: 'high',
    recommendation: 'Bağlantı string\'ini env var\'a taşıyın, parola kısmını ${DB_PASSWORD} ile değiştirin.',
  },
  {
    type: 'Slack Token',
    regex: /xox[baprs]-[a-zA-Z0-9-]{10,}/g,
    severity: 'high',
    recommendation: 'Slack token\'ı revoke edin, Slack app credentials env var\'a taşıyın.',
  },
  {
    type: 'Google API Key',
    regex: /AIza[0-9A-Za-z_\-]{35}/g,
    severity: 'medium',
    recommendation: 'API key\'i restrict edin (HTTP referrer / IP) ve env var\'a taşıyın.',
  },
];

const SEV_COLOR: Record<Severity, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#0891b2',
};

const SEV_LABEL: Record<Severity, string> = {
  critical: 'Kritik',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
};

const SAMPLE_CODE = `// Örnek: hardcoded credential riskli kod
const API_KEY = "sk_live_XXXX_DEMO_KEY_XXXX";
const githubToken = "ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcd";
const awsKey = "AKIAIOSFODNN7EXAMPLE";

const dbUrl = "mongodb://admin:DEMO_PASSWORD@cluster0.mongodb.net/db";
const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const password = "MyP@ssw0rd2024";

function connect() {
  const privateKey = \`-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...\`;
  return fetch("https://api.example.com", {
    headers: { Authorization: \`Bearer \${API_KEY}\` }
  });
}`;

export function SecretScannerView() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [scanning, setScanning] = useState(false);
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const files = useStore((s) => s.files);
  const activeFilePath = useStore((s) => s.activeFilePath);

  const handleScan = () => {
    if (!code.trim()) {
      toast.error('Taranacak kod girin');
      return;
    }
    setScanning(true);
    setFindings(null);
    setTimeout(() => {
      const results: Finding[] = [];
      const lines = code.split('\n');
      lines.forEach((line, idx) => {
        PATTERNS.forEach((p) => {
          const re = new RegExp(p.regex.source, p.regex.flags);
          let m: RegExpExecArray | null;
          while ((m = re.exec(line)) !== null) {
            results.push({
              id: `${p.type}_${idx}_${m.index}`,
              severity: p.severity,
              line: idx + 1,
              type: p.type,
              match: maskSecret(m[0]),
              recommendation: p.recommendation,
            });
          }
        });
      });
      setFindings(results);
      setScanning(false);
      toast.success(`Tarama tamamlandı: ${results.length} bulgu`);
    }, 600);
  };

  const handleExport = () => {
    if (!findings) return;
    const date = new Date().toLocaleString('tr-TR');
    const report = `# Secret Scanner Raporu

**Tarih:** ${date}
**Toplam Satır:** ${code.split('\n').length}
**Toplam Bulgu:** ${findings.length}

## Özet

- Kritik: ${findings.filter((f) => f.severity === 'critical').length}
- Yüksek: ${findings.filter((f) => f.severity === 'high').length}
- Orta: ${findings.filter((f) => f.severity === 'medium').length}
- Düşük: ${findings.filter((f) => f.severity === 'low').length}

## Bulgular

${findings
  .map(
    (f, i) => `### ${i + 1}. ${f.type}
- **Severity:** ${SEV_LABEL[f.severity].toUpperCase()}
- **Satır:** ${f.line}
- **Eşleşme:** \`${f.match}\`
- **Öneri:** ${f.recommendation}
`
  )
  .join('\n')}
`;
    download(report, `secret-scan-${Date.now()}.md`, 'text/markdown');
    toast.success('Rapor indirildi');
  };

  const filtered = findings?.filter((f) => filter === 'all' || f.severity === filter) || [];

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <KeyRound className="text-amber-400" /> Secret Scanner
            </h1>
            <p className="text-sm text-muted-foreground">
              Hardcoded credential & secret dedektörü (API key, JWT, private key, connection string)
            </p>
          </div>
          <div className="flex gap-2">
            {activeFilePath && (
              <Button
                variant="outline"
                onClick={() => {
                  const f = files.find((x) => x.path === activeFilePath);
                  if (f) {
                    setCode(f.content);
                    toast.success('Aktif dosya yüklendi');
                  }
                }}
              >
                <FileCode size={14} className="mr-1" /> Aktif Dosya
              </Button>
            )}
            <Button variant="outline" onClick={handleExport} disabled={!findings}>
              <Download size={14} className="mr-1" /> Rapor
            </Button>
            <Button onClick={handleScan} disabled={scanning}>
              {scanning ? <Loader2 size={14} className="animate-spin mr-1" /> : <Scan size={14} className="mr-1" />}
              Tara
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCode size={14} /> Kod Girişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Taranacak kodu yapıştırın..."
                rows={18}
                className="font-mono text-xs bg-[#1e1e1e] resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {code.split('\n').length} satır · {code.length} karakter
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert size={14} /> Özet
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scanning ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-amber-400" size={32} />
                </div>
              ) : findings ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {(['critical', 'high', 'medium', 'low'] as Severity[]).map((sev) => {
                      const count = findings.filter((f) => f.severity === sev).length;
                      return (
                        <div
                          key={sev}
                          className="text-center p-2 rounded border"
                          style={{ borderColor: `${SEV_COLOR[sev]}40` }}
                        >
                          <div className="text-xl font-bold" style={{ color: SEV_COLOR[sev] }}>
                            {count}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{SEV_LABEL[sev]}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    Toplam <span className="font-bold text-foreground">{findings.length}</span> bulgu tespit edildi
                  </div>
                  {findings.length === 0 && (
                    <div className="text-center py-4">
                      <CheckCircle2 size={36} className="mx-auto mb-2 text-green-400" />
                      <p className="text-sm text-green-300">Secret bulunamadı ✓</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <KeyRound size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Tarama için "Tara" butonuna basın</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {findings && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Bulgular ({filtered.length})</CardTitle>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">Tümü</SelectItem>
                    <SelectItem value="critical" className="text-xs">Kritik</SelectItem>
                    <SelectItem value="high" className="text-xs">Yüksek</SelectItem>
                    <SelectItem value="medium" className="text-xs">Orta</SelectItem>
                    <SelectItem value="low" className="text-xs">Düşük</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Bu severity'de bulgu yok</div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((f) => (
                    <div
                      key={f.id}
                      className="border rounded p-3"
                      style={{ borderColor: `${SEV_COLOR[f.severity]}30`, background: `${SEV_COLOR[f.severity]}05` }}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[9px]"
                          style={{ color: SEV_COLOR[f.severity], borderColor: SEV_COLOR[f.severity] }}
                        >
                          {SEV_LABEL[f.severity]}
                        </Badge>
                        <span className="text-sm font-medium">{f.type}</span>
                        <Badge variant="secondary" className="text-[9px]">Satır {f.line}</Badge>
                      </div>
                      <pre className="bg-[#1e1e1e] border border-border p-2 rounded text-[10px] font-mono mb-2 overflow-auto">
                        {f.match}
                      </pre>
                      <div className="bg-green-500/5 border border-green-500/20 rounded p-2">
                        <div className="text-[10px] text-green-400 font-semibold mb-0.5">Öneri:</div>
                        <p className="text-xs text-green-300">{f.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function maskSecret(s: string): string {
  if (s.length <= 12) return '***REDACTED***';
  return `${s.slice(0, 6)}...${s.slice(-4)} (${s.length} karakter)`;
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
