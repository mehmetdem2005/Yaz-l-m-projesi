# Skill: Güvenlik Hardening

```yaml
name: security-hardening
version: 1.0.0
description: >
  OWASP Top 10, input validation, SQL injection, XSS, CSRF, SSRF, authentication,
  cryptography, secrets management ve dependency scanning konusunda derin güvenlik
  uzmanlığı. AI stüdyo tüm güvenlik kararlarını bu skill üzerinden alır.
capabilities:
  - OWASP Top 10 her biri için kod örnekleri ve mitigation
  - Input validation (zod, valibot)
  - SQL injection prevention (parameterized queries, Prisma)
  - XSS prevention (CSP, sanitization, Trusted Types)
  - CSRF prevention (SameSite, CSRF tokens)
  - SSRF prevention (allowlist, DNS pinning)
  - Authentication best practices (session, JWT, OAuth 2.0)
  - Cryptography (when to use what)
  - Secrets management (env, vault)
  - Dependency vulnerability scanning
  - Rate limiting & DDoS protection
  - Security headers
  - Audit logging
tools:
  - zod
  - valibot
  - prisma
  - bcrypt
  - argon2
  - jose (JWT)
  - helmet
  - dompurify
  - snyk
  - trivy
  - gitleaks
output_format: TypeScript + Node.js + Next.js
trigger_patterns:
  - "güvenlik"
  - "OWASP"
  - "SQL injection"
  - "XSS"
  - "CSRF"
  - "authentication"
  - "encryption"
  - "secret"
  - "hardening"
  - "vulnerability"
```

---

## 1. Güvenlik Felsefesi — Defense in Depth

Tek bir savunma katmanı yeterli değildir. Saldırgan bir katmanı aştığında, arkadaki katman onu durdurmalı.

```
[Network] → [WAF] → [API Gateway] → [Auth] → [App Logic] → [Input Validation]
   → [Business Logic] → [DB Layer] → [Encryption at rest] → [Audit Log]
```

7 temel prensip:

1. **Least privilege** — En az yetki. Sadece gerekli.
2. **Defense in depth** — Çoklu katman.
3. **Fail secure** — Hata olduğunda güvenli tarafa düş.
4. **Secure by default** — Varsayılan açık değil, kapalı.
5. **Don't trust user input** — Asla.
6. **Audit everything** — İz bırakın.
7. **Assume breach** — Zaten içerdeler. Ne yaparız?

---

## 2. OWASP Top 10 (2021) — Her Madde

### A01: Broken Access Control

**Sorun:** Kullanıcı, izni olmayan kaynağa erişiyor.

```ts
// ❌ Kötü: ID'ye güveniyor
app.get("/api/users/:id", (req, res) => {
  const user = db.user.findById(req.params.id);
  res.json(user);
});

// ✅ İyi: Auth + ownership check
app.get("/api/users/:id", auth(), async (req, res) => {
  const id = UserIdSchema.parse(req.params.id);
  if (req.user.role !== "ADMIN" && req.user.id !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const user = await userService.findById(id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});
```

**Ek kontroller:**
- IDOR (Insecure Direct Object Reference) — her nesne erişiminde yetki.
- Role-based (RBAC) veya Attribute-based (ABAC) kontrol.
- Server-side enforcement — client-side UI gizleme yeterli değil.

### A02: Cryptographic Failures

**Sorun:** Zayıf şifreleme, yanlış anahtar yönetimi.

```ts
// ❌ MD5, SHA1 — kırılmış
const hash = crypto.createHash("md5").update(password).digest("hex");

// ❌ ECB mode — pattern sızdırır
const cipher = crypto.createCipheriv("aes-128-ecb", key, null);

// ✅ Argon2id password hashing
import argon2 from "argon2";
const hashedPassword = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
});

// ✅ AES-256-GCM for data at rest
import crypto from "crypto";
const algorithm = "aes-256-gcm";
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv(algorithm, key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
const tag = cipher.getAuthTag();
// iv + tag + encrypted birlikte sakla

// ✅ TLS 1.3 zorunlu
const server = https.createServer({
  ...opts,
  minVersion: "TLSv1.3",
  ciphers: [
    "TLS_AES_256_GCM_SHA384",
    "TLS_CHACHA20_POLY1305_SHA256",
    "TLS_AES_128_GCM_SHA256",
  ].join(":"),
}, app);
```

**Approved algorithms (2026):**
- **Symmetric**: AES-256-GCM, ChaCha20-Poly1305
- **Asymmetric**: Ed25519, RSA-3072+, ECDSA-P256
- **Hash**: SHA-256, SHA-384, SHA-512, BLAKE3
- **Password**: Argon2id, scrypt (yedek)
- **KDF**: HKDF, PBKDF2 (>600k iterasyon)
- **Deprecated**: MD5, SHA1, RC4, DES, 3DES, ECB mode

### A03: Injection

**Sorun:** SQL, NoSQL, Command, LDAP enjeksiyonu.

```ts
// ❌ SQL injection
const sql = `SELECT * FROM users WHERE email = '${email}'`;
db.query(sql);

// ✅ Parameterized query
db.query("SELECT * FROM users WHERE email = $1", [email]);

// ✅ Prisma otomatik parametrize
await db.user.findUnique({ where: { email } });

// ❌ Command injection
exec(`ls ${userDir}`);

// ✅ execFile + arg array
import { execFile } from "child_process";
execFile("ls", [userDir], (err, stdout) => { /* ... */ });

// ✅ NoSQL — Mongo operators engelle
function safeFind(filter: unknown) {
  const s = JSON.stringify(filter);
  if (s.includes("$")) throw new Error("Invalid filter");
  return filter;
}
```

### A04: Insecure Design

**Sorun:** Mimari düzeyde güvenlik açığı.

**Çözüm:** Threat modeling (STRIDE), secure design patterns, security user stories.

```ts
// Threat modeling örneği — her user story için "abuse case"
// Story: "Kullanıcı şifre sıfırlayabilsin"
// Abuse: "Saldırgan sonsuz denemeyle hesap kilitleyebilir"
// Mitigation: Rate limit + CAPTCHA + lockout + IP allowlist
```

### A05: Security Misconfiguration

**Sorun:** Default şifreler, açık debug, gereksiz header.

```ts
// ✅ Helmet ile güvenli header'lar
import helmet from "helmet";
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-abc123'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.deepseek.com"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  strictTransportSecurity: {
    maxAge: 63072000, // 2 yıl
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "no-referrer" },
}));

// ✅ Production'da debug kapat
if (process.env.NODE_ENV === "production") {
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ error: "Internal error" });
  });
}
```

### A06: Vulnerable & Outdated Components

```bash
# npm audit
npm audit --audit-level=high

# Snyk
npx snyk test

# Dependabot (GitHub)
# .github/dependabot.yml
```

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    allow:
      - dependency-type: "direct"
```

### A07: Identification & Authentication Failures

```ts
// ✅ Argon2id password hashing
// ✅ MFA (TOTP, WebAuthn)
import speakeasy from "speakeasy";

// TOTP setup
const secret = speakeasy.generateSecret({ length: 32 });
const otpauth = secret.otpauth_url;

// Verify
const valid = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: "base32",
  token: userInput,
  window: 1, // ±30s
});

// ✅ Session management
import { randomBytes } from "crypto";
const sessionId = randomBytes(32).toString("hex");
// httpOnly, Secure, SameSite=Strict cookie
res.cookie("session", sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 3600 * 1000, // 1 saat
});

// ✅ Brute force koruması
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dk
  max: 5, // 5 deneme
  message: "Çok fazla deneme, sonra dene",
});
app.post("/login", limiter, /* ... */);
```

### A08: Software & Data Integrity Failures

**Sorun:** Güvenilmeyen kaynak, imzasız güncelleme.

```ts
// ✅ Subresource Integrity
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-abc..."
  crossorigin="anonymous"></script>

// ✅ Signed commits (git)
// git config commit.gpgsign true
// git config tag.gpgsign true

// ✅ Container image signing (cosign)
// cosign sign --key cosign.key myimage:latest
```

### A09: Security Logging & Monitoring Failures

```ts
// Audit log
const auditLog = {
  auth: (event: AuthEvent) => logger.info("auth_event", event),
  dataAccess: (event: DataAccessEvent) => logger.info("data_access", event),
  admin: (event: AdminEvent) => logger.warn("admin_event", event),
};

// Login
auditLog.auth({
  userId: user.id,
  action: "login_success",
  ip: req.ip,
  userAgent: req.get("user-agent"),
  timestamp: new Date(),
});

// Failed login
auditLog.auth({
  userId: attemptedUserId,
  action: "login_failed",
  reason: "invalid_password",
  ip: req.ip,
});
```

### A10: Server-Side Request Forgery (SSRF)

```ts
// ❌ Kötü
const data = await fetch(userUrl);

// ✅ Allowlist + private IP kontrolü
import { lookup } from "node:dns/promises";
import { isIP } from "net";

const ALLOWED_PROTOCOLS = ["https:"];
const ALLOWED_DOMAINS = ["api.deepseek.com", "api.openai.com"];

async function safeFetch(urlStr: string): Promise<Response> {
  const url = new URL(urlStr);
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) throw new Error("Protocol not allowed");
  if (!ALLOWED_DOMAINS.includes(url.hostname)) throw new Error("Domain not allowed");

  // DNS resolve → private IP'ye düşmüyor mu?
  const { address } = await lookup(url.hostname);
  if (isPrivateIP(address)) throw new Error("Private IP blocked");

  // DNS pinning: gerçek IP'ye bağlan
  const response = await fetch(urlStr, {
    headers: { Host: url.hostname },
    // TLS SNI için özel agent
  });
  return response;
}

function isPrivateIP(ip: string): boolean {
  // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16, ::1
  const parts = ip.split(".").map(Number);
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 169 && parts[1] === 254) return true;
  if (parts[0] === 0) return true;
  return false;
}
```

---

## 3. Input Validation — Zod & Valibot

### 3.1 Zod şemaları

```ts
import { z } from "zod";

// Temel
const email = z.string().email().max(254).toLowerCase();
const password = z.string()
  .min(12, "En az 12 karakter")
  .regex(/[A-Z]/, "En az 1 büyük harf")
  .regex(/[a-z]/, "En az 1 küçük harf")
  .regex(/[0-9]/, "En az 1 rakam")
  .regex(/[^A-Za-z0-9]/, "En az 1 özel karakter");

// Nesne
const SignupSchema = z.object({
  email,
  password,
  name: z.string().min(2).max(80),
  age: z.number().int().min(18).max(120).optional(),
  role: z.enum(["user", "admin"]).default("user"),
  tags: z.array(z.string()).max(10).default([]),
});

type SignupInput = z.infer<typeof SignupSchema>;

// API route
export async function POST(req: Request) {
  const result = SignupSchema.safeParse(await req.json());
  if (!result.success) {
    return Response.json({ errors: result.error.flatten() }, { status: 422 });
  }
  // result.data artık tip-güvenli
}
```

### 3.2 Valibot (daha küçük bundle)

```ts
import { object, string, email, minLength, pipe, parse } from "valibot";

const LoginSchema = object({
  email: pipe(string(), email(), minLength(5)),
  password: pipe(string(), minLength(8)),
});

const result = parse(LoginSchema, input);
```

### 3.3 Custom refinements

```ts
const PhoneSchema = z.string().refine(
  (v) => /^\+90\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(v),
  "Geçersiz Türk telefonu"
);

const DateRangeSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
}).refine((d) => d.end > d.start, { message: "end > start olmalı", path: ["end"] });
```

### 3.4 Query & params

```ts
const ListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().max(100).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = ListSchema.parse(Object.fromEntries(url.searchParams));
  // ...
}
```

---

## 4. SQL Injection — Derin

### 4.1 Raw query tehlikesi

```ts
// ❌
db.$queryRaw`SELECT * FROM users WHERE name = '${name}'`;

// ✅ Prisma.raw değil, tagged template ile parametrize
const result = await db.$queryRaw`SELECT * FROM users WHERE name = ${name}`;

// ✅ Prisma client API
await db.user.findFirst({ where: { name } });
```

### 4.2 LIKE sorguları

```ts
// ❌ Wildcard injection
const users = await db.user.findMany({
  where: { name: { contains: userInput } },
});
// userInput: "%" → tüm kayıtlar

// ✅ Escape et veya regex kullan
const escaped = userInput.replace(/[%_\\]/g, "\\$&");
const users = await db.user.findMany({
  where: { name: { contains: escaped } },
});
```

### 4.3 Mass assignment

```ts
// ❌
const user = await db.user.update({
  where: { id },
  data: req.body, // saldırgan { role: "admin" } gönderebilir
});

// ✅ Whitelist
const UpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
}).strict(); // ekstra alan reddet

const data = UpdateSchema.parse(req.body);
await db.user.update({ where: { id }, data });
```

---

## 5. XSS — Cross-Site Scripting

### 5.1 Stored XSS

```ts
// ❌ HTML içeren input'i render
<div dangerouslySetInnerHTML={{ __html: userBio }} />

// ✅ DOMPurify ile sanitize
import DOMPurify from "isomorphic-dompurify";
const cleanBio = DOMPurify.sanitize(userBio, {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "a"],
  ALLOWED_ATTR: ["href"],
});

// ✅ Tercihen: HTML değil, markdown
import { marked } from "marked";
const html = marked.parse(userMarkdown);
const clean = DOMPurify.sanitize(html);
```

### 5.2 Reflected XSS — URL param

```tsx
// ❌
<div>{searchQuery}</div> // React zaten escape eder ama attribute'larda dikkat
<a href={userUrl}>Link</a>

// ✅ URL validation
function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch { return false; }
}
```

### 5.3 CSP — Content Security Policy

```ts
// nonce tabanlı CSP
import crypto from "crypto";

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce;
  res.setHeader("Content-Security-Policy", [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `connect-src 'self' https://api.deepseek.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `require-trusted-types-for 'script'`,
  ].join("; "));
  next();
});
```

### 5.4 Trusted Types

```ts
// policy tanımla
if (window.trustedTypes) {
  window.trustedTypes.createPolicy("default", {
    createHTML: (s) => DOMPurify.sanitize(s),
    createScript: (s) => s, // sadece kendi kodun
    createScriptURL: (s) => s,
  });
}
```

---

## 6. CSRF — Cross-Site Request Forgery

### 6.1 SameSite cookie

```ts
res.cookie("session", sid, {
  httpOnly: true,
  secure: true,
  sameSite: "strict", // veya lax
  path: "/",
});
```

### 6.2 Double-submit cookie

```ts
// 1. CSRF token üret
const csrfToken = crypto.randomBytes(32).toString("hex");
res.cookie("csrf", csrfToken, {
  httpOnly: false, // JS erişsin
  secure: true,
  sameSite: "strict",
});

// 2. Client her isteğe header olarak ekler
fetch("/api/data", {
  headers: { "X-CSRF-Token": csrfToken },
});

// 3. Server doğrular
function csrfMiddleware(req, res, next) {
  const cookieToken = req.cookies.csrf;
  const headerToken = req.headers["x-csrf-token"];
  if (!cookieToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: "CSRF" });
  }
  next();
}
```

### 6.3 Synchronizer token (session-based)

```ts
const session = await getSession(req);
if (req.method !== "GET" && req.headers["x-csrf-token"] !== session.csrfToken) {
  return res.status(403).json({ error: "Invalid CSRF" });
}
```

---

## 7. SSRF — Derin

### 7.1 Allowlist pattern

```ts
const URL_ALLOWLIST = new Set([
  "api.deepseek.com",
  "api.openai.com",
  "api.anthropic.com",
]);

async function safeExternalFetch(urlStr: string, opts?: RequestInit) {
  const url = new URL(urlStr);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Protocol not allowed");
  }
  if (!URL_ALLOWLIST.has(url.hostname)) {
    throw new Error(`Domain ${url.hostname} not allowlisted`);
  }
  // Port kısıtı
  if (url.port && !["80", "443", ""].includes(url.port)) {
    throw new Error("Port not allowed");
  }
  // DNS resolve, private IP kontrolü
  const addresses = await dns.lookup(url.hostname, { all: true });
  for (const a of addresses) {
    if (isPrivateIP(a.address)) throw new Error("Resolves to private IP");
  }
  return fetch(urlStr, opts);
}
```

### 7.2 Image proxy (webhook avatars vb.)

```ts
app.get("/api/avatar", async (req, res) => {
  const url = z.string().url().parse(req.query.url);
  if (!URL_ALLOWLIST.has(new URL(url).hostname)) {
    return res.status(403).end();
  }
  const img = await fetch(url);
  // Content-Type doğrula
  const ct = img.headers.get("content-type");
  if (!ct?.startsWith("image/")) return res.status(400).end();
  // Boyut sınırla
  const cl = parseInt(img.headers.get("content-length") ?? "0");
  if (cl > 1024 * 1024) return res.status(413).end();
  res.setHeader("Content-Type", ct);
  res.setHeader("Cache-Control", "public, max-age=86400");
  // Stream ama copy değil, transform et (re-size)
  // Saldırgan polyglot PNG gönderirse → sadece pixel verisi işle
  const buffer = Buffer.from(await img.arrayBuffer());
  // sharp ile re-encode
  const clean = await sharp(buffer).resize(128, 128).png().toBuffer();
  res.end(clean);
});
```

---

## 8. Authentication

### 8.1 Session-based (önerilen web için)

```ts
import { randomBytes } from "crypto";
import { sessionStorage } from "@/lib/session-store";

async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError();
  const ok = await argon2.verify(user.password, password);
  if (!ok) throw new UnauthorizedError();
  // Timing-safe comparison
  const sid = randomBytes(32).toString("base64url");
  await sessionStorage.set(sid, { userId: user.id, role: user.role }, 3600);
  return sid;
}

// Cookie set
res.cookie("sid", sid, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 3600 * 1000,
  path: "/",
});
```

### 8.2 JWT — Doğru kullanım

```ts
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Sign (kısa ömürlü access token)
const token = await new SignJWT({ sub: user.id, role: user.role })
  .setProtectedHeader({ alg: "ES256", typ: "JWT" })
  .setIssuedAt()
  .setIssuer("https://api.studio.com")
  .setAudience("https://studio.com")
  .setExpirationTime("15m")
  .sign(secret);

// Verify
const { payload } = await jwtVerify(token, secret, {
  issuer: "https://api.studio.com",
  audience: "https://studio.com",
  algorithms: ["ES256"],
});
```

**JWT anti-patterns:**
- ❌ Long-lived token'lar (90 gün)
- ❌ `alg: none`
- ❌ State storage (JWT'de session verisi yok)
- ❌ HS256 (gizli anahtar client'ta)
- ✅ Short access (15 dk) + refresh token (7 gün, rotate)
- ✅ RS256/ES256 (asymmetric)

### 8.3 OAuth 2.0

```ts
// PKCE flow (mobile/SPA)
import crypto from "crypto";
const codeVerifier = crypto.randomBytes(32).toString("base64url");
const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");

// 1. Auth URL'ye yönlendir
const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
authUrl.searchParams.set("redirect_uri", "https://studio.com/callback");
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", "openid email profile");
authUrl.searchParams.set("code_challenge", codeChallenge);
authUrl.searchParams.set("code_challenge_method", "S256");
authUrl.searchParams.set("state", csrfState);

// 2. Callback'te code'u exchange et
const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: "https://studio.com/callback",
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  }),
});
const tokens = await tokenRes.json();
```

### 8.4 MFA — WebAuthn (FIDO2)

```ts
// Registration
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";

const options = await generateRegistrationOptions({
  rpName: "AI Studio",
  rpID: "studio.com",
  userID: user.id,
  userName: user.email,
  attestationType: "none",
  authenticatorSelection: {
    userVerification: "required",
    residentKey: "preferred",
  },
});

// Verify
const verified = await verifyRegistrationResponse({
  response: clientResponse,
  expectedChallenge: storedChallenge,
  expectedOrigin: "https://studio.com",
  expectedRPID: "studio.com",
});
```

---

## 9. Cryptography — Karar Matrisi

| Senaryo | Algoritma | Notlar |
|---|---|---|
| Password hashing | Argon2id | memoryCost 64MB, timeCost 3, parallelism 4 |
| API key/secret storage | AES-256-GCM | KMS/HSM ile anahtar yönetimi |
| JWT signing | ES256 (P-256) | Asymmetric, public verify |
| TLS | TLS 1.3 | min 1.3, AEAD ciphers |
| File hash | SHA-256 | bütünlük için |
| HMAC | HMAC-SHA-256 | API imza |
| Random ID | crypto.randomBytes(32) | UUID v4 yeterli değil |
| Salt | crypto.randomBytes(16) | Her password için ayrı |
| TOTP secret | base32, 160-bit | 30s window |
| Key derivation | HKDF-SHA-256 | master → child key |

### 9.1 Constant-time karşılaştırma

```ts
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

// API key kontrolü
if (!safeCompare(apiKey, expectedKey)) {
  // timing leak yok
  throw new UnauthorizedError();
}
```

### 9.2 Encrypt-then-MAC

```ts
function encrypt(plaintext: string, key: Buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // iv (12) + tag (16) + enc
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

function decrypt(b64: string, key: Buffer) {
  const data = Buffer.from(b64, "base64");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const enc = data.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
```

---

## 10. Secrets Management

### 10.1 Env dosyası

```bash
# .env.local (gitignored)
DEEPSEEK_API_KEY=sk-xxx
DATABASE_URL=postgresql://...
JWT_SECRET=<32+ bytes base64>
```

### 10.2 Schema ile doğrulama

```ts
// lib/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production", "test"]),
  DEEPSEEK_API_KEY: z.string().startsWith("sk-").min(20),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NEXTAUTH_SECRET: z.string().min(32),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid env:", parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
```

### 10.3 Vault (HashiCorp / AWS Secrets Manager)

```ts
// AWS Secrets Manager
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "eu-central-1" });

async function getSecret(name: string): Promise<Record<string, string>> {
  const res = await client.send(new GetSecretValueCommand({ SecretId: name }));
  return JSON.parse(res.SecretString ?? "{}");
}

const db = await getSecret("prod/database");
// db.host, db.user, db.password
```

### 10.4 Rotation

```ts
// API key rotation — overlap window
class ApiKeyRotator {
  private current: string;
  private next: string;
  private rotateAt: Date;

  constructor(current: string, next: string, rotateAt: Date) {
    this.current = current;
    this.next = next;
    this.rotateAt = rotateAt;
  }

  get(): string {
    if (new Date() >= this.rotateAt) {
      this.current = this.next;
      // Yeni "next" çek
      void this.fetchNext();
    }
    return this.current;
  }

  private async fetchNext() { /* ... */ }
}
```

### 10.5 Secret scanning

```bash
# pre-commit
gitleaks protect --staged

# CI
gitleaks detect --source . --report-path leaks.json
```

---

## 11. Dependency Scanning

### 11.1 NPM audit

```bash
npm audit --audit-level=high --omit=dev
```

### 11.2 Snyk

```bash
snyk test --severity-threshold=high
snyk monitor  # sürekli izleme
snyk code test  # SAST
```

### 11.3 SBOM (CycloneDX)

```bash
npx @cyclonedx/cyclonedx-npm --output-file bom.json
```

### 11.4 Renovate / Dependabot

```json
// renovate.json
{
  "extends": ["config:base", ":semanticCommits"],
  "schedule": ["before 6am on Monday"],
  "vulnerabilityAlerts": { "enabled": true },
  "packageRules": [
    { "matchUpdateTypes": ["major"], "dependencyDashboardApproval": true }
  ]
}
```

---

## 12. Rate Limiting

```ts
// Next.js edge
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 req / 10s
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  const { success, reset } = await ratelimit.limit(ip);
  if (!success) {
    return Response.json({ error: "Rate limit" }, {
      status: 429,
      headers: { "X-RateLimit-Reset": reset.toString() },
    });
  }
  // ...
}
```

### 12.1 Çok katmanlı

```ts
// IP-bazlı (DDoS)
const ipLimit = rateLimit({ windowMs: 60000, max: 100 });

// User-bazlı (abuse)
const userLimit = rateLimit({ windowMs: 60000, max: 30, keyGenerator: (req) => req.user.id });

// Endpoint-bazlı
const loginLimit = rateLimit({ windowMs: 900000, max: 5 }); // 5/15dk
```

---

## 13. Security Headers — Tüm Liste

```ts
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  // CSP de ayrıca
  next();
});
```

---

## 14. Audit Logging

```ts
type AuditEvent = {
  timestamp: Date;
  actor: { type: "user" | "system" | "api"; id: string };
  action: string;
  resource: { type: string; id: string };
  result: "success" | "failure";
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

class AuditLogger {
  constructor(private sink: (e: AuditEvent) => Promise<void>) {}

  async log(e: AuditEvent) {
    await this.sink({
      ...e,
      timestamp: e.timestamp ?? new Date(),
    });
  }
}

// Kullanım
await audit.log({
  timestamp: new Date(),
  actor: { type: "user", id: req.user.id },
  action: "user.delete",
  resource: { type: "user", id: targetUserId },
  result: "success",
  ip: req.ip,
  userAgent: req.get("user-agent"),
});

// Append-only storage (S3 Object Lock, WORM)
```

---

## 15. Threat Modeling — STRIDE

| Threat | Tip | Örnek | Mitigation |
|---|---|---|---|
| **S**poofing | Kimliğe sahtekarlık | Phishing login | MFA, WebAuthn |
| **T**ampering | Veri değiştirme | DB'ye enjeksiyon | Validation, signing |
| **R**epudiation | İnkâr | "Bunu yapmadım" | Audit log, imza |
| **I**nfo Disclosure | Bilgi sızıntısı | Hata mesajında stack | Generic errors |
| **D**oS | Hizmet dışı | Rate limit aşımı | Rate limit, WAF |
| **E**oP | Yetki yükseltme | IDOR | AuthZ check |

Örnek:
```ts
// Veri akışı: User → API → DB
// Spoof: JWT çalındı → mitigation: refresh token rotation + IP binding
// Tampering: Body'de role: "admin" → mitigation: strict schema
// Repudiation: "O para transferini yapmadım" → mitigation: imzalı audit log
// Info Disclosure: Hata stack sızdırma → mitigation: production mode error
// DoS: Sonsuz istek → mitigation: rate limit + WAF
// EoP: /api/users/123 → başkasının verisi → mitigation: ownership check
```

---

## 16. Secure Deployment

### 16.1 Container

```dockerfile
# Multi-stage, non-root, distroless
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs20-runtime
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER nonroot
EXPOSE 3000
CMD ["server.js"]
```

### 16.2 Image scanning

```bash
trivy image myapp:latest --severity HIGH,CRITICAL
```

### 16.3 Admission control

```yaml
# Kyverno policy: image signature required
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-images
spec:
  rules:
    - name: verify-signature
      match:
        resources:
          kinds: [Pod]
      verifyImages:
        - imageReferences: ["registry.example.com/*"]
          attestors:
            - entries:
                - keys:
                    publicKeys: |-
                      -----BEGIN PUBLIC KEY-----
                      ...
```

---

## 17. Privacy — GDPR / KVKK

```ts
// Data minimization
async function getUserName(id: UserId): Promise<string> {
  // ❌ Tüm alanları getirme
  // const user = await db.user.findUnique({ where: { id } });
  // ✅ Sadece gerekli alan
  const user = await db.user.findUnique({
    where: { id },
    select: { name: true },
  });
  return user?.name ?? "";
}

// PII encryption
async function storeEmail(raw: string) {
  const encrypted = await encrypt(raw, kmsKey);
  await db.user.update({ where: { id }, data: { emailEncrypted: encrypted } });
}

// Right to erasure (GDPR Art. 17)
async function deleteUserData(userId: UserId) {
  await db.$transaction([
    db.message.deleteMany({ where: { userId } }),
    db.project.deleteMany({ where: { ownerId: userId } }),
    db.user.delete({ where: { id: userId } }),
  ]);
  // Backup'larından da sil (veya anonimleştir)
  await backup.anonymize(userId);
  await audit.log({ /* ... */ });
}
```

---

## 18. Kompozit Örnek — Hardened Login Flow

```ts
// app/api/login/route.ts
import { z } from "zod";
import argon2 from "argon2";
import { Ratelimit } from "@upstash/ratelimit";
import { randomBytes } from "crypto";
import { audit, sessionStore, db, env } from "@/lib/infra";

const LoginSchema = z.object({
  email: z.string().email().max(254).toLowerCase(),
  password: z.string().min(1).max(1024),
  mfaCode: z.string().regex(/^\d{6}$/).optional(),
});

const limiter = new Ratelimit({
  redis: redisFromEnv(),
  limiter: Ratelimit.slidingWindow(5, "900 s"),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";

  // 1. Rate limit
  const rl = await limiter.limit(`login:${ip}`);
  if (!rl.success) {
    return Response.json({ error: "Too many attempts" }, {
      status: 429,
      headers: { "X-RateLimit-Reset": rl.reset.toString() },
    });
  }

  // 2. Validate input
  const parsed = LoginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten() }, { status: 422 });
  }
  const { email, password, mfaCode } = parsed.data;

  // 3. Find user (constant time)
  const user = await db.user.findUnique({
    where: { email },
    include: { mfa: true },
  });
  // Timing saldırısı için dummy hash
  const dummyHash = "$argon2id$v=19$m=65536,t=3,p=4$xxx";
  const passwordOk = await argon2.verify(user?.password ?? dummyHash, password);

  if (!user || !passwordOk) {
    await audit.log({
      timestamp: new Date(),
      actor: { type: "user", id: user?.id ?? email },
      action: "auth.login_failed",
      resource: { type: "session", id: "n/a" },
      result: "failure",
      ip,
      userAgent: req.headers.get("user-agent") ?? "",
      metadata: { reason: "invalid_credentials" },
    });
    // Generic error — leak yok
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 4. MFA check
  if (user.mfa?.enabled) {
    if (!mfaCode) {
      return Response.json({ mfaRequired: true }, { status: 200 });
    }
    const valid = speakeasy.totp.verify({
      secret: user.mfa.secret,
      encoding: "base32",
      token: mfaCode,
      window: 1,
    });
    if (!valid) {
      await audit.log({ /* ... mfa_failed */ });
      return Response.json({ error: "Invalid MFA" }, { status: 401 });
    }
  }

  // 5. Create session
  const sid = randomBytes(32).toString("base64url");
  await sessionStore.set(sid, {
    userId: user.id,
    role: user.role,
    ip,
    createdAt: new Date(),
  }, 3600);

  // 6. Audit
  await audit.log({
    timestamp: new Date(),
    actor: { type: "user", id: user.id },
    action: "auth.login_success",
    resource: { type: "session", id: sid },
    result: "success",
    ip,
    userAgent: req.headers.get("user-agent") ?? "",
  });

  // 7. Set cookie
  return Response.json({ ok: true }, {
    headers: {
      "Set-Cookie": `sid=${sid}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
    },
  });
}
```

---

## 19. Skill Çıktısı Beklentisi

Bu skill çağrıldığında AI:

1. Tehdit modeli (STRIDE) yazar.
2. Input validation schema'sı (zod) üretir.
3. AuthZ kontrolü ekler.
4. Crypto pattern doğru seçer (Argon2id, AES-GCM, vb.).
5. Rate limit + audit log ekler.
6. CSP + güvenli header'lar önerir.
7. Dependency risk analizi yapar.
8. Privacy (GDPR) değerlendirmesi yapar.

Tüm çıktılar **TypeScript + Next.js** ve **OWASP uyumlu** olmalı.

---

## 20. Kapanış

Güvenlik **bir özellik değil, bir kültür**'dür. SDLC'nin her aşamasında olmalı:

- **Tasarım**: Threat modeling, secure design
- **Geliştirme**: Input validation, output encoding, secure libs
- **Test**: SAST, DAST, fuzzing, penetration test
- **Dağıtım**: Image signing, admission control, secrets vault
- **İşletim**: WAF, monitoring, incident response
- **Bakım**: Dependency scanning, patching, audit review

AI stüdyo arayüzünde bu skill her API route, her DB sorgusu, her user input, her auth kararında kendini gösterir. **"Çalışıyor" yeterli değil — "Saldırı altında da güvenli" olmalı.**

**Unutma:** Savunma tek katmanlı değildir. Saldırgan bir katmanı aşar; senin işin arkadaki katmanları doğru kurmak. Defense in depth, fail secure, assume breach.
