# Skill: UX Devrimi

```yaml
name: ux-revolution
version: 1.0.0
description: >
  Apple HIG, Material 3, Fluent 2 ve spatial computing'den beslenen modern,
  duygusal, bağlamsal arayüzler tasarlama uzmanlığı. AI stüdyo için "devrim
  niteliğinde" UX desenleri üretir.
capabilities:
  - Apple HIG / Material 3 / Fluent 2 modern prensipleri
  - Spatial computing & 3D UI patterns
  - Glassmorphism, neomorphism, claymorphism derin uygulama
  - Adaptive UI (context-aware interfaces)
  - Predictive UX (AI-driven interface changes)
  - Skeleton → content morphing
  - Magnetic buttons, elastic interactions
  - Cursor effects (custom cursor, magnetic hover)
  - Page transitions (slide, fade, scale, blur)
  - Voice-first interfaces
  - Gesture-driven UI (pinch, swipe, long-press)
  - Haptic-feel visual feedback
  - Onboarding storytelling
tools:
  - next@^16
  - react@^19
  - tailwindcss@^4
  - framer-motion@^11
  - @react-three/fiber
  - @radix-ui
output_format: TypeScript + React + Tailwind
trigger_patterns:
  - "modern UX"
  - "glassmorphism"
  - "spatial UI"
  - "magnetic button"
  - "voice interface"
  - "gesture UI"
  - "adaptive layout"
  - "predictive UX"
```

---

## 1. Felsefe — Neden "Devrim"?

Geleneksel UX: **kullanıcı eylemi → arayüz tepkisi**. Devrim niteliğinde UX: **arayüz kullanıcının niyetini öngörür → eylemi hafifletir → geri bildiriyi çoklu duyuya yayar**.

Üç temel ilke:

1. **Spatiality (Mekânsallık)** — Derinlik, perspektif, parallax, ışık. Düz 2D'den çık.
2. **Contextuality (Bağlamsallık)** — Aynı arayüz, kullanıcıya/zamana/cihaza göre değişir.
3. **Personality (Kişilik)** — Mikro hareketler + ses + titreşim-benzeri görsel feedback ile marka tonu.

Matris:

| Boyut | Geleneksel | Devrim |
|---|---|---|
| Navigasyon | Üst menü, sekme | Spatial dock, gesture |
| Yükleme | Spinner | Morphing skeleton |
| Geri bildirim | Alert kutusu | Toast + haptic-look + ses |
| Kişiselleştirme | Ayarlar menüsü | Adaptif (kullanım alışkanlığına göre) |
| Erişim | Form | Voice-first + autocomplete |

---

## 2. Apple HIG 2026 — Temel Prensipler

Apple Human Interface Guidelines'in güncel özeti:

1. **Clarity** — Tipografi okunaklı, ikonlar net, her element tek iş yapar.
2. **Deference** — İçerik öne çıkar, UI geri planda kalır (translucency, blur).
3. **Depth** — Katmanlar, gölgeler, hareket ile hiyerarşi.
4. **Fluid animation** — Spring-based, doğal.
5. **Direct manipulation** — Pinch, swipe, drag ile içerikle doğrudan etkileşim.
6. **Feedback** — Her eyleme anlık görsel/işitsel/dokunsal cevap.

### 2.1 Liquid Glass (2025+)

Apple'ın son nesil cam efekt sistemi — kenarda refraksiyon, ışık takibi, içeriği yumuşakça eğip bükme.

```tsx
export function LiquidGlass({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl backdrop-saturate-150"
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 20px 50px rgba(0,0,0,0.4)",
      }}
    >
      {/* Kenarda refraksiyon için ışık şeridi */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent" />
      <div className="relative p-6">{children}</div>
    </div>
  );
}
```

---

## 3. Material 3 (Material You) — Özet

Google'ın M3'ü 5 temel konsepte dayanır:

1. **Dynamic color** — Kullanıcı duvar kağıdından palet türetme.
2. **Tonal palettes** — Her renk 0–100 ton skalası.
3. **Large / medium / small topology** — Ekran boyutuna göre layout.
4. **Motion 4 esas** — easing (emphasized), duration (200–600ms), staging (stagger), continuous (shared element).
5. **Stateful components** — Hover/focus/pressed/dragged her durumda farklı surface tonu.

```tsx
// M3 renk token'ları (Tailwind 4 ile)
const m3 = {
  primary: "#6750A4",
  onPrimary: "#FFFFFF",
  primaryContainer: "#EADDFF",
  onPrimaryContainer: "#21005D",
  surface: "#1C1B1F",
  onSurface: "#E6E1E5",
  surfaceVariant: "#49454F",
  outline: "#938F99",
};

export function M3Button({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-6 py-3 text-sm font-medium transition-all duration-200
                 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary]
                 hover:shadow-lg hover:shadow-[--md-sys-color-primary]/30
                 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ backgroundColor: m3.primary, color: m3.onPrimary }}
    >
      {children}
    </button>
  );
}
```

---

## 4. Fluent 2 — Microsoft Yaklaşımı

Fluent'ın ayırt edici yönleri:

- **Acrylic** — Yarı saydam, hafif blur'lu arka plan (glassmorphism benzeri ama daha mat).
- **Reveal** — Hover'da kenarda hafif ışık halkası.
- **Depth** — Z-axis gölge katmanları (16/32/64).
- **Mica** — Duvar kağıdından türetilen opak materyal (uygulama arka planı).

```tsx
export function AcrylicPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border border-white/10 p-6 backdrop-blur-xl"
      style={{
        background: "rgba(32,32,32,0.7)",
        backdropFilter: "blur(30px) saturate(125%)",
      }}
    >
      {children}
    </div>
  );
}
```

---

## 5. Glassmorphism — Derin Uygulama

```tsx
type GlassCardProps = {
  children: React.ReactNode;
  blur?: number; // px
  opacity?: number; // 0-1
};

export function GlassCard({ children, blur = 16, opacity = 0.6 }: GlassCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/15"
      style={{
        background: `rgba(255,255,255,${opacity})`,
        backdropFilter: `blur(${blur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
    >
      <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-br from-purple-400/40 to-transparent blur-3xl" />
      <div className="relative p-6">{children}</div>
    </div>
  );
}
```

### 5.1 Glass + motion

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -4, rotateX: 3, rotateY: -3 }}
  style={{ transformPerspective: 1000 }}
  transition={{ type: "spring", stiffness: 250, damping: 20 }}
  className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl"
>
  Hover'da 3D tilt
</motion.div>
```

---

## 6. Neomorphism & Claymorphism

### 6.1 Neomorphism (yumuşak gölge, kabartma)

```tsx
export function NeomorphButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="rounded-2xl bg-slate-200 px-6 py-3 text-slate-700 transition-all duration-200
                 hover:shadow-inner active:scale-[0.98]"
      style={{
        boxShadow:
          "8px 8px 16px rgba(0,0,0,0.15), -8px -8px 16px rgba(255,255,255,0.8)",
      }}
    >
      {children}
    </button>
  );
}
```

### 6.2 Claymorphism (yumuşak 3D, renkli kabarcık)

```tsx
export function ClayCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl bg-gradient-to-br from-violet-400 to-fuchsia-500 p-8 text-white"
      style={{
        boxShadow:
          "inset 0 -8px 16px rgba(0,0,0,0.2), inset 0 8px 16px rgba(255,255,255,0.3), 0 12px 24px rgba(168,85,247,0.4)",
        border: "2px solid rgba(255,255,255,0.2)",
      }}
    >
      {children}
    </div>
  );
}
```

---

## 7. Spatial Computing & 3D UI

### 7.1 CSS 3D transform ile derinlik

```tsx
export function SpatialCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent) {
    const el = ref.current!;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(10px)`;
  }

  function reset() {
    ref.current!.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 transition-transform duration-200 ease-out"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div style={{ transform: "translateZ(40px)" }}>{children}</div>
    </div>
  );
}
```

### 7.2 React Three Fiber ile 3D öğe

```tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function FloatingCube() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.3;
    ref.current.rotation.y += delta * 0.4;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#6366f1" metalness={0.6} roughness={0.2} />
    </mesh>
  );
}

export function Hero3D() {
  return (
    <Canvas className="h-96 w-full">
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 3, 3]} />
      <FloatingCube />
    </Canvas>
  );
}
```

---

## 8. Adaptive UI — Context-Aware

Arayüz; saat, lokasyon, cihaz, kullanım sıklığı, erişilebilirlik tercihine göre değişir.

```tsx
type Context = {
  hour: number;
  device: "mobile" | "tablet" | "desktop" | "vision";
  battery?: number;
  connection?: "wifi" | "4g" | "5g" | "slow";
  lastUsedFeature?: string;
  prefersReducedMotion: boolean;
  prefersContrast: "normal" | "more";
};

export function useAdaptive(): Context {
  const [ctx, setCtx] = useState<Context>(null!);

  useEffect(() => {
    const update = () =>
      setCtx({
        hour: new Date().getHours(),
        device:
          window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
        connection: (navigator as any).connection?.effectiveType ?? "wifi",
        prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        prefersContrast: window.matchMedia("(prefers-contrast: more)").matches ? "more" : "normal",
        lastUsedFeature: localStorage.getItem("lastFeature") ?? undefined,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return ctx;
}

export function AdaptiveShell({ children }: { children: React.ReactNode }) {
  const ctx = useAdaptive();
  if (!ctx) return null;

  const isNight = ctx.hour < 7 || ctx.hour > 19;
  const isSlow = ctx.connection === "slow";

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${
        isNight ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      } ${ctx.prefersContrast === "more" ? "contrast-125" : ""}`}
    >
      {isSlow ? <MinimalShell>{children}</MinimalShell> : children}
    </div>
  );
}
```

---

## 9. Predictive UX — AI-Driven Interface

Kullanıcı sonraki eylemini tahmin et, arayüzü buna göre hazırla.

```tsx
type Prediction = {
  action: string;
  confidence: number;
  route?: string;
};

export function usePredictiveAction(history: string[]): Prediction[] {
  return useMemo(() => {
    // Basit n-gram modeli: en sık ardışık 2-gram'lar
    const counts = new Map<string, number>();
    for (let i = 0; i < history.length - 1; i++) {
      const key = `${history[i]}→${history[i + 1]}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const last = history[history.length - 1];
    return [...counts.entries()]
      .filter(([k]) => k.startsWith(`${last}→`))
      .map(([k, v]) => ({
        action: k.split("→")[1],
        confidence: v / history.length,
        route: k.split("→")[1],
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }, [history]);
}

export function PredictiveDock({ history }: { history: string[] }) {
  const preds = usePredictiveAction(history);
  return (
    <div className="flex gap-2">
      <AnimatePresence>
        {preds.map((p) => (
          <motion.button
            key={p.action}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: p.confidence, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="rounded-lg bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300"
          >
            ⚡ {p.action} ({Math.round(p.confidence * 100)}%)
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

---

## 10. Skeleton → Content Morphing

Sadece fade değil, gerçek morfoloji: skeleton şekli content'e akar.

```tsx
export function MorphCard({ data }: { data: User | null }) {
  return (
    <div className="h-32 w-full rounded-xl bg-slate-900 p-4">
      <AnimatePresence mode="wait">
        {data ? (
          <motion.div
            key="real"
            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.96 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.04 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-lg font-semibold text-white">{data.name}</div>
            <div className="text-sm text-slate-400">{data.email}</div>
          </motion.div>
        ) : (
          <motion.div
            key="skel"
            exit={{ opacity: 0, filter: "blur(8px)" }}
            className="space-y-3"
          >
            <div className="h-5 w-40 animate-pulse rounded bg-slate-700" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 11. Magnetic Buttons

Buton imlece doğru hafifçe "yönelir". Apple Vision ve Mac'lerdeki dock hissi.

```tsx
import { motion, useMotionValue, useSpring } from "framer-motion";

export function MagneticButton({ children, strength = 0.4 }: { children: React.ReactNode; strength?: number }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 15 });
  const y = useSpring(my, { stiffness: 200, damping: 15 });

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    my.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }

  return (
    <motion.button
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      whileTap={{ scale: 0.95 }}
      className="rounded-full bg-indigo-600 px-6 py-3 text-white shadow-lg"
    >
      {children}
    </motion.button>
  );
}
```

---

## 12. Elastic Interactions

Aşırı çekme/itme sonrası geri tepen yay benzeri etkileşim. Drag-to-refresh, pull-down menu için ideal.

```tsx
export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void>; children: React.ReactNode }) {
  const y = useMotionValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const threshold = 80;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-1/2 top-4 -translate-x-1/2 text-indigo-400"
        style={{ y: useTransform(y, [0, threshold], [0, 30]), opacity: useTransform(y, [0, threshold], [0, 1]) }}
      >
        {refreshing ? <Spinner /> : "↓ çek ve bırak"}
      </motion.div>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        style={{ y }}
        onDragEnd={async () => {
          if (y.get() > threshold && !refreshing) {
            setRefreshing(true);
            await onRefresh();
            setRefreshing(false);
          }
          animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
```

---

## 13. Custom Cursor Effects

İmleç içerikle etkileşir — butonların üzerinde büyür, metinde değişir, link'lerde halka olur.

```tsx
export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40 });
  const sy = useSpring(y, { stiffness: 500, damping: 40 });
  const [variant, setVariant] = useState<"default" | "hover" | "text">("default");

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      if (el.closest("button, a")) setVariant("hover");
      else if (el.closest("input, textarea, [contenteditable]")) setVariant("text");
      else setVariant("default");
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-50 mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="rounded-full bg-white"
        animate={{
          width: variant === "hover" ? 48 : variant === "text" ? 4 : 16,
          height: variant === "hover" ? 48 : variant === "text" ? 24 : 16,
          borderRadius: variant === "text" ? 2 : 999,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </motion.div>
  );
}
```

---

## 14. Page Transitions

### 14.1 Slide (mobil)

```tsx
<motion.div
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={{ type: "spring", stiffness: 320, damping: 32 }}
/>
```

### 14.2 Scale + blur (modal)

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
  exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
/>
```

### 14.3 Crossfade (zarf)

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={route}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  />
</AnimatePresence>
```

### 14.4 Cube rotation (3D)

```tsx
<motion.div
  initial={{ rotateY: 90, opacity: 0 }}
  animate={{ rotateY: 0, opacity: 1 }}
  exit={{ rotateY: -90, opacity: 0 }}
  style={{ transformPerspective: 1200 }}
  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
/>
```

---

## 15. Voice-First Interfaces

Ses ile kontrol, görsel geri bildirim ile birleştiğinde devrimsel his verir.

```tsx
export function VoiceOrb() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const SR = (window as any).webkitSpeechRecognition ?? (window as any).SpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "tr-TR";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      setTranscript(Array.from(e.results).map((r: any) => r[0].transcript).join(""));
    };
    rec.onend = () => setListening(false);

    if (listening) rec.start();
    return () => rec.stop();
  }, [listening]);

  return (
    <div className="relative grid h-64 w-64 place-items-center">
      {listening && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-indigo-400/40"
              animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
              style={{ width: 100, height: 100 }}
            />
          ))}
        </>
      )}
      <motion.button
        onClick={() => setListening((v) => !v)}
        animate={{ scale: listening ? 1.1 : 1 }}
        className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl"
      >
        🎤
      </motion.button>
      {transcript && (
        <div className="absolute -bottom-12 max-w-xs rounded-lg bg-slate-800 p-2 text-center text-sm text-white">
          {transcript}
        </div>
      )}
    </div>
  );
}
```

---

## 16. Gesture-Driven UI

### 16.1 Pinch zoom

```tsx
export function PinchImage({ src }: { src: string }) {
  const scale = useMotionValue(1);
  const lastScale = useRef(1);

  return (
    <motion.img
      src={src}
      drag
      style={{ scale }}
      dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
      onWheel={(e: React.WheelEvent) => {
        const next = Math.max(0.5, Math.min(3, lastScale.current - e.deltaY * 0.001));
        scale.set(next);
        if (next === 1) lastScale.current = 1;
      }}
      onDoubleClick={() => {
        scale.set(1);
        lastScale.current = 1;
      }}
    />
  );
}
```

### 16.2 Long-press menu

```tsx
export function LongPressCard({ children, menu }: { children: React.ReactNode; menu: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    timer.current = setTimeout(() => setOpen(true), 500);
  };
  const cancel = () => timer.current && clearTimeout(timer.current);

  return (
    <div
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={start}
      onTouchEnd={cancel}
      className="relative"
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute left-1/2 top-full z-50 -translate-x-1/2 rounded-lg bg-slate-900 p-2 shadow-2xl"
            onClick={() => setOpen(false)}
          >
            {menu}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 16.3 Swipe-to-action

```tsx
export function SwipeRow({ children, onArchive, onDelete }: { children: React.ReactNode; onArchive: () => void; onDelete: () => void }) {
  const x = useMotionValue(0);
  const bg = useTransform(x, [-150, -75, 0, 75, 150], ["#ef4444", "#f97316", "#1e293b", "#22c55e", "#22c55e"]);

  return (
    <motion.div style={{ background: bg }} className="relative overflow-hidden rounded-lg">
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={() => {
          if (x.get() < -120) onDelete();
          else if (x.get() > 120) onArchive();
          else animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
        }}
        className="relative bg-slate-800 p-4 text-white"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
```

---

## 17. Haptic-Feel Visual Feedback

Gerçek titreşim olmasa bile görsel olarak "haptic" hissi vermek: pulse, ripple, scale flash.

```tsx
export function HapticButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 800, damping: 20 }}
      className="relative overflow-hidden rounded-lg bg-indigo-600 px-4 py-2 text-white"
    >
      {children}
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-lg bg-white/40"
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </motion.button>
  );
}
```

### 17.1 Gerçek vibration API (mobil)

```tsx
export function vibrate(pattern: number | number[] = 10) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

// Kullanım: onClick={() => vibrate([10, 30, 10])}
```

---

## 18. Onboarding Storytelling

İlk açılışta kullanıcıyı bir hikaye ile gezdir.

```tsx
const steps = [
  { title: "AI Stüdyo'ya hoş geldin", desc: "Kodunu saniyeler içinde üret.", color: "from-indigo-500 to-purple-500" },
  { title: "Politikalar", desc: "20 derin kurumsal politika hazır.", color: "from-emerald-500 to-teal-500" },
  { title: "Agent", desc: "ReAct + function calling.", color: "from-rose-500 to-orange-500" },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  return (
    <div className="grid h-screen place-items-center">
      <div className="w-80">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
            className={`rounded-3xl bg-gradient-to-br ${steps[i].color} p-8 text-white shadow-2xl`}
          >
            <h2 className="text-2xl font-bold">{steps[i].title}</h2>
            <p className="mt-2 opacity-90">{steps[i].desc}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex justify-center gap-2">
          {steps.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              className={`h-2 rounded-full transition-all ${k === i ? "w-8 bg-indigo-500" : "w-2 bg-slate-600"}`}
            />
          ))}
        </div>
        <button
          onClick={() => (i < steps.length - 1 ? setI(i + 1) : onDone())}
          className="mt-6 w-full rounded-full bg-slate-900 py-3 text-white"
        >
          {i < steps.length - 1 ? "İleri" : "Başla"}
        </button>
      </div>
    </div>
  );
}
```

---

## 19. Spatial Dock (Apple Vision/Mac dock hissi)

```tsx
export function SpatialDock({ items }: { items: { icon: string; label: string; onClick: () => void }[] }) {
  const mx = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mx.set(e.clientX)}
      onMouseLeave={() => mx.set(Infinity)}
      className="flex items-end gap-2 rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-3 backdrop-blur-xl"
    >
      {items.map((it, i) => (
        <DockItem key={i} mouseX={mx} {...it} />
      ))}
    </motion.div>
  );
}

function DockItem({ mouseX, icon, label, onClick }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  const widthSync = useTransform(distance, [-150, 0, 150], [48, 80, 48]);
  const width = useSpring(widthSync, { stiffness: 300, damping: 20 });

  return (
    <motion.button
      ref={ref}
      style={{ width, height: width }}
      onClick={onClick}
      className="grid place-items-center rounded-2xl bg-white/10 text-2xl"
      title={label}
    >
      {icon}
    </motion.button>
  );
}
```

---

## 20. Adaptive Theme — Dynamic Color

Kullanıcının seçtiği bir görüntüden palet türet.

```tsx
import colorthief from "colorthief";

export function useDynamicPalette(imageUrl: string | null) {
  const [palette, setPalette] = useState<string[]>(["#6366f1", "#a855f7", "#ec4899"]);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      try {
        const thief = new colorthief();
        const colors = thief.getPalette(img, 5).map((rgb) => `rgb(${rgb.join(",")})`);
        setPalette(colors);
      } catch {}
    };
  }, [imageUrl]);

  return palette;
}
```

---

## 21. Reveal-on-Intent (Göster-gizle)

İçeriği gereksiz yere gösterme; kullanıcı ilgi gösterdiğinde aç.

```tsx
export function RevealOnHover({ summary, detail }: { summary: React.ReactNode; detail: React.ReactNode }) {
  return (
    <div className="group relative">
      {summary}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        whileHover={{ opacity: 1, height: "auto" }}
        className="overflow-hidden"
      >
        <div className="pt-3 text-sm text-slate-400">{detail}</div>
      </motion.div>
    </div>
  );
}
```

---

## 22. Empty States — Duygusal

Boş liste = fırsat. Kullanıcıya ne yapabileceğini göster.

```tsx
export function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid place-items-center py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl"
      >
        🚀
      </motion.div>
      <h3 className="mt-4 text-lg font-semibold text-white">Henüz proje yok</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-400">
        İlk projeni oluştur, AI seninle beraber kod yazsın.
      </p>
      <button
        onClick={onAction}
        className="mt-6 rounded-full bg-indigo-600 px-6 py-2 text-white transition hover:bg-indigo-500"
      >
        + Yeni Proje
      </button>
    </motion.div>
  );
}
```

---

## 23. Multi-sensory Toast

Ses + görsel + hafif sayfa pulse ile toast.

```tsx
export function playChime(type: "success" | "error" | "info") {
  const ctx = new (window.AudioContext ?? (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const freqs = { success: [523.25, 659.25, 783.99], error: [311.13, 261.63], info: [440] };
  const seq = freqs[type];
  seq.forEach((f, i) => {
    osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
  });
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seq.length * 0.12);
  osc.start();
  osc.stop(ctx.currentTime + seq.length * 0.12);
}

export function Toast({ type, message }: { type: "success" | "error" | "info"; message: string }) {
  useEffect(() => {
    playChime(type);
    if ("vibrate" in navigator) navigator.vibrate(type === "error" ? [40, 30, 40] : 20);
  }, [type]);

  const colors = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    info: "bg-indigo-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 25 }}
      className={`rounded-lg ${colors[type]} px-4 py-3 text-white shadow-2xl`}
    >
      {message}
    </motion.div>
  );
}
```

---

## 24. Command Palette (cmd+k) — Predictive

```tsx
export function CommandPalette({ open, onClose, actions }: { open: boolean; onClose: () => void; actions: Action[] }) {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!q) return actions.slice(0, 6);
    return actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
  }, [q, actions]);

  function exec(a: Action) {
    a.run();
    setRecent((r) => [a.id, ...r.filter((x) => x !== a.id)].slice(0, 5));
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-start justify-center bg-black/40 pt-32 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[600px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Komut ara..."
              className="w-full bg-transparent px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
            <div className="max-h-80 overflow-y-auto">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  onClick={() => exec(a)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
                >
                  <span className="text-lg">{a.icon}</span>
                  {a.label}
                  {recent.includes(a.id) && <span className="ml-auto text-xs text-indigo-400">Sık</span>}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 25. Tactile Surface — Wet/Matte toggle

Mood'a göre surface değişimi.

```tsx
export function TactileSurface({ children, mood = "matte" }: { children: React.ReactNode; mood?: "matte" | "wet" | "frost" }) {
  const styles = {
    matte: "bg-slate-800 text-slate-100",
    wet: "bg-gradient-to-br from-indigo-500/80 to-purple-600/80 backdrop-blur-xl text-white",
    frost: "bg-white/5 backdrop-blur-2xl border border-white/10 text-white",
  };
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`rounded-3xl p-6 ${styles[mood]}`}
    >
      {children}
    </motion.div>
  );
}
```

---

## 26. Scroll-Linked Adaptive Header

Yukarı kaydırınca küçülür, aşağı kaydırınca büyür.

```tsx
export function AdaptiveHeader() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200);
    setCompact(y > 60);
  });

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0, height: compact ? 56 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-slate-900/70 backdrop-blur-xl"
    >
      <div className="flex h-full items-center px-6 text-white">
        <span className={compact ? "text-base" : "text-xl transition-all"}>AI Stüdyo</span>
      </div>
    </motion.header>
  );
}
```

---

## 27. Onboarding Tooltip — Contextual

İlk kez görülen özelliğin yanında beliren pulse'lu ipucu.

```tsx
export function FirstRunHint({ targetId, text }: { targetId: string; text: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const seen = localStorage.getItem(`hint:${targetId}`);
    if (!seen) setShown(true);
  }, [targetId]);

  if (!shown) return null;

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute left-full top-0 ml-4 w-64 rounded-lg bg-indigo-600 p-3 text-sm text-white shadow-2xl"
      >
        {text}
        <button
          onClick={() => {
            localStorage.setItem(`hint:${targetId}`, "1");
            setShown(false);
          }}
          className="mt-2 rounded bg-white/20 px-2 py-1 text-xs"
        >
          Anladım
        </button>
      </motion.div>
      <motion.div
        className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-indigo-500"
        animate={{ scale: [1, 1.6], opacity: [1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
    </div>
  );
}
```

---

## 28. Accessibility — Devrimci Ama Kapsayıcı

Tüm "devrim" desenleri bir dezavantajlı grup için problem olabilir:

- **Custom cursor** — `cursor: none` yerine sadece desktop'ta devreye girsin, touch cihazlarda kapat.
- **Glassmorphism** — Kontrast yeterli değilse text okunamaz. En az WCAG AA (4.5:1) şart.
- **Voice interface** — İşitme engelliler için her zaman text alternatif.
- **Gesture UI** — Klavye ve screen reader ile de aynı fonksiyon çalışmalı.
- **Motion** — `prefers-reduced-motion` her zaman.

```tsx
export function useA11yChecks() {
  const reduce = useReducedMotion();
  const touch = matchMedia("(pointer: coarse)").matches;
  const highContrast = matchMedia("(prefers-contrast: more)").matches;
  return { reduce, touch, highContrast };
}
```

---

## 29. Kompozit Örnek — AI Stüdyo Dashboard Hero

```tsx
export function StudioHero() {
  const a11y = useA11yChecks();

  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Arkaplan: yumuşak renk blob'ları */}
      {!a11y.reduce && (
        <>
          <motion.div
            className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
          <motion.div
            className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
            transition={{ duration: 14, repeat: Infinity }}
          />
        </>
      )}

      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-indigo-300 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> DeepSeek V4 Pro aktif
          </span>
          <h1 className="mt-6 text-6xl font-bold text-white">
            Kodunu <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">düşün</span>,<br />
            gerisini AI yapsın.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300">
            20 derin kurumsal politika, 18 standart, ReAct agent — hepsi tek arayüzde.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex gap-4"
        >
          <MagneticButton>Başla</MagneticButton>
          <button className="rounded-full border border-white/15 px-6 py-3 text-white backdrop-blur hover:bg-white/5">
            Demo izle
          </button>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## 30. Skill Çıktısı Beklentisi

Bu skill çağrıldığında AI şu soruları sormalı/cevaplamalı:

1. **Bağlam nedir?** (modal, hero, dashboard, onboarding...)
2. **Hangi duygusal ton?** (ciddi, eğlenceli, premium, minimal)
3. **Cihaz ve erişilebilirlik?** (touch, reduced-motion, high-contrast)
4. **Hangi motion primitif'leri?** (magnetic, elastic, morph)

Çıktı her zaman:
- TypeScript + React + Tailwind + Framer Motion
- Dark mode uyumlu
- WCAG AA kontrast
- `prefers-reduced-motion` korumalı
- Touch device'da custom cursor/gesture kapanır

---

## 31. Hızlı Referans — Desen Kataloğu

| Desen | Primitif | Süre | Easing |
|---|---|---|---|
| Kart hover lift | `whileHover={{y:-6}}` | spring 300/20 | spring |
| Buton tap | `whileTap={{scale:0.95}}` | spring 500/20 | spring |
| Toast giriş | `initial={{y:30}} animate={{y:0}}` | 0.3s | [0.22,1,0.36,1] |
| Modal blur | `filter: blur(10px) → blur(0)` | 0.3s | emphasized |
| Drawer slide | `x: 100% → 0` | spring 320/32 | spring |
| Stagger list | `staggerChildren: 0.06` | — | — |
| Page crossfade | `opacity 0 → 1` | 0.2s | easeOut |
| Magnetic btn | `useMotionValue + spring 200/15` | — | spring |
| Voice orb ripple | `scale: [1,2.5], opacity: [0.6,0]` | 1.6s loop | linear |
| Empty state float | `y: [0,-8,0]` | 3s loop | easeInOut |

---

## 32. Kapanış

"UX Devrimi" demek **yeni efektler** demek değil; **kullanıcıya daha fazla empati** demek. Bir butonun mıknatıs gibi davranması, bir kartın spatial olarak eğilmesi, bir toast'ın chime sesi çıkarması — hepsi tek bir amaca hizmet eder: **kullanıcı arayüze güven duyar**.

AI stüdyo arayüzünde bu skill her view için 2–3 "devrim" deseni kullanır. Hepsini birden değil. Az ve öz. Çünkü devrimin sınırlarını aşarsanız kaos olur, kullanıcı boğulur.

Bu skill, AI'a şu rehberi verir: **"Her etkileşimde bir duygu var. Onu görsel, işitsel ve mekansal olarak aynı anda duyur. Ama her zaman empati ve erişilebilirlik önce."**
