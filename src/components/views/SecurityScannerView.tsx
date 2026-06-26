'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Scan,
  Loader2,
  Bug,
  Lock,
  AlertTriangle,
  FileCode,
  CheckCircle2,
  XCircle,
  Download,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Vulnerability {
  id: string;
  cwe: string;
  owasp: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file?: string;
  line?: number;
  codeSnippet?: string;
  recommendation: string;
  cvss?: number;
}

interface ScanResult {
  vulnerabilities: Vulnerability[];
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  owaspCompliance: Array<{ category: string; status: 'compliant' | 'risk'; detail: string }>;
  score: number;
}

const SEVERITY_CONFIG = {
  critical: { color: '#dc2626', label: 'Kritik', icon: ShieldX },
  high: { color: '#ea580c', label: 'Yüksek', icon: ShieldAlert },
  medium: { color: '#ca8a04', label: 'Orta', icon: AlertTriangle },
  low: { color: '#0891b2', label: 'Düşük', icon: Shield },
  info: { color: '#64748b', label: 'Bilgi', icon: ShieldCheck },
};

export function SecurityScannerView() {
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [language, setLanguage] = useState('typescript');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const files = useStore((s) => s.files);
  const activeFilePath = useStore((s) => s.activeFilePath);

  useEffect(() => {
    // Eğer aktif dosya varsa, otomatik yükle
    if (activeFilePath) {
      const file = files.find((f) => f.path === activeFilePath);
      if (file) {
        setCode(file.content);
        setLanguage(file.language || 'typescript');
      }
    }
  }, [activeFilePath, files]);

  const handleScan = async () => {
    if (!code.trim()) {
      toast.error('Taranacak kod girin');
      return;
    }
    setScanning(true);
    setResult(null);

    try {
      // Local rule-based scan (instant)
      const localFindings = localSecurityScan(code, language);

      // AI-powered deep scan (if API key)
      const aiFindings = await aiSecurityScan(code, language);

      const all = [...localFindings, ...aiFindings];

      // Stats
      const stats = {
        critical: all.filter((v) => v.severity === 'critical').length,
        high: all.filter((v) => v.severity === 'high').length,
        medium: all.filter((v) => v.severity === 'medium').length,
        low: all.filter((v) => v.severity === 'low').length,
        info: all.filter((v) => v.severity === 'info').length,
        total: all.length,
      };

      // OWASP compliance
      const owaspCompliance = generateOwaspCompliance(all);

      // Score (100 - weighted vulnerabilities)
      const score = Math.max(
        0,
        100 - stats.critical * 20 - stats.high * 10 - stats.medium * 5 - stats.low * 2
      );

      setResult({ vulnerabilities: all, stats, owaspCompliance, score });
      toast.success(`Tarama tamamlandı: ${all.length} bulgu`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setScanning(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const report = generateReport(result, code, language);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-scan-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Rapor indirildi');
  };

  const filteredVulns = result?.vulnerabilities.filter(
    (v) => filterSeverity === 'all' || v.severity === filterSeverity
  ) || [];

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="text-red-400" /> Security Scanner
            </h1>
            <p className="text-sm text-muted-foreground">
              OWASP Top 10 + CWE + AI-powered zafiyet tespiti
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!result}>
              <Download size={14} className="mr-1" /> Rapor
            </Button>
            <Button onClick={handleScan} disabled={scanning}>
              {scanning ? <Loader2 size={14} className="animate-spin mr-1" /> : <Scan size={14} className="mr-1" />}
              Tara
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Code input */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileCode size={14} /> Kod
                </CardTitle>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['typescript', 'javascript', 'python', 'php', 'java', 'go', 'ruby', 'csharp'].map((l) => (
                      <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Taranacak kodu yapıştırın veya editörden bir dosya açın..."
                rows={15}
                className="font-mono text-xs bg-[#1e1e1e] resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {code.split('\n').length} satır · {code.length} karakter
              </p>
            </CardContent>
          </Card>

          {/* Results summary */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck size={14} /> Özet
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scanning ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-blue-400" size={32} />
                </div>
              ) : result ? (
                <div className="space-y-3">
                  {/* Score gauge */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke="#1e1e1e"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke={result.score >= 80 ? '#10b981' : result.score >= 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8"
                          strokeDasharray={`${(result.score / 100) * 251.2} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold">{result.score}</div>
                        <div className="text-[10px] text-muted-foreground">/ 100</div>
                      </div>
                    </div>
                  </div>

                  {/* Severity counts */}
                  <div className="grid grid-cols-5 gap-1">
                    {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => {
                      const count = result.stats[key as keyof typeof result.stats];
                      return (
                        <div
                          key={key}
                          className="text-center p-1.5 rounded border"
                          style={{ borderColor: `${cfg.color}40` }}
                        >
                          <div className="text-sm font-bold" style={{ color: cfg.color }}>
                            {count}
                          </div>
                          <div className="text-[9px] text-muted-foreground">{cfg.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Tarama için "Tara" butonuna bas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vulnerabilities list */}
        {result && (
          <Card className="bg-card border-border mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Bulgular ({filteredVulns.length})</CardTitle>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
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
              {filteredVulns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
                  Bu severity'de bulgu yok
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredVulns.map((vuln, i) => {
                      const cfg = SEVERITY_CONFIG[vuln.severity];
                      const Icon = cfg.icon;
                      return (
                        <motion.div
                          key={vuln.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border rounded p-3"
                          style={{ borderColor: `${cfg.color}30`, background: `${cfg.color}05` }}
                        >
                          <div className="flex items-start gap-2">
                            <Icon size={16} style={{ color: cfg.color }} className="mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-medium">{vuln.title}</span>
                                <Badge
                                  variant="outline"
                                  className="text-[9px]"
                                  style={{ color: cfg.color, borderColor: cfg.color }}
                                >
                                  {cfg.label}
                                </Badge>
                                {vuln.cwe && (
                                  <Badge variant="secondary" className="text-[9px]">
                                    {vuln.cwe}
                                  </Badge>
                                )}
                                {vuln.owasp && (
                                  <Badge variant="outline" className="text-[9px]">
                                    {vuln.owasp}
                                  </Badge>
                                )}
                                {vuln.cvss && (
                                  <Badge variant="outline" className="text-[9px]">
                                    CVSS: {vuln.cvss}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {vuln.description}
                              </p>
                              {vuln.codeSnippet && (
                                <pre className="bg-[#1e1e1e] border border-border p-2 rounded text-[10px] font-mono mb-2 overflow-auto">
                                  {vuln.codeSnippet}
                                </pre>
                              )}
                              <div className="bg-green-500/5 border border-green-500/20 rounded p-2">
                                <div className="text-[10px] text-green-400 font-semibold mb-0.5">
                                  Önerilen Fix:
                                </div>
                                <p className="text-xs text-green-300">{vuln.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* OWASP compliance */}
        {result && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">OWASP Top 10 (2021) Uyumluluğu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {result.owaspCompliance.map((o) => (
                  <div
                    key={o.category}
                    className={`flex items-start gap-2 p-2 rounded border ${
                      o.status === 'compliant'
                        ? 'border-green-500/20 bg-green-500/5'
                        : 'border-red-500/20 bg-red-500/5'
                    }`}
                  >
                    {o.status === 'compliant' ? (
                      <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{o.category}</div>
                      <div className="text-[10px] text-muted-foreground">{o.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ---------- Local rule-based scan ----------

function localSecurityScan(code: string, language: string): Vulnerability[] {
  const findings: Vulnerability[] = [];
  const lines = code.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // SQL Injection
    if (/(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b).*\$\{|.*\+.*\bwhere\b/i.test(line) && !line.includes('?') && !line.includes('parameterized')) {
      findings.push({
        id: `sql_inj_${lineNum}`,
        cwe: 'CWE-89',
        owasp: 'A03:2021-Injection',
        severity: 'critical',
        title: 'SQL Injection Riski',
        description: 'String birleştirme ile SQL sorgusu oluşturulmuş. Parameterized query kullanın.',
        line: lineNum,
        codeSnippet: line.trim(),
        recommendation: 'Parameterized queries (prepared statements) kullanın: db.query("SELECT * FROM users WHERE id = $1", [userId])',
        cvss: 9.8,
      });
    }

    // XSS — dangerouslySetInnerHTML
    if (line.includes('dangerouslySetInnerHTML')) {
      findings.push({
        id: `xss_${lineNum}`,
        cwe: 'CWE-79',
        owasp: 'A03:2021-Injection',
        severity: 'high',
        title: 'XSS Riski — dangerouslySetInnerHTML',
        description: 'dangerouslySetInnerHTML kullanımı XSS saldırısına açık olabilir.',
        line: lineNum,
        codeSnippet: line.trim(),
        recommendation: 'DOMPurify ile sanitize edin: dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}',
        cvss: 7.2,
      });
    }

    // eval()
    if (/\beval\s*\(/.test(line)) {
      findings.push({
        id: `eval_${lineNum}`,
        cwe: 'CWE-95',
        owasp: 'A03:2021-Injection',
        severity: 'critical',
        title: 'eval() Kullanımı',
        description: 'eval() kod enjeksiyonuna izin verir.',
        line: lineNum,
        codeSnippet: line.trim(),
        recommendation: 'eval yerine Function constructor veya JSON.parse kullanın.',
        cvss: 9.0,
      });
    }

    // Hardcoded secrets
    if (/(password|secret|api_key|apikey|token|private_key)\s*[=:]\s*["\'][^"\']{8,}["\']/i.test(line)) {
      findings.push({
        id: `secret_${lineNum}`,
        cwe: 'CWE-798',
        owasp: 'A07:2021-Identification and Authentication Failures',
        severity: 'high',
        title: 'Hardcoded Secret',
        description: 'Kodda hardcoded kimlik bilgisi tespit edildi.',
        line: lineNum,
        codeSnippet: line.trim().replace(/["\'][^"\']{8,}["\']/, '"***REDACTED***"'),
        recommendation: 'Environment variables veya secrets manager kullanın: process.env.API_KEY',
        cvss: 8.5,
      });
    }

    // http:// (insecure)
    if (/http:\/\/(?!localhost|127\.0\.0\.1)/.test(line)) {
      findings.push({
        id: `http_${lineNum}`,
        cwe: 'CWE-319',
        owasp: 'A02:2021-Cryptographic Failures',
        severity: 'medium',
        title: 'Insecure HTTP',
        description: 'HTTP (şifresiz) bağlantı kullanımı.',
        line: lineNum,
        codeSnippet: line.trim(),
        recommendation: 'HTTPS kullanın: https://...',
        cvss: 5.0,
      });
    }

    // console.log with sensitive data
    if (/console\.(log|info|warn|error)\s*\(.*?(password|secret|token|key|credit)/i.test(line)) {
      findings.push({
        id: `log_secret_${lineNum}`,
        cwe: 'CWE-532',
        owasp: 'A09:2021-Security Logging and Monitoring Failures',
        severity: 'medium',
        title: 'Secret Log\'a Yazılıyor',
        description: 'Hassas bilgi console\'a yazılıyor.',
        line: lineNum,
        codeSnippet: line.trim(),
        recommendation: 'Hassas bilgileri log\'lamayın veya mask’leyin.',
        cvss: 4.5,
      });
    }

    // Math.random for crypto
    if (/Math\.random\(\).*?(token|key|password|id)/i.test(line)) {
      findings.push({
        id: `weak_rand_${lineNum}`,
        cwe: 'CWE-338',
        owasp: 'A02:2021-Cryptographic Failures',
        severity: 'high',
        title: 'Zayıf Random — Math.random',
        description: 'Güvenlik için Math.random kullanılmış (cryptographic değil).',
        line: lineNum,
        codeSnippet: line.trim(),
        recommendation: 'crypto.randomUUID() veya crypto.getRandomValues() kullanın.',
        cvss: 7.0,
      });
    }
  });

  return findings;
}

// ---------- AI-powered deep scan ----------

async function aiSecurityScan(code: string, language: string): Promise<Vulnerability[]> {
  try {
    const res = await fetch('/api/deepseek/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `Sen bir siber güvenlik uzmanısın. OWASP Top 10 (2021), CWE Top 25 ve CVSS v3.1 uzmanısın.

Verilen kodu derinlemesine analiz et ve JSON formatında bulgular üret:
{
  "vulnerabilities": [
    {
      "cwe": "CWE-XXX",
      "owasp": "A0X:2021-Name",
      "severity": "critical|high|medium|low|info",
      "title": "kısa başlık",
      "description": "detaylı açıklama",
      "line": 42,
      "cvss": 8.5,
      "recommendation": "önerilen fix"
    }
  ]
}

SADECE JSON döndür, başka metin yok.`,
          },
          {
            role: 'user',
            content: `Dil: ${language}\n\nKod:\n\`\`\`\n${code.slice(0, 5000)}\n\`\`\``,
          },
        ],
        model: 'deepseek-reasoner',
        temperature: 0.3,
        max_tokens: 3000,
        stream: false,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    // JSON parse
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    return (parsed.vulnerabilities || []).map((v: any, i: number) => ({
      id: `ai_${i}_${Date.now()}`,
      ...v,
    }));
  } catch {
    return [];
  }
}

function generateOwaspCompliance(vulns: Vulnerability[]): Array<{ category: string; status: 'compliant' | 'risk'; detail: string }> {
  const categories = [
    'A01:2021-Broken Access Control',
    'A02:2021-Cryptographic Failures',
    'A03:2021-Injection',
    'A04:2021-Insecure Design',
    'A05:2021-Security Misconfiguration',
    'A06:2021-Vulnerable Components',
    'A07:2021-Auth Failures',
    'A08:2021-Software Integrity Failures',
    'A09:2021-Logging Failures',
    'A10:2021-SSRF',
  ];

  return categories.map((cat) => {
    const matching = vulns.filter((v) => v.owasp?.startsWith(cat.split('-')[0]));
    return {
      category: cat,
      status: matching.length > 0 ? 'risk' : 'compliant',
      detail: matching.length > 0
        ? `${matching.length} bulgu: ${matching.map((m) => m.title).join(', ')}`
        : 'Bu kategoride bulgu yok',
    };
  });
}

function generateReport(result: ScanResult, code: string, language: string): string {
  const date = new Date().toLocaleString('tr-TR');
  return `# Güvenlik Tarama Raporu

**Tarih:** ${date}
**Dil:** ${language}
**Toplam Satır:** ${code.split('\n').length}

## Özet

- **Güvenlik Skoru:** ${result.score}/100
- **Toplam Bulgu:** ${result.stats.total}
  - Kritik: ${result.stats.critical}
  - Yüksek: ${result.stats.high}
  - Orta: ${result.stats.medium}
  - Düşük: ${result.stats.low}
  - Bilgi: ${result.stats.info}

## OWASP Top 10 Uyumluluğu

${result.owaspCompliance.map((o) => `- [${o.status === 'compliant' ? '✓' : '✗'}] **${o.category}** — ${o.detail}`).join('\n')}

## Bulgular

${result.vulnerabilities.map((v, i) => `### ${i + 1}. ${v.title}

- **CWE:** ${v.cwe}
- **OWASP:** ${v.owasp}
- **Severity:** ${v.severity.toUpperCase()}
- **CVSS:** ${v.cvss || 'N/A'}
- **Satır:** ${v.line || 'N/A'}

**Açıklama:** ${v.description}

**Önerilen Fix:** ${v.recommendation}
`).join('\n')}

---
*Bu rapor DeepSeek App Studio Security Scanner tarafından üretilmiştir.*
`;
}
