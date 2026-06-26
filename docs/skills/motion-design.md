# Skill: Motion Design & Animasyon

```yaml
name: motion-design
version: 1.0.0
description: >
  Framer Motion ve React ekosisteminde ileri seviye animasyon, micro-interaction,
  scroll-driven motion ve performans optimizasyonu konusunda uzmanlık. AI stüdyo
  arayüzündeki tüm hareketleri bu skill üzerinden üret.
capabilities:
  - Framer Motion variants, AnimatePresence, useScroll, useTransform, useSpring
  - Spring physics ve gesture animations (drag, hover, tap, pinch)
  - Layout animations (shared layout, layoutId)
  - Page transition patterns (route-level)
  - Micro-interactions (hover, tap, focus states)
  - Loading states (skeleton, shimmer, morphing)
  - Scroll-driven animations (parallax, reveal, sticky)
  - Performance: will-change, transform, opacity optimizasyonu
  - Accessibility: prefers-reduced-motion
  - Easing curves (cubic-bezier, easing preset'leri)
  - Stagger animations
  - SVG path animations
  - Number / count-up animations
tools:
  - framer-motion@^11
  - react@^19
  - next@^16
  - tailwindcss@^4
output_format: TypeScript + React + Framer Motion
trigger_patterns:
  - "animasyon ekle"
  - "bu butona hareket ver"
  - "sayfa geçişi olsun"
  - "scroll parallax"
  - "loading skeleton"
  - "hover efekti"
  - "stagger list"
  - "drag to reorder"
```

---

## 1. Temel Felsefe

Animasyon **süs değil, iletişimdir**. İyi bir hareket arayüzü üç iş yapar:

1. **Yönlendirme** — Kullanıcının dikkati nereye gitmeli?
2. **Bilgi** — Durum değişikliğini anlık ve anlaşılır kılar.
3. **Kişilik** — Markanın tonunu (ciddi, eğlenceli, kurumsal) aktarır.

Üç golden rule:
- **200–500 ms**: Çoğu UI hareketi bu aralıkta. Daha hızlı "anlık" hissi verir, daha yavaş "yorgun".
- **transform & opacity only**: Layout özelliklerini (width, top, margin) animasyonlamak paint trigger'lar. Sadece `transform` ve `opacity` GPU-composited'dir.
- **prefers-reduced-motion her zaman**: Vestibüler hassasiyeti olan kullanıcılar için hareket kapatılmalı.

---

## 2. Framer Motion — Temel API'ler

### 2.1 `motion` bileşeni ve `animate` prop'u

```tsx
import { motion } from "framer-motion";

export function FadeInBox() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-lg bg-white p-6 shadow-lg"
    >
      Merhaba dünya
    </motion.div>
  );
}
```

### 2.2 Variants — Daha temiz, daha güçlü

Variants, bir bileşenin birden fazla durumunu (initial, animate, hover, exit) isimlendirilmiş nesnelerle yönetir. Üst bileşenden alt bileşene otomatik yayılır.

```tsx
import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerList({ items }: { items: string[] }) {
  return (
    <motion.ul variants={container} initial="hidden" animate="show" className="space-y-2">
      {items.map((t) => (
        <motion.li key={t} variants={item} className="rounded-md bg-slate-800 p-3 text-slate-100">
          {t}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### 2.3 AnimatePresence — Çıkış animasyonları

React, bileşeni DOM'dan kaldırdığı an hareket kalamaz. `AnimatePresence` bunu çözer.

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function ToastStack() {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="rounded-md bg-slate-900 px-4 py-2 text-white shadow-xl"
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### 2.4 `mode="wait"` — Sıralı çıkış/giriş

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={step}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
  >
    {step}
  </motion.div>
</AnimatePresence>
```

### 2.5 `mode="popLayout"` — Çıkanları otomatik konumlandır

Listeden çıkan öğe, diğerleri kayarken eski yerinde kısa süre kalır.

```tsx
<AnimatePresence mode="popLayout">
  {items.map((it) => (
    <motion.div
      key={it.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    />
  ))}
</AnimatePresence>
```

---

## 3. Spring Physics

Spring, doğal his veren tek animasyon tipidir. `duration` ve `ease` yerine `stiffness`, `damping`, `mass` kullanılır.

```tsx
// Yumuşak ve elastik (vurgulu durumlar)
<motion.div
  animate={{ scale: 1 }}
  whileHover={{ scale: 1.05 }}
  transition={{ type: "spring", stiffness: 300, damping: 15, mass: 0.8 }}
/>

// Hızlı ve kontrollü (butonlar)
transition={{ type: "spring", stiffness: 500, damping: 30 }}

// Ağır ve sarkık (büyük paneller)
transition={{ type: "spring", stiffness: 120, damping: 18, mass: 1.2 }}
```

### 3.1 `useSpring` — Manual kontrol

```tsx
import { motion, useSpring, useTransform } from "framer-motion";

export function MagneticButton({ children }: { children: React.ReactNode }) {
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * 0.3);
    y.set(relY * 0.3);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="rounded-md bg-indigo-600 px-5 py-2 text-white"
    >
      {children}
    </motion.button>
  );
}
```

---

## 4. Gestures — `whileHover`, `whileTap`, `whileFocus`, `whileDrag`

```tsx
<motion.button
  whileHover={{ scale: 1.04, y: -2 }}
  whileTap={{ scale: 0.97 }}
  whileFocus={{ boxShadow: "0 0 0 3px rgba(99,102,241,0.5)" }}
  transition={{ type: "spring", stiffness: 400, damping: 20 }}
  className="rounded-lg bg-emerald-500 px-4 py-2 text-white"
>
  Kaydet
</motion.button>
```

### 4.1 Drag

```tsx
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
  dragElastic={0.2}
  dragMomentum={false}
  whileDrag={{ scale: 1.05, cursor: "grabbing" }}
  className="cursor-grab rounded-lg bg-slate-700 p-4 text-white"
>
  Beni sürükle
</motion.div>
```

### 4.2 Drag + snap back

```tsx
import { motion, useMotionValue, animate } from "framer-motion";

export function SwipeCard({ onSwipe }: { onSwipe: (dir: "left" | "right") => void }) {
  const x = useMotionValue(0);

  function handleDragEnd() {
    if (x.get() > 120) onSwipe("right");
    else if (x.get() < -120) onSwipe("left");
    else animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
  }

  return (
    <motion.div
      drag="x"
      style={{ x }}
      onDragEnd={handleDragEnd}
      className="h-72 w-64 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500"
    />
  );
}
```

---

## 5. Layout Animations & `layoutId`

`layout` prop'u, bileşenin boyut/konum değişikliklerini otomatik smooth'lar. `layoutId` ise farklı ağaç konumlarındaki iki öğeyi "aynı" kabul edip aralarında uçuş animasyonu (shared layout) yapar.

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const tabs = ["Genel", "Güvenlik", "Faturalama"] as const;

export function TabSwitch() {
  const [active, setActive] = useState<(typeof tabs)[number]>("Genel");
  return (
    <div className="flex gap-1 border-b border-slate-700">
      {tabs.map((t) => (
        <button key={t} onClick={() => setActive(t)} className="relative px-4 py-2 text-sm">
          {active === t && (
            <motion.div
              layoutId="tab-underline"
              className="absolute inset-x-0 -bottom-px h-0.5 bg-indigo-500"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className={active === t ? "text-white" : "text-slate-400"}>{t}</span>
        </button>
      ))}
    </div>
  );
}
```

### 5.1 Reorder (sürükle-bırak liste)

```tsx
import { Reorder, motion } from "framer-motion";
import { useState } from "react";

export function ReorderList() {
  const [items, setItems] = useState(["Faturalama", "Tema", "Bildirimler", "Profil"]);
  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
      {items.map((item) => (
        <Reorder.Item
          key={item}
          value={item}
          whileDrag={{ scale: 1.03, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
          className="cursor-grab rounded-md bg-slate-800 p-3 text-white"
        >
          {item}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

---

## 6. Scroll-Driven Animations

### 6.1 `useScroll` + `useTransform` — Parallax

```tsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative h-[120vh] overflow-hidden">
      <motion.div style={{ y: yBg }} className="absolute inset-0 bg-cover bg-center" />
      <motion.div style={{ y: yText, opacity }} className="absolute inset-0 grid place-items-center">
        <h1 className="text-6xl font-bold">AI Stüdyo</h1>
      </motion.div>
    </section>
  );
}
```

### 6.2 Reveal on scroll

```tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

### 6.3 Sticky scroll progress bar

```tsx
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-indigo-500"
    />
  );
}
```

### 6.4 Scroll-linked horizontal carousel

```tsx
export function HorizontalGallery({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(items.length - 1) * 100 / items.length}%`]);

  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-4 px-8">
          {items.map((src) => (
            <img key={src} src={src} className="h-72 w-[80vw] flex-shrink-0 rounded-xl object-cover" />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

---

## 7. Page Transitions (Next.js App Router)

Next.js App Router'da sayfa geçişleri için en sağlam yöntem: `template.tsx`. Her route değişiminde yeniden mount olur.

```tsx
// app/template.tsx
"use client";
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

### 7.1 Directional slide (route history'ye duyarlı)

```tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [direction, setDirection] = useState(1);
  const prev = useRef(pathname);

  useEffect(() => {
    setDirection(pathname.length > prev.current.length ? 1 : -1);
    prev.current = pathname;
  }, [pathname]);

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pathname}
        custom={direction}
        initial={(d: number) => ({ opacity: 0, x: d * 40 })}
        animate={{ opacity: 1, x: 0 }}
        exit={(d: number) => ({ opacity: 0, x: d * -40 })}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 8. Loading States

### 8.1 Skeleton

```tsx
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-700/60 ${className}`} />;
}

export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2 w-20" />
      </div>
    </div>
  );
}
```

### 8.2 Shimmer

```tsx
export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded bg-slate-800 ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
```

### 8.3 Skeleton → content morph

```tsx
import { AnimatePresence, motion } from "framer-motion";

export function AsyncCard({ data }: { data: User | null }) {
  return (
    <div className="relative h-24 w-full rounded-lg bg-slate-900 p-4">
      <AnimatePresence mode="wait">
        {data ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.3 }}
            className="space-y-1"
          >
            <div className="font-medium text-white">{data.name}</div>
            <div className="text-sm text-slate-400">{data.email}</div>
          </motion.div>
        ) : (
          <motion.div
            key="skeleton"
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-3 w-48" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 8.4 Spinner morph

```tsx
export function LoadingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-indigo-500"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
```

---

## 9. Micro-interactions

### 9.1 Hover lift kart

```tsx
<motion.div
  whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
  className="rounded-xl bg-slate-800 p-6"
>
  <h3 className="text-lg font-semibold text-white">Pro Plan</h3>
</motion.div>
```

### 9.2 İkon dönüşümlü buton

```tsx
export function SaveButton({ saving }: { saving: boolean }) {
  return (
    <motion.button
      disabled={saving}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-white"
    >
      <AnimatePresence mode="wait" initial={false}>
        {saving ? (
          <motion.span key="spinner" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}>
            <Spinner className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            ✓
          </motion.span>
        )}
      </AnimatePresence>
      {saving ? "Kaydediliyor" : "Kaydet"}
    </motion.button>
  );
}
```

### 9.3 Number count-up

```tsx
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString("tr-TR") + suffix);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
      return controls.stop;
    }
  }, [inView, to, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
```

### 9.4 Toggle switch

```tsx
export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-indigo-500" : "bg-slate-600"}`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        style={{ left: on ? "22px" : "2px" }}
      />
    </button>
  );
}
```

---

## 10. Stagger — Liste öğelerini sırayla göster

```tsx
const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function AnimatedTable({ rows }: { rows: Project[] }) {
  return (
    <motion.tbody variants={listVariants} initial="hidden" animate="show">
      {rows.map((r) => (
        <motion.tr key={r.id} variants={rowVariants} className="border-b border-slate-800">
          <td className="p-3">{r.name}</td>
          <td className="p-3">{r.status}</td>
        </motion.tr>
      ))}
    </motion.tbody>
  );
}
```

### 10.1 Word-by-word typewriter

```tsx
export function Typewriter({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.span
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={{ hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0 } }}
          className="inline-block"
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </motion.span>
  );
}
```

---

## 11. SVG Path Animations

```tsx
export function AnimatedCheck() {
  return (
    <motion.svg viewBox="0 0 24 24" className="h-8 w-8" initial="hidden" animate="show">
      <motion.path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          show: { pathLength: 1, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
        }}
      />
    </motion.svg>
  );
}
```

---

## 12. Easing Curves

### 12.1 Cubic-bezier preset'leri (Material 3 yaklaşımı)

```ts
export const easings = {
  // emphasized (Material 3 varsayılan)
  emphasized: [0.2, 0, 0, 1] as const,
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1] as const,
  emphasizedAccelerate: [0.3, 0, 0.8, 0.15] as const,
  // standard
  standard: [0.2, 0, 0, 1] as const,
  // apple ease
  easeOutApple: [0.16, 1, 0.3, 1] as const,
  // back-out (overshoot)
  backOut: [0.34, 1.56, 0.64, 1] as const,
};

// Kullanım
transition={{ duration: 0.4, ease: easings.emphasized }}
```

### 12.2 Karşılaştırma tablosu

| Easing | Kullanım |
|---|---|
| `linear` | Sadece progress bar / shimmer |
| `easeOut` (`[0, 0, 0.2, 1]`) | Giriş hareketleri (element ortaya çıkıyor) |
| `easeIn` (`[0.4, 0, 1, 1]`) | Çıkış hareketleri (element kayboluyor) |
| `emphasized` (`[0.2, 0, 0, 1]`) | Genel amaçlı vurgulu |
| `backOut` (`[0.34, 1.56, 0.64, 1]`) | Playful mikro-etkileşimler |
| `spring` | Doğal his, gesture cevapları |

---

## 13. Accessibility — `prefers-reduced-motion`

```tsx
import { MotionConfig } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {/* Kullanıcı sistemde hareket azalttıysa transform/opacity dışı animasyonlar otomatik kısılır */}
      {children}
    </MotionConfig>
  );
}
```

Manuel kontrol:

```tsx
import { useReducedMotion } from "framer-motion";

export function ParallaxSafe() {
  const reduce = useReducedMotion();
  const y = useTransform(...);
  return <motion.div style={{ y: reduce ? 0 : y }} />;
}
```

CSS fallback:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 14. Performance — Kritik Kurallar

1. **Sadece `transform` ve `opacity`** — `width`, `height`, `top`, `left`, `margin`, `padding` layout/paint tetikler.
2. **`will-change` az ve doğru kullan** — Sadece animasyon öncesi ekle, bitince çıkar.
3. **`layout` animations'da sınır koru** — Yüzlerce liste öğesinde `layout` kullanma.
4. **`useMotionValue` ile bypass et** — Her render'da React state güncellemek yerine MotionValue kullan.
5. **`content-visibility: auto`** — Off-screen uzun listelerde render maliyetini düşür.
6. **Animasyon offload için `useAnimationFrame`** — Yoğun hesaplamalarda requestAnimationFrame kullan.
7. **60 FPS kuralı** — Tek kare 16.6 ms'den uzun sürüyorsa `transform`/`opacity` dışına çıkma.

### 14.1 GPU-hint

```tsx
<motion.div
  style={{ willChange: "transform" }} // animasyon sırasında
  animate={{ x: 100 }}
  onAnimationComplete={() => {
    // animasyon bitince will-change'i temizle (performans)
  }}
/>
```

### 14.2 MotionValue ile direkt kontrol (re-render yok)

```tsx
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export function MouseFollower() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useTransform(y, [-300, 300], [15, -15]);
  const rotY = useTransform(x, [-300, 300], [-15, 15]);

  useEffect(() => {
    function move(e: MouseEvent) {
      x.set(e.clientX - window.innerWidth / 2);
      y.set(e.clientY - window.innerHeight / 2);
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 800 }}
      className="h-40 w-40 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500"
    />
  );
}
```

---

## 15. Kompozit Örnek — AI Stüdyo Chat Bubble

```tsx
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";

type Msg = { id: string; role: "user" | "ai"; text: string };

export function ChatStream({ messages, streaming }: { messages: Msg[]; streaming: boolean }) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col gap-3 p-4">
      <AnimatePresence initial={false} mode="popLayout">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            layout={!reduce}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 28,
              mass: 0.6,
            }}
            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              m.role === "user" ? "self-end bg-indigo-600 text-white" : "self-start bg-slate-800 text-slate-100"
            }`}
          >
            {m.text}
            {streaming && m.role === "ai" && (
              <motion.span
                className="ml-1 inline-block h-4 w-1 bg-current align-middle"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

---

## 16. Anti-Patterns — Kaçınılması Gerekenler

| Anti-pattern | Neden kötü | Doğrusu |
|---|---|---|
| `animate={{ width: 200 }}` | Layout recalculating | `scaleX` veya `width` yerine `x` + clip |
| `transition={{ duration: 1.2 }}` her şeyde | Yorgun hissettirir | UI için 200–500 ms |
| `whileHover` ile `box-shadow` değişimi | Paint | `filter: drop-shadow` veya pseudo-element |
| `<motion.div>` her şeyde (UI boş bir div) | Anlamsız motion component'i | Plain `<div>` + CSS transition |
| Stagger 0.5 saniye | Çok yavaş, dikkat dağıtıcı | 0.04–0.08 saniye |
| Loop animasyon her yerde | Distracting | Sadece loading / live indicator |
| `layoutId` sayfa bazlı her öğede | Karmaşık shared layout hesabı | Aynı view içinde sınırla |

---

## 17. Test & Debug

- **Framer Motion DevTools** — `npm i -D @motion-rn/devtools`
- **Performance panel** — Chrome → Rendering → Paint flashing & Frame meter
- **Are frame drops happening?** → `useMotionValue` + `useAnimationFrame` ile ölç

```tsx
function FrameMonitor() {
  const fps = useMotionValue(0);
  let last = performance.now();
  let frames = 0;

  useAnimationFrame(() => {
    frames++;
    const now = performance.now();
    if (now - last >= 1000) {
      fps.set(frames);
      frames = 0;
      last = now;
    }
  });

  return <motion.div>FPS: <motion.span>{fps}</motion.span></motion.div>;
}
```

---

## 18. Skill Çıktısı Beklentisi

Bu skill çağrıldığında AI şu çıktıyı üretmeli:

1. İlgili `motion` bileşeni + `variants`
2. `transition` (spring veya easing ile)
3. `AnimatePresence` (mount/unmount gerekliyse)
4. `prefers-reduced-motion` uyumu
5. `willChange` ve `transform`/`opacity` optimizasyonu
6. Kullanım yeri (hangi view, hangi state) hakkında kısa açıklama

Tüm örnekler TypeScript + React + Framer Motion olmalı, AI stüdyo teması (dark mode, slate/indigo palette) ile uyumlu renk sınıfları içermeli.

---

## 19. Hızlı Referans — Tüm API'ler

```tsx
// Motion components
<motion.div />
<motion.button />
<motion.svg />
<motion.path />
<Reorder.Group />
<Reorder.Item />

// Hooks
useScroll()
useInView()
useMotionValue()
useMotionValueEvent()
useSpring()
useTransform()
useVelocity()
useAnimationFrame()
useReducedMotion()
useTime()
useElementScroll() // deprecated → useScroll
useDragControls()

// Wrapper
<AnimatePresence mode="wait | popLayout | sync" />
<MotionConfig reducedMotion="user | always | never" transition={...} />

// Utilities
animate(value, target, options)
useAnimate() // scoped animation
```

---

## 20. Kapanış

Motion design bir arayüzün **ruhudur**. Doğru kullanıldığında kullanıcıya "buradayım, seni takip ediyorum" mesajı verir. Yanlış kullanıldığında yorgunluk, baş dönmesi ve güven kaybı yaratır.

Bu skill'in 3 ana çıktısı olmalı:
1. **Performans** — Sadece GPU-friendly property'ler, MotionValue ile re-render bypass.
2. **Empati** — `prefers-reduced-motion` her zaman, hareketin süresi/sertliği ergonomik.
3. **Anlam** — Her hareket bir durum değişikliğini anlatıyor olmalı. "Sadece güzel gözüksün" gerekçesi yeterli değil.

AI stüdyo arayüzünde bu skill her view için bir motion primitif seti sağlar. Yeni bir bileşen yazıldığında, bu skill'den alınan 4–5 primitif (FadeIn, Stagger, MagneticButton, Shimmer) ile %80 ihtiyaç karşılanır.
