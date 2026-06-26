# Skill: Kod Kalitesi

```yaml
name: code-quality
version: 1.0.0
description: >
  SOLID, Clean Code, refactoring, TypeScript strict mode, React 19 pattern'leri,
  test, code review ve teknik borç yönetimi konusunda derin uzmanlık. AI stüdyo
  tarafından üretilen tüm kod bu skill'in standartlarına uymalıdır.
capabilities:
  - SOLID principles derin uygulaması
  - Clean Code (Robert Martin) kuralları
  - Refactoring patterns (Extract Method, Inline, Replace Conditional with Polymorphism)
  - TypeScript strict mode best practices
  - React 19 patterns (Server Components, Suspense, use())
  - Performance: React Compiler, useDeferredValue, useMemo correctly
  - Testing: Vitest, Playwright, MSW
  - Code review checklist
  - Technical debt management
  - Design patterns (Factory, Strategy, Observer, Command)
  - Code smell tespiti
  - Naming conventions
  - Error handling patterns
tools:
  - typescript@^5.5
  - react@^19
  - next@^16
  - vitest
  - playwright
  - msw
  - eslint
  - prettier
  - sonarqube
output_format: TypeScript + React
trigger_patterns:
  - "kod kalitesi"
  - "refactor"
  - "temiz kod"
  - "SOLID"
  - "code review"
  - "teknik borç"
  - "test yaz"
  - "TypeScript strict"
```

---

## 1. Felsefe — Kod Kalitesi Nedir?

Kod kalitesi, **bir sonraki geliştiricinin** kodu okuduğunda hissettiği **güven** ve **hız**'tır. Çalışan kod yetmez. Çalışan + okunabilir + değiştirilebilir + test edilebilir kod şart.

Michael Feathers'ın "Working Effectively with Legacy Code" tanımı: **"Test olmayan kod, legacy code'dur."** Yani kalite, teste erişilebilirlikten başlar.

Beş boyut:

1. **Okunabilirlik** — 6 ay sonra sen de anlamalı.
2. **Değiştirilebilirlik** — Yeni özellik başka yere bulaşmadan eklenmeli.
3. **Test edilebilirlik** — Birim test yazmak "zor" olmamalı.
4. **Performans** — Doğru veri yapısı + doğru algoritma.
5. **Güvenlik** — Kötü girdi, hatalı akış tasarımı olmamalı.

---

## 2. SOLID — Derin Uygulama

### 2.1 S — Single Responsibility

Bir sınıf/fonksiyon **tek bir nedenle** değişmeli.

```ts
// ❌ Kötü: Hem veri çeker hem formatlar hem e-posta atar
class UserProcessor {
  async run(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    const formatted = `${user.firstName} ${user.lastName}`.trim();
    await email.send(formatted, "Hoş geldiniz");
  }
}

// ✅ İyi: Üç ayrı sorumluluk
class UserFetcher {
  async byId(id: string) {
    return db.user.findUnique({ where: { id } });
  }
}
class UserFormatter {
  fullName(u: User): string {
    return `${u.firstName} ${u.lastName}`.trim();
  }
}
class WelcomeEmailSender {
  async send(name: string) {
    await email.send(name, "Hoş geldiniz");
  }
}
```

### 2.2 O — Open/Closed

Yeni davranış eklemek için mevcut kodu **değiştirme**, genişlet.

```ts
// ❌ Kötü: Her yeni ödeme tipinde switch büyüyor
function processPayment(type: string, amount: number) {
  if (type === "card") { /* ... */ }
  else if (type === "paypal") { /* ... */ }
  else if (type === "crypto") { /* ... */ }
}

// ✅ İyi: Strategy pattern — yeni tip eklemek için yeni sınıf
interface PaymentStrategy {
  pay(amount: number): Promise<PaymentResult>;
}
class CardPayment implements PaymentStrategy { /* ... */ }
class PayPalPayment implements PaymentStrategy { /* ... */ }
class CryptoPayment implements PaymentStrategy { /* ... */ }

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}
  process(amount: number) { return this.strategy.pay(amount); }
}
```

### 2.3 L — Liskov Substitution

Alt sınıf, üst sınıfın yerine geçtiğinde davranış bozulmamalı.

```ts
// ❌ Kötü: Klassik kare-dikdörtgen problemi
class Rectangle {
  constructor(protected w: number, protected h: number) {}
  setWidth(w: number) { this.w = w; }
  setHeight(h: number) { this.h = h; }
  area() { return this.w * this.h; }
}
class Square extends Rectangle {
  setWidth(w: number) { this.w = w; this.h = w; } // LSP ihlali
}

// ✅ İyi: Shape arayüzü, her şek kendi alanını hesaplar
interface Shape { area(): number; }
class Rectangle implements Shape {
  constructor(private w: number, private h: number) {}
  area() { return this.w * this.h; }
}
class Square implements Shape {
  constructor(private side: number) {}
  area() { return this.side ** 2; }
}
```

### 2.4 I — Interface Segregation

Kullanmayan metotlara bağımlılık olmasın.

```ts
// ❌ Kötü: "Şişman" arayüz
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}
// Robot sadece work'ü kullanacak, eat/sleep zorunlu

// ✅ İyi: Segrege
interface Workable { work(): void; }
interface Eatable { eat(): void; }
interface Sleepable { sleep(): void; }

class Robot implements Workable { work() {} }
class Human implements Workable, Eatable, Sleepable { /* ... */ }
```

### 2.5 D — Dependency Inversion

Yüksek seviye modül, düşük seviyeye bağımlı olmamalı. İkisi de soyutlamaya bağımlı olmalı.

```ts
// ❌ Kötü: NotificationService SMTP'ye gömülü
class NotificationService {
  private smtp = new SmtpClient();
  async send(msg: string) { await this.smtp.send(msg); }
}

// ✅ İyi: Soyutlama üzerinden
interface MessageTransport { send(msg: string): Promise<void>; }
class SmtpTransport implements MessageTransport { /* ... */ }
class SlackTransport implements MessageTransport { /* ... */ }

class NotificationService {
  constructor(private transport: MessageTransport) {}
  async send(msg: string) { await this.transport.send(msg); }
}
```

---

## 3. Clean Code Kuralları — Robert C. Martin

### 3.1 Anlamlı isimler

```ts
// ❌
const d = 5; // elapsed time in days
function fn(a: any[]) { /* ... */ }

// ✅
const ELAPSED_DAYS = 5;
function groupByCategory(items: Item[]): Record<string, Item[]> { /* ... */ }
```

**Kurallar:**
- İsim açıklama gerektirmemeli.
- Boolean için `is`, `has`, `can`, `should` prefix.
- Async fonksiyon için `async` suffix veya `fetch`/`load` prefix.
- Sınıf isimleri **isim**, metot isimleri **fiil**.

### 3.2 Kısa fonksiyonlar

- **20 satırı geçme.** Deep nested = yeniden düzenleme vakti.
- **Tek seviye indent.** Gerekirse erken return.

```ts
// ❌
function process(items: Item[]) {
  const result = [];
  for (const it of items) {
    if (it.active) {
      if (it.value > 100) {
        result.push(transform(it));
      }
    }
  }
  return result;
}

// ✅
function process(items: Item[]): Item[] {
  return items
    .filter((i) => i.active && i.value > 100)
    .map(transform);
}
```

### 3.3 Argüman sayısı

- 0–2 ideal. 3 nadiren. 4+ kaçınılmalı.
- 3+ parametre varsa **nesne parametresi** kullan.

```ts
// ❌
function createUser(firstName: string, lastName: string, email: string, role: string, age: number, dept: string) {}

// ✅
type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  age?: number;
  department?: string;
};
function createUser(input: CreateUserInput): User { /* ... */ }
```

### 3.4 Yan etki yok

```ts
// ❌ Hem kontrol hem değiştiriyor
function checkPassword(user: User, password: string): boolean {
  if (user.password === hash(password)) {
    user.lastLogin = new Date(); // yan etki!
    return true;
  }
  return false;
}

// ✅ Ayrılmış
function verifyPassword(user: User, password: string): boolean {
  return user.password === hash(password);
}
function updateLastLogin(user: User): void {
  user.lastLogin = new Date();
}
```

---

## 4. Refactoring Patterns

### 4.1 Extract Method

```ts
// Önce
function printReport(data: Report) {
  console.log("=== Report ===");
  console.log(`Date: ${data.date}`);
  console.log(`Total: ${data.total}`);
  console.log(`Items: ${data.items.length}`);
  // ... 50 satır
}

// Sonra
function printReport(data: Report) {
  printHeader(data);
  printBody(data);
  printFooter(data);
}
function printHeader(d: Report) { console.log("=== Report ==="); }
```

### 4.2 Inline Method

```ts
// Eğer metot isimden fazla karmaşa katmıyorsa
function getRating(driver: Driver) {
  return moreThanFiveLateDeliveries(driver) ? 2 : 1;
}
function moreThanFiveLateDeliveries(d: Driver) {
  return d.numberOfLateDeliveries > 5;
}
// → İçeri al
function getRating(driver: Driver) {
  return driver.numberOfLateDeliveries > 5 ? 2 : 1;
}
```

### 4.3 Replace Conditional with Polymorphism

```ts
// ❌
function calculatePay(employee: Employee) {
  switch (employee.type) {
    case "ENGINEER": return employee.monthlySalary;
    case "SALESMAN": return employee.monthlySalary + employee.commission;
    case "MANAGER": return employee.monthlySalary + employee.bonus;
  }
}

// ✅
abstract class Employee {
  abstract calculatePay(): number;
}
class Engineer extends Employee {
  calculatePay() { return this.monthlySalary; }
}
class Salesman extends Employee {
  calculatePay() { return this.monthlySalary + this.commission; }
}
```

### 4.4 Replace Magic Number with Symbolic Constant

```ts
// ❌
if (retries > 3) { /* ... */ }
const discount = price * 0.15;

// ✅
const MAX_RETRIES = 3;
const STUDENT_DISCOUNT_RATE = 0.15;
if (retries > MAX_RETRIES) { /* ... */ }
const discount = price * STUDENT_DISCOUNT_RATE;
```

### 4.5 Extract Class

Tek sınıf çok büyüdüyse, sorumlulukları ayır.

```ts
// ❌
class User {
  // 30 alan, 40 metot...
}

// ✅
class User { /* identity + profile */ }
class UserPreferences { /* theme, lang, notifications */ }
class UserSubscription { /* plan, billing, renewals */ }
```

---

## 5. TypeScript Strict Mode

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 5.1 `unknown` over `any`

```ts
// ❌
function parse(input: any) {
  return input.data; // hiçbir güvenlik yok
}

// ✅
function parse(input: unknown): ParsedResult {
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid input");
  }
  if (!("data" in input)) throw new Error("Missing data");
  return { data: input.data };
}

// Daha iyisi: zod
import { z } from "zod";
const Schema = z.object({ data: z.string() });
function parse(input: unknown) {
  return Schema.parse(input);
}
```

### 5.2 Discriminated unions

```ts
// ❌
type Result = { ok: boolean; data?: T; error?: string };

// ✅
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function handle<T>(r: Result<T>) {
  if (r.ok) {
    console.log(r.data); // TypeScript r.data'nın T olduğunu biliyor
  } else {
    console.log(r.error);
  }
}
```

### 5.3 Branded types — Domain tip güvenliği

```ts
type UserId = string & { readonly _brand: "UserId" };
type Email = string & { readonly _brand: "Email" };

function createUserId(s: string): UserId {
  if (!s.startsWith("u_")) throw new Error("Invalid id");
  return s as UserId;
}
function sendEmail(to: Email) { /* ... */ }

const uid = createUserId("u_123");
// sendEmail(uid); // ❌ Derleme hatası
```

### 5.4 `satisfies` operator

```ts
const config = {
  port: 3000,
  host: "localhost",
} satisfies ServerConfig; // Tip kontrolü + literal tipler korunur
```

### 5.5 Generic kısıtlamaları doğru

```ts
// ❌ T'nin hiç kısıtı yok
function getValue<T>(obj: any, key: string): T { return obj[key]; }

// ✅ Kısıtlı
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

---

## 6. React 19 Patterns

### 6.1 Server Components vs Client Components

Server Component (varsayılan): DB çağrısı, file system, secret.
Client Component: interaktivite, state, event handler.

```tsx
// app/users/page.tsx (Server Component)
import { db } from "@/lib/db";
export default async function UsersPage() {
  const users = await db.user.findMany();
  return <UserList users={users} />;
}

// app/users/UserList.tsx ("use client")
"use client";
import { useState } from "react";
export function UserList({ users }: { users: User[] }) {
  const [q, setQ] = useState("");
  return <input value={q} onChange={(e) => setQ(e.target.value)} />;
}
```

### 6.2 `use()` — Async değerleri bekleme

```tsx
import { use } from "react";

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspense boundary içinde çalışır
  return <h1>{user.name}</h1>;
}

// Wrapper
export default function Page() {
  const userPromise = fetchUser();
  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

### 6.3 Suspense — Streaming

```tsx
export default function Page() {
  return (
    <>
      <h1>Dashboard</h1>
      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <Table />
      </Suspense>
    </>
  );
}
```

### 6.4 React Compiler — Otomatik memoization

React 19'da React Compiler beta'da. Elle `useMemo`/`useCallback` çoğunlukla gereksiz.

```tsx
// React Compiler açıkken:
function FilterableList({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  // Compiler filtered'ı otomatik memoize eder
  const filtered = items.filter((i) => i.name.includes(q));
  return <List items={filtered} />;
}
```

### 6.5 `useDeferredValue` — Yüksek maliyetli render

```tsx
function Search({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const isStale = q !== deferredQ;

  const filtered = useMemo(
    () => items.filter((i) => i.name.includes(deferredQ)),
    [items, deferredQ]
  );

  return (
    <>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <ul style={{ opacity: isStale ? 0.6 : 1 }}>
        {filtered.map((i) => <li key={i.id}>{i.name}</li>)}
      </ul>
    </>
  );
}
```

### 6.6 `useMemo` doğru kullanımı

```tsx
// ❌ Gereksiz — primitive filter cheap
const sum = useMemo(() => a + b, [a, b]);

// ❌ Yan etki — dependency olarak kullanılmayan şey
const value = useMemo(() => fetchData(id), []);

// ✅ Pahalı hesaplama, referans eşitliği önemli
const filtered = useMemo(() => hugeList.filter(isExpensive), [hugeList]);

// ✅ Aynı objeyi referans olarak korumak (child memoization için)
const context = useMemo(() => ({ user, theme, lang }), [user, theme, lang]);
```

### 6.7 Custom hook kompozisyonu

```tsx
function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ loading: boolean; data?: T; error?: Error }>({
    loading: true,
  });

  useEffect(() => {
    let active = true;
    setState({ loading: true });
    fn()
      .then((data) => active && setState({ loading: false, data }))
      .catch((error) => active && setState({ loading: false, error }));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
```

---

## 7. Design Patterns — Pratik

### 7.1 Factory

```ts
type NotificationType = "email" | "sms" | "push";
abstract class Notification { abstract send(to: string, msg: string): Promise<void>; }
class EmailNotification extends Notification { /* ... */ }
class SMSNotification extends Notification { /* ... */ }

class NotificationFactory {
  static create(type: NotificationType): Notification {
    switch (type) {
      case "email": return new EmailNotification();
      case "sms": return new SMSNotification();
      case "push": return new PushNotification();
    }
  }
}
```

### 7.2 Strategy

```ts
interface PricingStrategy { calculate(price: number): number; }
class RegularPricing implements PricingStrategy {
  calculate(price: number) { return price; }
}
class StudentPricing implements PricingStrategy {
  calculate(price: number) { return price * 0.8; }
}
class VIPPricing implements PricingStrategy {
  calculate(price: number) { return price * 0.7; }
}

class Cart {
  constructor(private pricing: PricingStrategy) {}
  total(price: number) { return this.pricing.calculate(price); }
}
```

### 7.3 Observer

```ts
type Listener<T> = (payload: T) => void;
class EventEmitter<T> {
  private listeners = new Set<Listener<T>>();
  subscribe(l: Listener<T>) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
  emit(payload: T) {
    this.listeners.forEach((l) => l(payload));
  }
}

const events = new EventEmitter<{ type: string }>();
const unsub = events.subscribe((e) => console.log(e));
events.emit({ type: "hello" });
unsub();
```

### 7.4 Command

```ts
interface Command { execute(): Promise<void>; undo?(): Promise<void>; }

class CreateTaskCommand implements Command {
  constructor(private repo: TaskRepo, private task: Task) {}
  async execute() { await this.repo.create(this.task); }
  async undo() { await this.repo.delete(this.task.id); }
}

class CommandBus {
  private history: Command[] = [];
  async run(cmd: Command) {
    await cmd.execute();
    this.history.push(cmd);
  }
  async undoLast() {
    const cmd = this.history.pop();
    if (cmd?.undo) await cmd.undo();
  }
}
```

### 7.5 Repository

```ts
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
class PrismaUserRepository implements UserRepository {
  async findById(id: string) { return db.user.findUnique({ where: { id } }); }
  async save(user: User) { await db.user.upsert({ where: { id: user.id }, create: user, update: user }); }
}
```

---

## 8. Error Handling

### 8.1 Hata sınıfları hiyerarşisi

```ts
class AppError extends Error {
  constructor(public code: string, message: string, public statusCode = 500, public context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}
class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super("NOT_FOUND", `${resource} not found: ${id}`, 404, { resource, id });
  }
}
class ValidationError extends AppError {
  constructor(field: string, value: unknown) {
    super("VALIDATION_ERROR", `Invalid ${field}`, 422, { field, value });
  }
}
class UnauthorizedError extends AppError {
  constructor() { super("UNAUTHORIZED", "Authentication required", 401); }
}
```

### 8.2 Result tipi (functional)

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T> { return { ok: true, value }; }
function err<E>(error: E): Result<never, E> { return { ok: false, error }; }

async function getUser(id: string): Promise<Result<User>> {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return err(new NotFoundError("User", id));
  return ok(user);
}

const result = await getUser("123");
if (result.ok) {
  console.log(result.value);
} else {
  console.log(result.error.message);
}
```

### 8.3 Next.js API route

```ts
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = UserSchema.safeParse(body);
    if (!input.success) {
      return Response.json({ errors: input.error.flatten() }, { status: 422 });
    }
    const user = await userService.create(input.data);
    return Response.json(user, { status: 201 });
  } catch (e) {
    if (e instanceof AppError) {
      return Response.json({ code: e.code, message: e.message }, { status: e.statusCode });
    }
    console.error(e);
    return Response.json({ code: "INTERNAL", message: "Server error" }, { status: 500 });
  }
}
```

---

## 9. Testing

### 9.1 Vitest — Birim test

```ts
import { describe, it, expect, vi } from "vitest";
import { calculatePricing } from "./pricing";

describe("calculatePricing", () => {
  it("regular pricing returns base", () => {
    expect(calculatePricing(100, "regular")).toBe(100);
  });

  it("student pricing applies 20% discount", () => {
    expect(calculatePricing(100, "student")).toBe(80);
  });

  it("VIP pricing applies 30% discount", () => {
    expect(calculatePricing(100, "vip")).toBe(70);
  });

  it("throws on unknown type", () => {
    expect(() => calculatePricing(100, "unknown" as any)).toThrow();
  });
});
```

### 9.2 Mocking

```ts
import { vi } from "vitest";

const mockRepo = {
  findById: vi.fn().mockResolvedValue({ id: "1", name: "Ahmet" }),
  save: vi.fn().mockResolvedValue(undefined),
};

const service = new UserService(mockRepo as any);

it("updates user name", async () => {
  await service.rename("1", "Mehmet");
  expect(mockRepo.save).toHaveBeenCalledWith({ id: "1", name: "Mehmet" });
});
```

### 9.3 MSW — API mock

```ts
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/users/:id", ({ params }) => {
    return HttpResponse.json({ id: params.id, name: "Ahmet" });
  }),
  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...body, id: "new" }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 9.4 Playwright — E2E

```ts
import { test, expect } from "@playwright/test";

test("user can create project", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-testid="new-project"]');
  await page.fill('[data-testid="project-name"]', "Test Project");
  await page.click('button:has-text("Oluştur")');
  await expect(page.locator("h1")).toHaveText("Test Project");
});
```

### 9.5 Test piramidi

```
        /\
       /E2E\         ~%5 (kritik user flows)
      /------\
     /Integ.  \      ~%25 (API + DB)
    /----------\
   /   Unit     \    ~%70 (pure functions, business logic)
  /--------------\
```

---

## 10. Code Review Checklist

Bir PR incelenirken:

### 10.1 Doğruluk
- [ ] İş requirement'ı karşılanıyor mu?
- [ ] Edge case'ler düşünüldü mü? (boş, null, çok büyük, çok küçük)
- [ ] Hata durumları doğru yönetiliyor mu?

### 10.2 Tasarım
- [ ] SOLID ihlali var mı?
- [ ] Duplication var mı? (DRY)
- [ ] Magic number var mı?
- [ ] Fonksiyon çok uzun mu? (>50 satır)
- [ ] Sınıf çok büyük mü? (>500 satır)

### 10.3 Okunabilirlik
- [ ] İsimler anlamlı mı?
- [ ] Yorum gereksiz mi? (kod kendini açıklamalı)
- [ ] Yorum gerekli yerlerde (neden, ne değil)?

### 10.4 Güvenlik
- [ ] Input doğrulanıyor mu? (zod)
- [ ] Secret commit'lenmemiş mi?
- [ ] SQL injection ihtimali var mı?
- [ ] Auth check doğru mu?

### 10.5 Performans
- [ ] N+1 query var mı?
- [ ] Gereksiz re-render var mı?
- [ ] Large list virtualized mı?
- [ ] Bundle'a gereksiz bağımlılık eklenmiş mi?

### 10.6 Test
- [ ] Yeni kodun testi var mı?
- [ ] Coverage eşiği aşılıyor mu? (%80)
- [ ] E2E etkilenen akışlar için test güncellendi mi?

### 10.7 Bakım
- [ ] TODO/FIXME eklendi mi? Task ID ile?
- [ ] CHANGELOG güncellendi mi?
- [ ] Migration gerekli mi?

---

## 11. Technical Debt Yönetimi

### 11.1 Debt kategorileri

| Kategori | Açıklama | Strateji |
|---|---|---|
| **Intentional** | Bilerek ertelendi, kayıt altında | Task aç, sprint planla |
| **Unintentional** | Bilmeden birikti | Code review'da yakala |
| **Bit-rot** | Eski kod, framework güncel değil | Yükseltme planı |
| **Design debt** | Mimari kötü, genişletilemiyor | Yeniden tasarım |
| **Test debt** | Coverage düşük | Boyer-Moore yaklaşımla |
| **Doc debt** | Doküman yok | README + ADR |

### 11.2 Boy scout rule

Her PR'da **"olduğun yeri daha temiz bırak"**. Bir isim düzelt, bir metot çıkar, bir comment ekle.

### 11.3 Tech debt takibi

```ts
// @tech-debt: TD-456 — Burada payment service inline; saga'ya taşınacak.
// Hedef: 2026-Q3
// Etken: Sipariş hacmi 10k+/gün olduğunda kırılacak
```

```yaml
# .tech-debt.yml
items:
  - id: TD-456
    severity: high
    type: design
    description: "Payment service inline; saga'ya taşınacak"
    target_quarter: 2026Q3
    owner: payments-team
```

### 11.4 Debt servicing stratejileri

1. **Stop the bleeding** — Yeni debt oluşmasın (lint rules, ADR).
2. **Pay interest first** — En çok acı veren debt'i çöz.
3. **20% time** — Her sprint'in %20'si debt'e.
4. **Quarantine** — Yeni kod temiz, eski kod karantinada (test ekleene kadar).

---

## 12. Code Smells — Hızlı Tanı

| Smell | Belirti | Çözüm |
|---|---|---|
| Long method | >50 satır | Extract Method |
| Large class | >500 satır | Extract Class |
| Long parameter list | >4 parametre | Parameter Object |
| Duplicated code | Aynı blok 3+ yerde | Extract Method + base class |
| Shotgun surgery | Bir değişiklik 6+ dosyaya dokunuyor | Move/Combine |
| Feature envy | Metot diğer sınıfın verisiyle çok ilgileniyor | Move Method |
| Data class | Sınıf sadece data, davranış yok | Move behavior |
| Switch statements | Type-based switch | Polymorphism |
| Speculative generality | "Bir gün lazım olur" kodu | Sil (YAGNI) |
| Inappropriate intimacy | Sınıf diğerinin içine çok giriyor | Encapsulate |
| Dead code | Kullanılmayan | Sil |
| Primitive obsession | Her şey string/number | Value Object |

---

## 13. Naming Conventions

### 13.1 Files & folders

```
src/
  components/
    ui/
      Button.tsx          # PascalCase
      Button.test.tsx
    features/
      user/
        UserProfile.tsx
        user-service.ts   # kebab-case for non-component
  lib/
    deepseek.ts
  hooks/
    use-auth.ts
```

### 13.2 Variables & types

```ts
// PascalCase: Sınıf, Type, Interface, Enum, Component
class UserService {}
type User = {};
interface UserRepo {}
enum Role {}

// camelCase: değişken, fonksiyon, metot
const userCount = 0;
function fetchUser() {}

// UPPER_SNAKE: sabitler
const MAX_RETRY = 3;

// Branded tipler
type UserId = string & { readonly _brand: "UserId" };
```

---

## 14. Lint & Format — Otomatik

### 14.1 ESLint config

```js
// eslint.config.js
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  react.configs.recommended,
  {
    plugins: { "react-hooks": hooks },
    rules: {
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  }
);
```

### 14.2 Pre-commit

```yaml
# .husky/pre-commit
lint-staged:
  "*.{ts,tsx}":
    - eslint --fix
    - prettier --write
    - tsc --noEmit
```

---

## 15. ADR — Architecture Decision Records

Her önemli karar için bir ADR.

```markdown
# ADR-0042: Prisma yerine Drizzle seçimi

## Durum
2026-06-15, önerildi.

## Bağlam
Prisma migration hızı ve edge runtime desteği sorunlu.

## Karar
Drizzle ORM'a geçilecek.

## Sonuçlar
+ Edge runtime uyumlu
+ Daha hızlı migration
- Yeni öğrenme eğrisi
- Prisma Studio kaybı

## Revize
2026-08-01: Karar uygulandı, sorun yok.
```

---

## 16. Performance Patterns

### 16.1 N+1 query

```ts
// ❌ N+1
const users = await db.user.findMany();
for (const u of users) {
  u.posts = await db.post.findMany({ where: { userId: u.id } });
}

// ✅ Tek sorgu
const users = await db.user.findMany({ include: { posts: true } });
```

### 16.2 Pagination

```ts
// Cursor-based (büyük data için)
async function getPosts(cursor?: string, limit = 20) {
  return db.post.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
  });
}
```

### 16.3 Memoization — doğru

```ts
// ❌ Primitive cheap hesap
const sum = useMemo(() => a + b, [a, b]);

// ✅ Pahalı hesap
const sorted = useMemo(() => {
  return hugeArray.sort(expensiveCompare);
}, [hugeArray]);
```

### 16.4 Virtualization

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function BigList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });
  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: v.getTotalSize() }} className="relative">
        {v.getVirtualItems().map((vi) => (
          <div
            key={vi.key}
            ref={v.measureElement}
            data-index={vi.index}
            className="absolute top-0 left-0 w-full"
            style={{ transform: `translateY(${vi.start}px)` }}
          >
            {items[vi.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 17. Logging

### 17.1 Yapısal log

```ts
const logger = {
  info(msg: string, meta: Record<string, unknown> = {}) {
    console.log(JSON.stringify({ level: "info", msg, ...meta, ts: Date.now() }));
  },
  error(msg: string, err: unknown, meta: Record<string, unknown> = {}) {
    console.error(JSON.stringify({
      level: "error",
      msg,
      err: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
      ...meta,
      ts: Date.now(),
    }));
  },
};

// Kullanım
logger.info("user_created", { userId: "123", source: "signup" });
logger.error("payment_failed", err, { orderId: "456" });
```

### 17.2 Log seviyeleri

| Seviye | Ne zaman |
|---|---|
| `debug` | Sadece geliştirmede |
| `info` | Önemli business event'leri |
| `warn` | Beklenmedik ama tolere edilebilir |
| `error` | Hata, ama servis ayakta |
| `fatal` | Servis çöküyor |

PII loglama yok! (Email, telefon, kart no)

---

## 18. Kompozit Örnek — Production-ready Service

```ts
// domain/user.ts
export type User = {
  id: UserId;
  email: Email;
  name: string;
  role: Role;
  createdAt: Date;
};

// domain/user-repo.ts (port)
export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}

// infra/prisma-user-repo.ts (adapter)
export class PrismaUserRepository implements UserRepository {
  constructor(private db: PrismaClient) {}
  async findById(id: UserId) {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }
  async save(user: User) {
    await this.db.user.upsert({
      where: { id: user.id },
      create: toRow(user),
      update: toRow(user),
    });
  }
  async delete(id: UserId) {
    await this.db.user.delete({ where: { id } });
  }
}

// app/user-service.ts (use case)
export class UserService {
  constructor(private repo: UserRepository, private events: EventEmitter<DomainEvent>) {}

  async rename(id: UserId, newName: string): Promise<Result<User>> {
    if (newName.length < 2) return err(new ValidationError("name", newName));
    const user = await this.repo.findById(id);
    if (!user) return err(new NotFoundError("User", id));
    const updated = { ...user, name: newName };
    await this.repo.save(updated);
    this.events.emit({ type: "UserRenamed", userId: id, newName });
    return ok(updated);
  }
}

// api route
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = RenameSchema.safeParse(await req.json());
  if (!body.success) return Response.json({ errors: body.error.flatten() }, { status: 422 });

  const service = new UserService(userRepo, events);
  const result = await service.rename(createUserId(params.id), body.data.name);

  if (!result.ok) {
    const status = result.error instanceof NotFoundError ? 404 : 500;
    return Response.json({ code: result.error.code, message: result.error.message }, { status });
  }
  return Response.json(result.value);
}
```

Test:

```ts
describe("UserService.rename", () => {
  it("renames user", async () => {
    const repo: UserRepository = {
      findById: vi.fn().mockResolvedValue({ id: "u_1", name: "Old", email: "a@b.com", role: "USER", createdAt: new Date() }),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const events = new EventEmitter<DomainEvent>();
    const emit = vi.spyOn(events, "emit");

    const service = new UserService(repo, events);
    const result = await service.rename("u_1" as UserId, "New Name");

    expect(result.ok).toBe(true);
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ name: "New Name" }));
    expect(emit).toHaveBeenCalledWith({ type: "UserRenamed", userId: "u_1", newName: "New Name" });
  });

  it("rejects too short name", async () => {
    const service = new UserService({} as any, new EventEmitter());
    const result = await service.rename("u_1" as UserId, "x");
    expect(result.ok).toBe(false);
  });
});
```

---

## 19. Skill Çıktısı Beklentisi

Bu skill çağrıldığında AI:

1. SOLID ihlali varsa belirtir.
2. Code smell'leri listeler.
3. Refactoring önerisi verir (eski → yeni).
4. Test ekler (birim + integration).
5. Type safety artırır (`any` → `unknown` + zod).
6. Performans optimizasyonu önerir.
7. Naming düzeltir.
8. ADR gerekiyorsa draft verir.

Tüm çıktılar **TypeScript** ve **React 19** uyumlu olmalı.

---

## 20. Kapanış

Kod kalitesi bir hedef değil, **süreç**'tir. Hiçbir kod "mükemmel" değildir; ama her PR biraz daha iyi olabilir.

Bu skill'in 3 ana çıktısı:
1. **Tutum** — "Çalışıyor" yetmez; "Çalışıyor + bakımı kolay + test edilebilir + güvenli" şart.
2. **Disiplin** — SOLID, Clean Code, strict TS — kısayol yok.
3. **Süreklilik** — Tech debt görünür, planlı, ölçülebilir.

AI stüdyo arayüzünde bu skill her üretilen kod parçasında kendini gösterir. AI bu skill'i çağırdığında **"iyi kod nedir"** sorusunun cevabını hatırlar ve kalite standartlarından taviz vermez.

**Unutma:** İyi kod, gelecekteki kendine yazılmış bir sevgi mektubudur.
