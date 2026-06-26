/**
 * Code Snippets Library — sık kullanılan kod parçaları
 *
 * Kullanıcı kendi snippet'ini ekleyebilir, built-in'leri kullanabilir.
 * AI'a "snippet X ekle" diyerek kod içine enjekte edebilir.
 */

export interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  category: 'react' | 'next' | 'api' | 'auth' | 'ui' | 'test' | 'util' | 'custom';
  code: string;
  tags: string[];
  isBuiltin: boolean;
  createdAt: string;
  usageCount: number;
}

export const BUILTIN_SNIPPETS: Snippet[] = [
  {
    id: 'snip-react-usestate',
    title: 'useState hook',
    description: 'Temel useState hook kullanımı',
    language: 'tsx',
    category: 'react',
    code: `const [state, setState] = useState<T>(initialValue);

// Functional update
setState(prev => ({ ...prev, key: newValue }));

// Reset
setState(initialValue);`,
    tags: ['hook', 'state', 'react'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-react-useeffect',
    title: 'useEffect (mount + cleanup)',
    description: 'Mount anında çalış, unmount\'ta temizle',
    language: 'tsx',
    category: 'react',
    code: `useEffect(() => {
  // Mount
  const handler = (e: Event) => {};
  window.addEventListener('event', handler);

  return () => {
    // Unmount cleanup
    window.removeEventListener('event', handler);
  };
}, []); // dependency array`,
    tags: ['hook', 'effect', 'lifecycle'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-react-usecallback-memo',
    title: 'useCallback + useMemo',
    description: 'Performance optimization',
    language: 'tsx',
    category: 'react',
    code: `const expensiveValue = useMemo(() => {
  return computeExpensive(input);
}, [input]);

const handleClick = useCallback((e: React.MouseEvent) => {
  // ...
}, [dep1, dep2]);`,
    tags: ['hook', 'performance', 'memo'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-next-api-route',
    title: 'Next.js API Route',
    description: 'App Router API route örneği',
    language: 'ts',
    category: 'next',
    code: `import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Validate
  // Process
  return NextResponse.json({ ok: true });
}`,
    tags: ['api', 'route', 'next'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-next-server-action',
    title: 'Server Action',
    description: 'Next.js 14+ server action',
    language: 'ts',
    category: 'next',
    code: `'use server';

import { revalidatePath } from 'next/cache';

export async function submitForm(formData: FormData) {
  const data = Object.fromEntries(formData);
  // Validate
  // Save to DB
  revalidatePath('/path');
  return { success: true };
}`,
    tags: ['server', 'action', 'form'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-auth-jwt',
    title: 'JWT Auth Helper',
    description: 'JWT üretim ve doğrulama',
    language: 'ts',
    category: 'auth',
    code: `import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export function signToken(payload: object, expiresIn = '7d'): string {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken<T>(token: string): T | null {
  try {
    return jwt.verify(token, SECRET) as T;
  } catch {
    return null;
  }
}

// Usage
const token = signToken({ userId: '123' });
const payload = verifyToken<{ userId: string }>(token);`,
    tags: ['jwt', 'auth', 'token'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-auth-middleware',
    title: 'Auth Middleware',
    description: 'Next.js middleware ile auth kontrol',
    language: 'ts',
    category: 'auth',
    code: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Verify token...
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon|login|register).*)'],
};`,
    tags: ['middleware', 'auth', 'route-protection'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-ui-button',
    title: 'Button Component',
    description: 'Reusable button with variants',
    language: 'tsx',
    category: 'ui',
    code: `import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-border bg-transparent hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
);`,
    tags: ['button', 'component', 'ui', 'cva'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-ui-card',
    title: 'Card Component',
    description: 'Card with header/content/footer',
    language: 'tsx',
    category: 'ui',
    code: `import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}`,
    tags: ['card', 'component', 'ui'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-test-vitest',
    title: 'Vitest Test',
    description: 'Unit test örneği',
    language: 'ts',
    category: 'test',
    code: `import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  beforeEach(() => {
    // Setup
  });

  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click', async () => {
    const onClick = vi.fn();
    render(<Component onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});`,
    tags: ['test', 'vitest', 'unit'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-util-zod-schema',
    title: 'Zod Validation Schema',
    description: 'Tip-güvenli validation',
    language: 'ts',
    category: 'util',
    code: `import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter').max(50),
  email: z.string().email('Geçerli email girin'),
  age: z.number().int().min(18, '18 yaşından büyük olmalı').max(120),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  metadata: z.record(z.unknown()).optional(),
});

export type User = z.infer<typeof userSchema>;

// Usage
const result = userSchema.safeParse(input);
if (!result.success) {
  console.log(result.error.flatten());
}`,
    tags: ['zod', 'validation', 'schema', 'type-safe'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-util-error-boundary',
    title: 'Error Boundary',
    description: 'React error boundary',
    language: 'tsx',
    category: 'util',
    code: `'use client';

import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.propsFallback || (
        <div className="p-4 bg-red-500/10 text-red-500 rounded">
          <h2>Bir hata oluştu</h2>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}`,
    tags: ['error', 'boundary', 'react'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-api-prisma',
    title: 'Prisma CRUD',
    description: 'Type-safe veritabanı işlemleri',
    language: 'ts',
    category: 'api',
    code: `import { db } from '@/lib/db';

// Create
const user = await db.user.create({
  data: { name, email },
});

// Read (many)
const users = await db.user.findMany({
  where: { active: true },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: 0,
});

// Read (single)
const user = await db.user.findUnique({ where: { id } });

// Update
const updated = await db.user.update({
  where: { id },
  data: { name: newName },
});

// Delete
await db.user.delete({ where: { id } });

// Transaction
await db.$transaction([
  db.account.create({ data: {...} }),
  db.auditLog.create({ data: {...} }),
]);`,
    tags: ['prisma', 'database', 'crud'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'snip-api-rate-limit',
    title: 'Rate Limiting',
    description: 'Memory-based rate limiter',
    language: 'ts',
    category: 'api',
    code: `const requests = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, limit = 100, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = requests.get(identifier);

  if (!record || now > record.resetTime) {
    requests.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

// Usage in API route
const ip = req.headers.get('x-forwarded-for') || 'unknown';
const { allowed, remaining } = rateLimit(ip);
if (!allowed) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}`,
    tags: ['rate-limit', 'security', 'api'],
    isBuiltin: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
];

export const SNIPPET_CATEGORIES = [
  { id: 'react', label: 'React', icon: 'Code2', color: '#61dafb' },
  { id: 'next', label: 'Next.js', icon: 'Triangle', color: '#ffffff' },
  { id: 'api', label: 'API', icon: 'Server', color: '#10b981' },
  { id: 'auth', label: 'Auth', icon: 'Lock', color: '#ef4444' },
  { id: 'ui', label: 'UI', icon: 'Layout', color: '#a855f7' },
  { id: 'test', label: 'Test', icon: 'FlaskConical', color: '#f59e0b' },
  { id: 'util', label: 'Util', icon: 'Wrench', color: '#06b6d4' },
  { id: 'custom', label: 'Özel', icon: 'Star', color: '#84cc16' },
] as const;
