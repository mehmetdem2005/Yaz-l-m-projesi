'use client';

import { useEffect, useState } from 'react';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Shield,
  ShieldCheck,
  QrCode,
  Key,
  Check,
  X,
  Loader2,
  Copy,
  AlertTriangle,
  Smartphone,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface SetupData {
  secret: string;
  qrCodeUrl: string;
  otpauthUrl: string;
  backupCodes: string[];
}

export function TwoFactorView() {
  const [email, setEmail] = useState('user@example.com');
  const [enabled, setEnabled] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [disableToken, setDisableToken] = useState('');

  useEffect(() => {
    loadStatus();
  }, [email]);

  const loadStatus = async () => {
    try {
      const res = await fetch(`/api/2fa/setup?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setEnabled(data.enabled);
    } catch {}
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSetupData(data);
        setSetupOpen(true);
        toast.success('QR kodu oluşturuldu');
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      toast.error('6 haneli kod girin');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          backupCodes: setupData?.backupCodes || [],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('2FA etkinleştirildi!');
        setEnabled(true);
        setSetupOpen(false);
        setToken('');
        setSetupData(null);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (!disableToken) {
      toast.error('Kod girin');
      return;
    }
    setDisabling(true);
    try {
      const res = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: disableToken }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('2FA devre dışı bırakıldı');
        setEnabled(false);
        setDisableOpen(false);
        setDisableToken('');
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDisabling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı');
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-blue-400" /> İki Faktörlü Kimlik Doğrulama (2FA)
        </h1>
        <p className="text-sm text-muted-foreground">
          Hesabınızı TOTP (Time-based One-Time Password) ile koruyun
        </p>
      </div>

      {/* Status card */}
      <Card className={`mb-4 ${enabled ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {enabled ? (
              <ShieldCheck size={32} className="text-green-400" />
            ) : (
              <AlertTriangle size={32} className="text-yellow-400" />
            )}
            <div>
              <div className="font-semibold">
                {enabled ? '2FA Aktif' : '2FA Kapalı'}
              </div>
              <div className="text-xs text-muted-foreground">
                {enabled
                  ? 'Hesabınız koruma altında'
                  : 'Hesabınız güvende değil — şimdi etkinleştirin'}
              </div>
            </div>
          </div>
          {enabled ? (
            <Button
              variant="outline"
              onClick={() => setDisableOpen(true)}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Devre Dışı Bırak
            </Button>
          ) : (
            <Button onClick={handleSetup} disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : <Shield size={14} className="mr-1" />}
              Etkinleştir
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Smartphone size={24} className="mx-auto mb-2 text-blue-400" />
            <div className="text-xs font-medium">Authenticator App</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Google Authenticator, Authy, 1Password
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Key size={24} className="mx-auto mb-2 text-purple-400" />
            <div className="text-xs font-medium">Backup Codes</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              10 adet tek kullanımlık kod
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Lock size={24} className="mx-auto mb-2 text-green-400" />
            <div className="text-xs font-medium">RFC 6238 TOTP</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              30 saniyede bir yenilenir
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email input */}
      <Card className="bg-card border-border mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Hesap Email</CardTitle>
          <CardDescription>2FA'yı hangi email için yapılandıracağınızı girin</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            type="email"
          />
        </CardContent>
      </Card>

      {/* Setup dialog */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode size={18} /> 2FA Kurulumu
            </DialogTitle>
          </DialogHeader>

          {setupData && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded">
                  <img src={setupData.qrCodeUrl} alt="QR Code" width={200} height={200} />
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">Authenticator app'inizle QR kodu tarayın</p>
                <p className="text-[10px]">veya secret'ı manuel girin:</p>
                <div className="flex items-center gap-2 justify-center mt-1">
                  <code className="bg-[#1e1e1e] px-2 py-1 rounded text-xs font-mono">
                    {setupData.secret}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(setupData.secret)}
                  >
                    <Copy size={10} />
                  </Button>
                </div>
              </div>

              {/* Token input */}
              <div>
                <Label className="text-xs">6 Haneli Kod</Label>
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl font-mono tracking-[0.5em]"
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>

              {/* Backup codes */}
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Key size={14} className="text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">
                    Backup Kodları (güvenli yerde saklayın!)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {setupData.backupCodes.map((code, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-[#1e1e1e] px-2 py-1 rounded text-xs font-mono"
                    >
                      <span>{code}</span>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="text-gray-500 hover:text-white"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Bu kodlar tek kullanımlıktır. Telefonunuz kaybolursa hesabınıza erişim için kullanın.
                </p>
              </div>

              <AlertTriangle className="hidden" />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleVerify} disabled={verifying || token.length !== 6}>
              {verifying ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={14} className="mr-1" />}
              Doğrula ve Etkinleştir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable dialog */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X size={18} className="text-red-400" /> 2FA Devre Dışı Bırak
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              2FA'yı devre dışı bırakmak için authenticator kodunuzu veya backup kodunuzu girin.
            </p>
            <div>
              <Label className="text-xs">Kod (6 haneli TOTP veya backup kod)</Label>
              <Input
                value={disableToken}
                onChange={(e) => setDisableToken(e.target.value.toUpperCase())}
                placeholder="000000 veya ABCD1234"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disabling || !disableToken}
            >
              {disabling ? <Loader2 size={14} className="animate-spin mr-1" /> : <X size={14} className="mr-1" />}
              Devre Dışı Bırak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
