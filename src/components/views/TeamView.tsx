'use client';

import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  Crown,
  Eye,
  Pencil,
  Mail,
  Clock,
  CircleDot,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type Role = 'admin' | 'editor' | 'viewer';
type Status = 'online' | 'idle' | 'offline';

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastActive: string;
  avatar?: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@studio.dev', role: 'admin', status: 'online', lastActive: 'şimdi' },
  { id: '2', name: 'Zeynep Kaya', email: 'zeynep@studio.dev', role: 'admin', status: 'online', lastActive: 'şimdi' },
  { id: '3', name: 'Mehmet Demir', email: 'mehmet@studio.dev', role: 'editor', status: 'idle', lastActive: '5 dk önce' },
  { id: '4', name: 'Ayşe Şahin', email: 'ayse@studio.dev', role: 'editor', status: 'online', lastActive: 'şimdi' },
  { id: '5', name: 'Can Öztürk', email: 'can@studio.dev', role: 'viewer', status: 'offline', lastActive: '2 saat önce' },
  { id: '6', name: 'Elif Aydın', email: 'elif@studio.dev', role: 'editor', status: 'idle', lastActive: '15 dk önce' },
  { id: '7', name: 'Burak Çelik', email: 'burak@studio.dev', role: 'viewer', status: 'offline', lastActive: '1 gün önce' },
];

const ROLE_META: Record<Role, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  admin: { label: 'Yönetici', icon: Crown, color: 'text-amber-400' },
  editor: { label: 'Editör', icon: Pencil, color: 'text-blue-400' },
  viewer: { label: 'Görüntüleyici', icon: Eye, color: 'text-gray-400' },
};

const STATUS_META: Record<Status, { label: string; color: string }> = {
  online: { label: 'Çevrimiçi', color: 'bg-green-500' },
  idle: { label: 'Boşta', color: 'bg-yellow-500' },
  offline: { label: 'Çevrimdışı', color: 'bg-gray-500' },
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function TeamView() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [inviteMsg, setInviteMsg] = useState('');

  const admins = members.filter((m) => m.role === 'admin').length;
  const active = members.filter((m) => m.status === 'online').length;

  const handleInvite = () => {
    if (!inviteEmail.includes('@')) {
      toast.error('Geçerli bir e-posta girin');
      return;
    }
    const newMember: Member = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'offline',
      lastActive: 'henüz giriş yapmadı',
    };
    setMembers([...members, newMember]);
    toast.success(`${inviteEmail} davet edildi (${ROLE_META[inviteRole].label})`);
    setInviteEmail('');
    setInviteRole('editor');
    setInviteMsg('');
    setOpen(false);
  };

  const handleRoleChange = (id: string, role: Role) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, role } : m)));
    toast.success('Rol güncellendi');
  };

  const handleRemove = (id: string) => {
    if (!confirm('Bu üyeyi takımdan çıkarmak istiyor musunuz?')) return;
    setMembers(members.filter((m) => m.id !== id));
    toast.success('Üye çıkarıldı');
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="text-blue-400" /> Takım Yönetimi
            </h1>
            <p className="text-sm text-muted-foreground">
              Üyeleri yönet, rolleri ata, davet gönder
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus size={14} className="mr-1" /> Üye Davet Et
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Yeni Üye Davet Et</DialogTitle>
                <DialogDescription>Davet e-postası gönderilecek</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label className="text-xs">E-posta</Label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-2 top-2.5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="uye@studio.dev"
                      className="pl-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Rol</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROLE_META) as Role[]).map((r) => {
                        const Icon = ROLE_META[r].icon;
                        return (
                          <SelectItem key={r} value={r}>
                            <div className="flex items-center gap-2">
                              <Icon size={12} className={ROLE_META[r].color} />
                              {ROLE_META[r].label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Davet Mesajı (opsiyonel)</Label>
                  <Textarea
                    value={inviteMsg}
                    onChange={(e) => setInviteMsg(e.target.value)}
                    placeholder="Hoş geldin mesajı..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
                <Button onClick={handleInvite}>Davet Gönder</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users size={20} className="text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{members.length}</div>
                <div className="text-xs text-muted-foreground">Toplam Üye</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Crown size={20} className="text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{admins}</div>
                <div className="text-xs text-muted-foreground">Yönetici</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CircleDot size={20} className="text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{active}</div>
                <div className="text-xs text-muted-foreground">Aktif</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member list */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Üyeler</CardTitle>
            <CardDescription className="text-xs">Rol değiştir veya üye çıkar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.map((m, i) => {
              const RoleIcon = ROLE_META[m.role].icon;
              const status = STATUS_META[m.status];
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={m.avatar} />
                      <AvatarFallback className="bg-blue-500/20 text-blue-300 text-xs">
                        {initials(m.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${status.color} border-2 border-card`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{m.name}</span>
                      <Badge variant="outline" className={`text-[9px] ${ROLE_META[m.role].color}`}>
                        <RoleIcon size={9} className="mr-0.5" /> {ROLE_META[m.role].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="truncate">{m.email}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {m.lastActive}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={m.role} onValueChange={(v) => handleRoleChange(m.id, v as Role)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ROLE_META) as Role[]).map((r) => (
                          <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
                      onClick={() => handleRemove(m.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
