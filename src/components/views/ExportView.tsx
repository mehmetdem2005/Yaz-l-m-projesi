'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileArchive,
  Github,
  Rocket,
  FileText,
  CheckCircle2,
  Loader2,
  Cloud,
  Server,
} from 'lucide-react';
import JSZip from 'jszip';
import { toast } from 'sonner';

export function ExportView() {
  const activeProjectId = useStore((s) => s.activeProjectId);
  const activeProject = useStore((s) => s.activeProject);
  const files = useStore((s) => s.files);
  const setView = useStore((s) => s.setView);
  const [exporting, setExporting] = useState(false);
  const [deployLog, setDeployLog] = useState<string[]>([]);

  const handleDownloadZip = async () => {
    if (!activeProject) {
      toast.error('Önce bir proje açın');
      return;
    }

    setExporting(true);
    try {
      const zip = new JSZip();
      const root = zip.folder(activeProject.name.replace(/\s+/g, '-').toLowerCase())!;

      // Add files
      files.forEach((f) => {
        root.file(f.path, f.content);
      });

      // Add README
      root.file(
        'README.md',
        `# ${activeProject.name}\n\n${activeProject.description || ''}\n\n## İçindekiler\n\n${files
          .map((f) => `- \`${f.path}\``)
          .join('\n')}\n\n## Kurulum\n\n\`\`\`bash\nbun install\nbun run dev\n\`\`\`\n\n## Oluşturulma\n\nDeepSeek App Studio ile ${new Date().toLocaleString('tr-TR')} tarihinde oluşturuldu.\n`
      );

      // Add package.json if not exists
      if (!files.find((f) => f.path === 'package.json')) {
        root.file(
          'package.json',
          JSON.stringify(
            {
              name: activeProject.name.toLowerCase().replace(/\s+/g, '-'),
              version: '0.1.0',
              private: true,
              scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
              dependencies: {
                next: '^16.0.0',
                react: '^19.0.0',
                'react-dom': '^19.0.0',
              },
            },
            null,
            2
          )
        );
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject.name.replace(/\s+/g, '-').toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ZIP indirildi');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const handleDeploySim = async () => {
    if (!activeProject) {
      toast.error('Önce bir proje açın');
      return;
    }
    setDeployLog([]);
    const steps = [
      '📦 Paket oluşturuluyor...',
      '🔒 Güvenlik kontrolü (OWASP Top 10)...',
      '✅ Güvenlik kontrolü başarılı',
      '🏗️ Build başlatılıyor (next build)...',
      '✅ Build başarılı (12.3 MB)',
      '🌍 CDN\'e yükleniyor (Cloudflare)...',
      '✅ CDN dağıtımı tamamlandı',
      '📊 Analytics entegre ediliyor...',
      '✅ Analytics hazır',
      '🚀 Production canlıya alındı!',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      setDeployLog((prev) => [...prev, steps[i]]);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket /> Deploy & Export
          </h1>
          <p className="text-sm text-muted-foreground">
            Projenizi ZIP olarak indirin veya dağıtım simülasyonu çalıştırın
          </p>
        </div>

        {!activeProject ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileArchive size={48} className="opacity-30 mb-4" />
              <p className="text-muted-foreground mb-4">Aktif proje yok</p>
              <Button onClick={() => setView('projects')}>
                Proje Seç
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active project info */}
            <Card className="mb-4 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText size={16} /> {activeProject.name}
                </CardTitle>
                <CardDescription>{activeProject.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Dosya Sayısı</p>
                    <p className="font-semibold">{files.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Toplam Boyut</p>
                    <p className="font-semibold">
                      {(files.reduce((s, f) => s + f.content.length, 0) / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Standart</p>
                    <p className="font-semibold">{activeProject.standard || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* ZIP Download */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Download size={16} /> ZIP İndir
                  </CardTitle>
                  <CardDescription>Tüm dosyaları tek ZIP olarak indirin</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleDownloadZip}
                    disabled={exporting}
                    className="w-full"
                  >
                    {exporting ? (
                      <>
                        <Loader2 size={14} className="mr-2 animate-spin" /> Paketleniyor...
                      </>
                    ) : (
                      <>
                        <FileArchive size={14} className="mr-2" /> ZIP İndir
                      </>
                    )}
                  </Button>
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <p>✓ Tüm kaynak dosyalar</p>
                    <p>✓ Otomatik README.md</p>
                    <p>✓ package.json (yoksa)</p>
                  </div>
                </CardContent>
              </Card>

              {/* GitHub Push (Sim) */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Github size={16} /> GitHub&apos;a Push
                  </CardTitle>
                  <CardDescription>GitHub reposuna kod gönder (simülasyon)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.info('GitHub entegrasyonu için Personal Access Token gerekir (simülasyon)')}
                  >
                    <Github size={14} className="mr-2" /> Push to GitHub
                  </Button>
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <p>• Repository oluşturma</p>
                    <p>• Branch oluşturma (main)</p>
                    <p>• Commit & push</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deploy Simulation */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Cloud size={16} /> Production Deploy (Simülasyon)
                </CardTitle>
                <CardDescription>
                  Vercel/Netlify/Cloudflare tarzı dağıtım akışı simülasyonu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleDeploySim} className="mb-4">
                  <Rocket size={14} className="mr-2" /> Deploy Başlat
                </Button>
                {deployLog.length > 0 && (
                  <div className="bg-[#1e1e1e] border border-border rounded p-3 font-mono text-xs space-y-1">
                    {deployLog.map((line, i) => (
                      <div key={i} className="flex items-start gap-2 fade-in-up">
                        <CheckCircle2 size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Environment info */}
            <Card className="mt-4 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Server size={16} /> Hedef Ortamlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Vercel', 'Netlify', 'Cloudflare Pages', 'AWS Amplify', 'Railway', 'Render', 'Fly.io', 'Self-hosted'].map(
                    (env) => (
                      <div
                        key={env}
                        className="p-2 bg-[#1e1e1e] rounded text-xs text-center hover:bg-[#2d2d2d] cursor-pointer"
                      >
                        {env}
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
