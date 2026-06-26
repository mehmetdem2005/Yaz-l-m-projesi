# Skill: Enterprise Architecture

```yaml
name: enterprise-architecture
version: 1.0.0
description: >
  DDD, CQRS, Event Sourcing, microservices, hexagonal/clean architecture,
  API design, message queues, database design, caching ve observability
  konusunda derin enterprise mimari uzmanlığı. AI stüdyo tüm mimari
  kararlarını bu skill üzerinden alır.
capabilities:
  - Domain-Driven Design (DDD) — Bounded Context, Aggregate, Value Object
  - CQRS + Event Sourcing
  - Microservices patterns (Saga, Outbox, CQRS)
  - Hexagonal Architecture (Ports & Adapters)
  - Clean Architecture
  - API design (REST, GraphQL, gRPC)
  - Message queue patterns (RabbitMQ, Kafka, SQS)
  - Database design (Normalization, Sharding, Replication)
  - Caching strategies (Cache-aside, Write-through, Write-behind)
  - Observability (Logs, Metrics, Traces — OpenTelemetry)
  - System design trade-offs
  - Scalability patterns
tools:
  - typescript
  - prisma
  - kafka
  - rabbitmq
  - redis
  - opentelemetry
  - graphql
  - grpc
output_format: TypeScript + System Diagrams
trigger_patterns:
  - "mimari"
  - "DDD"
  - "CQRS"
  - "microservices"
  - "saga"
  - "event sourcing"
  - "clean architecture"
  - "sharding"
  - "scalability"
  - "observability"
```

---

## 1. Mimari Felsefesi — "İhtiyaca Göre Mimari"

Enterprise mimari tek bir doğru cevap değil, **ihtiyaca göre trade-off**'ların bilinçli yapılmasıdır. 

Üç temel soru:
1. **Kaç kullanıcı / ne yük?** — 100 RPS mi, 100k RPS mi?
2. **Domain karmaşıklığı?** — CRUD mu, çok adımlı süreç mi?
3. **Takım büyüklüğü?** — 3 kişi mi, 30 ekip mi?

Yanıtlara göre:

| Senaryo | Önerilen Mimari |
|---|---|
| Küçük SaaS, CRUD | Monolith + modüler klasör |
| Orta SaaS, domain karmaşası | Modular monolith + DDD |
| Çok takım, yüksek yük | Microservices + DDD |
| Çok sayıda okuma | CQRS + cache |
| Finansal, audit gerekli | Event Sourcing |
| Real-time, IoT | Event-driven + streaming |

**İlk kural:** Mümkün olan en basit mimariyle başla. Karmaşıklık gerçek bir ihtiyaç olarak doğduğunda ekle.

---

## 2. Domain-Driven Design (DDD)

### 2.1 Strategic Design

Domain'i alt bölümlere ayırma sanatı.

**Bounded Context** — Bir modelin tek bir anlama sahip olduğu sınırlar.

Örnek: E-ticaret'te "Product" farklı bağlamlarda farklı şeydir:
- **Catalog Context**: Product = { name, description, images, category }
- **Inventory Context**: Product = { sku, stockLevel, warehouse }
- **Ordering Context**: Product = { id, price, snapshot }
- **Shipping Context**: Product = { id, weight, dimensions }

Her context kendi modeline, kendi DB'sine, kendi takımına sahip.

```ts
// Catalog context
export class Product {
  constructor(
    public readonly id: ProductId,
    private name: string,
    private description: string,
    private images: Image[],
    private category: CategoryId,
  ) {}

  rename(newName: string) {
    if (newName.length < 2) throw new Error("Too short");
    this.name = newName;
    DomainEvents.publish(new ProductRenamed(this.id, newName));
  }
}

// Inventory context — farklı Product
export class InventoryItem {
  constructor(
    public readonly sku: SKU,
    private stock: number,
    private warehouse: WarehouseId,
  ) {}
  reserve(qty: number) { /* ... */ }
}
```

### 2.2 Context Mapping

Bağlamlar arası ilişki tipleri:

- **Shared Kernel** — İki bağlam ortak model paylaşıyor (riskli).
- **Customer-Supplier** — Bir bağlam (upstream) diğerini (downstream) besler.
- **Conformist** — Downstream upstream'e boyun eğmiş.
- **Anticorruption Layer (ACL)** — Downstream, upstream modelini kendi modeline çevirir.
- **Open Host Service** — Upstream, herkese açık protokol sunar.
- **Published Language** — Standartlaşmış dil (JSON:API, GraphQL schema).

```ts
// ACL örneği — Legacy API'yi kendi modeline çevir
class LegacyUserAdapter implements UserRepository {
  constructor(private legacyApi: LegacyApiClient) {}

  async findById(id: UserId): Promise<User | null> {
    const raw = await this.legacyApi.getUser(id);
    if (!raw) return null;
    // Dönüşüm — legacy format → domain model
    return new User(
      new UserId(raw.user_id),
      raw.email_addr,
      raw.full_name,
      this.mapStatus(raw.state),
    );
  }

  private mapStatus(s: string): UserStatus {
    switch (s) {
      case "ACTIVE": return "active";
      case "DELETED": return "deleted";
      default: return "unknown";
    }
  }
}
```

### 2.3 Tactical Building Blocks

| Block | Açıklama |
|---|---|
| **Entity** | Kimliği olan, yaşam süresince aynı kalan |
| **Value Object** | İçeriği belirler, immutable |
| **Aggregate** | Birlikte değişen entity cluster'ı |
| **Aggregate Root** | Aggregate'a dışarıdan tek erişim noktası |
| **Domain Event** | Domain'de olan geçmiş olay |
| **Repository** | Aggregate'lerin lifecycle yönetimi |
| **Factory** | Karmaşık aggregate yaratma |
| **Service** | Entity'ye ait olmayan domain operasyonu |

### 2.4 Value Object

```ts
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    if (amount < 0) throw new Error("Negative money");
    if (!["USD", "EUR", "TRY"].includes(currency)) throw new Error("Invalid currency");
  }

  static create(amount: number, currency: string) {
    return new Money(Math.round(amount * 100) / 100, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error("Currency mismatch");
    return Money.create(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}

// Kullanım
const price = Money.create(99.99, "USD");
const tax = price.multiply(0.18);
const total = price.add(tax);
```

### 2.5 Aggregate — Tutarlılık sınırları

```ts
// Order aggregate — OrderItem'lar Order olmadan var olamaz
export class Order {
  private items: OrderItem[] = [];
  private status: OrderStatus = "pending";

  private constructor(
    public readonly id: OrderId,
    public readonly customerId: CustomerId,
  ) {}

  static create(customerId: CustomerId): Order {
    const order = new Order(OrderId.generate(), customerId);
    DomainEvents.publish(new OrderCreated(order.id, customerId));
    return order;
  }

  // Tüm değişiklik aggregate root üzerinden
  addItem(productId: ProductId, qty: number, price: Money): void {
    if (this.status !== "pending") throw new Error("Cannot modify submitted order");
    if (qty <= 0) throw new Error("Invalid quantity");
    const existing = this.items.find((i) => i.productId.equals(productId));
    if (existing) {
      existing.increaseQuantity(qty);
    } else {
      this.items.push(new OrderItem(productId, qty, price));
    }
  }

  submit(): void {
    if (this.items.length === 0) throw new Error("Empty order");
    if (this.status !== "pending") throw new Error("Already submitted");
    this.status = "submitted";
    DomainEvents.publish(new OrderSubmitted(this.id, this.total()));
  }

  total(): Money {
    return this.items.reduce((sum, i) => sum.add(i.subtotal()), Money.create(0, "USD"));
  }
}

export class OrderItem {
  constructor(
    public readonly productId: ProductId,
    private quantity: number,
    private unitPrice: Money,
  ) {}

  increaseQuantity(qty: number) { this.quantity += qty; }
  subtotal(): Money { return this.unitPrice.multiply(this.quantity); }
}
```

### 2.6 Repository

```ts
export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
}

// Prisma implementation
export class PrismaOrderRepository implements OrderRepository {
  constructor(private db: PrismaClient) {}

  async findById(id: OrderId): Promise<Order | null> {
    const row = await this.db.order.findUnique({
      where: { id: id.value },
      include: { items: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(order: Order): Promise<void> {
    const snapshot = this.toPersistence(order);
    await this.db.$transaction([
      this.db.order.upsert({
        where: { id: snapshot.id },
        create: snapshot,
        update: snapshot,
      }),
    ]);
  }

  private toDomain(row: OrderRow): Order { /* reconstruct */ }
  private toPersistence(order: Order): OrderRow { /* serialize */ }
}
```

---

## 3. CQRS — Command Query Responsibility Segregation

Yazma (command) ve okuma (query) modellerini ayır.

### 3.1 Neden?

- **Farklı ölçeklenebilirlik** — Okuma 10x daha fazla.
- **Farklı optimization** — Write: normalization, integrity. Read: denormalization, hız.
- **Farklı security** — Write strict auth, read public.

```ts
// Command side
export class PlaceOrderHandler {
  constructor(
    private orderRepo: OrderRepository,
    private inventory: InventoryService,
    private eventBus: EventBus,
  ) {}

  async handle(cmd: PlaceOrderCommand): Promise<OrderId> {
    // Stok kontrolü
    for (const item of cmd.items) {
      const available = await this.inventory.getStock(item.productId);
      if (available < item.qty) throw new OutOfStockError(item.productId);
    }

    const order = Order.create(cmd.customerId);
    cmd.items.forEach((i) => order.addItem(i.productId, i.qty, i.price));
    order.submit();

    await this.orderRepo.save(order);
    return order.id;
  }
}

// Query side — read model
export class OrderListQuery {
  constructor(private db: PrismaClient) {}

  async execute(customerId: string, page: number): Promise<OrderListItem[]> {
    return this.db.orderListItem.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
    });
  }
}
```

### 3.2 Read model sync — Projection

```ts
// OrderSubmitted event → read model update
class OrderListProjection {
  constructor(private db: PrismaClient) {}

  async onOrderCreated(e: OrderCreated) {
    await this.db.orderListItem.create({
      data: {
        id: e.orderId.value,
        customerId: e.customerId.value,
        status: "pending",
        total: 0,
        itemCount: 0,
        createdAt: new Date(),
      },
    });
  }

  async onOrderSubmitted(e: OrderSubmitted) {
    await this.db.orderListItem.update({
      where: { id: e.orderId.value },
      data: { status: "submitted", total: e.total.amount },
    });
  }
}
```

---

## 4. Event Sourcing

Durumu **olayların toplamı** olarak sakla. Her state değişikliği bir event.

### 4.1 Avantajlar / Dezavantajlar

✅ Tam audit trail  
✅ Time travel (geçmişe dön)  
✅ Yeni read model'ler event'lerden yeniden üretilebilir  
✅ Event'ler diğer sistemler tarafından tüketilebilir  

❌ Karmaşıklık  
❌ Storage büyür  
❌ Snapshot gerekli  
❌ Event schema evolution zor  

### 4.2 Implementasyon

```ts
// Event store
export interface EventStore {
  append(streamId: string, events: DomainEvent[], expectedVersion?: number): Promise<void>;
  read(streamId: string): Promise<StoredEvent[]>;
}

export class PostgresEventStore implements EventStore {
  constructor(private db: PrismaClient) {}

  async append(streamId: string, events: DomainEvent[], expectedVersion?: number): Promise<void> {
    await this.db.$transaction(async (tx) => {
      // Optimistic concurrency
      const current = await tx.event.count({ where: { streamId } });
      if (expectedVersion !== undefined && current !== expectedVersion) {
        throw new ConcurrencyError(`Expected ${expectedVersion}, got ${current}`);
      }
      await tx.event.createMany({
        data: events.map((e, i) => ({
          streamId,
          version: current + i + 1,
          type: e.constructor.name,
          payload: JSON.stringify(e),
          occurredAt: new Date(),
        })),
      });
    });
  }

  async read(streamId: string): Promise<StoredEvent[]> {
    return this.db.event.findMany({
      where: { streamId },
      orderBy: { version: "asc" },
    });
  }
}

// Aggregate — event'lerden rehidrate
export class OrderAR {
  private state: OrderState = { status: "new", items: [], total: 0 };
  private changes: DomainEvent[] = [];

  get version() { return this._version; }
  private _version = 0;

  static rehydrate(events: StoredEvent[]): OrderAR {
    const order = new OrderAR();
    for (const e of events) {
      order.apply(JSON.parse(e.payload), false);
      order._version = e.version;
    }
    return order;
  }

  place(customerId: string, items: CartItem[]) {
    if (this.state.status !== "new") throw new Error("Already placed");
    this.apply({ type: "OrderPlaced", customerId, items, total: items.reduce((s, i) => s + i.price * i.qty, 0) }, true);
  }

  private apply(event: any, isNew: boolean) {
    switch (event.type) {
      case "OrderPlaced":
        this.state = { status: "placed", items: event.items, total: event.total };
        break;
      case "OrderShipped":
        this.state.status = "shipped";
        break;
    }
    if (isNew) this.changes.push(event);
  }

  getChanges() { return this.changes; }
}

// Snapshot — performans
export class OrderSnapshotStore {
  async save(orderId: string, state: OrderState, version: number) {
    await this.db.snapshot.upsert({
      where: { orderId },
      create: { orderId, state: JSON.stringify(state), version },
      update: { state: JSON.stringify(state), version },
    });
  }

  async load(orderId: string): Promise<{ state: OrderState; version: number } | null> {
    const s = await this.db.snapshot.findUnique({ where: { orderId } });
    return s ? { state: JSON.parse(s.state), version: s.version } : null;
  }
}

// Rehydrate with snapshot
async function loadOrder(id: string): Promise<OrderAR> {
  const snap = await snapshotStore.load(id);
  const events = snap
    ? await eventStore.readAfter(id, snap.version)
    : await eventStore.read(id);
  const order = OrderAR.rehydrate(events);
  if (snap) order.restoreSnapshot(snap.state, snap.version);
  return order;
}
```

---

## 5. Hexagonal Architecture (Ports & Adapters)

Domain logic dış dünyadan habersiz. Dış dünya adapter'lar üzerinden bağlanır.

```
[ Web API ]  →  [Port]  →  [Domain]  ←  [Port]  ←  [DB Adapter]
                                            ↑
                                       [Test Adapter]
```

```ts
// Domain — port tanımları
export interface EmailPort {
  send(to: string, subject: string, body: string): Promise<void>;
}

export interface ClockPort {
  now(): Date;
}

export class PasswordResetService {
  constructor(
    private userRepo: UserRepository,
    private email: EmailPort,
    private clock: ClockPort,
  ) {}

  async request(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return; // Silent fail — info leak yok
    const token = generateToken();
    const expires = new Date(this.clock.now().getTime() + 3600_000);
    user.requestPasswordReset(token, expires);
    await this.userRepo.save(user);
    await this.email.send(user.email, "Reset", `Token: ${token}`);
  }
}

// Adapter — production
export class SmtpEmailAdapter implements EmailPort {
  async send(to: string, subject: string, body: string) {
    await nodemailer.createTransport(/* ... */).sendMail({ to, subject, html: body });
  }
}

// Adapter — test
export class InMemoryEmailAdapter implements EmailPort {
  sent: { to: string; subject: string; body: string }[] = [];
  async send(to: string, subject: string, body: string) {
    this.sent.push({ to, subject, body });
  }
}

// Test
const email = new InMemoryEmailAdapter();
const service = new PasswordResetService(userRepo, email, systemClock);
await service.request("a@b.com");
expect(email.sent).toHaveLength(1);
```

---

## 6. Clean Architecture (Uncle Bob)

6 katman, dıştan içe:

1. **Frameworks & Drivers** — Next.js, Express, DB
2. **Interface Adapters** — Controllers, Presenters, Gateways
3. **Use Cases (Application)** — Application business rules
4. **Domain (Entities)** — Enterprise business rules

Bağımlılık **daima içe** doğru.

```ts
// Layer 4: Entity
export class User {
  constructor(public readonly id: string, private email: string, private role: Role) {}
  canPerform(action: Action): boolean { /* pure business rule */ }
}

// Layer 3: Use case
export class DeleteUserUseCase {
  constructor(
    private userRepo: UserRepository,  // interface (port)
    private auditLog: AuditLogger,
  ) {}
  async execute(id: string, actorId: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError();
    if (user.id === actorId) throw new Error("Cannot delete self");
    await this.userRepo.delete(id);
    await this.auditLog.log({ actor: actorId, action: "user.delete", target: id });
  }
}

// Layer 2: Interface adapter — controller
export class UserController {
  constructor(private deleteUser: DeleteUserUseCase) {}
  async handleDelete(req: Request, res: Response) {
    await this.deleteUser.execute(req.params.id, req.user.id);
    res.status(204).end();
  }
}

// Layer 1: Framework — main.ts
const userRepo = new PrismaUserRepository(prisma);
const auditLog = new AuditLoggerImpl();
const deleteUser = new DeleteUserUseCase(userRepo, auditLog);
const controller = new UserController(deleteUser);
app.delete("/users/:id", auth, (req, res) => controller.handleDelete(req, res));
```

---

## 7. Microservices Patterns

### 7.1 Saga — Distributed Transaction

Tek DB'de ACID yok; saga ile eventual consistency.

**Choreography** — Her servis event dinler, kendi event'ini yayınlar.

```ts
// Order Service
async function placeOrder(order: Order) {
  await orderRepo.save(order);
  await eventBus.publish(new OrderCreated(order.id, order.total));
}

// Payment Service — listens OrderCreated
async function onOrderCreated(e: OrderCreated) {
  try {
    await chargeCard(e.customerId, e.total);
    await eventBus.publish(new PaymentSucceeded(e.orderId));
  } catch (err) {
    await eventBus.publish(new PaymentFailed(e.orderId, err.message));
  }
}

// Inventory Service — listens OrderCreated
async function onOrderCreated(e: OrderCreated) {
  for (const item of e.items) {
    const reserved = await reserve(item.sku, item.qty);
    if (!reserved) {
      await eventBus.publish(new InventoryFailed(e.orderId, item.sku));
      return;
    }
  }
  await eventBus.publish(new InventoryReserved(e.orderId));
}

// Order Service — listens PaymentFailed, InventoryFailed
async function onPaymentFailed(e: PaymentFailed) {
  await compensatingActions(e.orderId); // cancel reservation
  await markOrderFailed(e.orderId);
}
```

**Orchestration** — Merkezi orchestrator.

```ts
class OrderSagaOrchestrator {
  async execute(orderId: string) {
    try {
      await this.call("inventory.reserve", { orderId });
      await this.call("payment.charge", { orderId });
      await this.call("shipping.schedule", { orderId });
      await this.markCompleted(orderId);
    } catch (e) {
      await this.compensate(orderId);
    }
  }

  private async compensate(orderId: string) {
    await this.call("shipping.cancel", { orderId });
    await this.call("payment.refund", { orderId });
    await this.call("inventory.release", { orderId });
    await this.markFailed(orderId);
  }
}
```

### 7.2 Outbox Pattern

Yerel DB transaction ve event publish atomik olmalı.

```ts
async function placeOrder(order: Order) {
  await db.$transaction(async (tx) => {
    await tx.order.create({ data: order });
    await tx.outbox.create({
      data: {
        type: "OrderCreated",
        payload: JSON.stringify(order),
        createdAt: new Date(),
      },
    });
  });
}

// Background worker — outbox → message broker
async function outboxRelay() {
  while (true) {
    const events = await db.outbox.findMany({ take: 100, orderBy: { id: "asc" } });
    for (const e of events) {
      await kafka.publish("orders", e.type, JSON.parse(e.payload));
      await db.outbox.delete({ where: { id: e.id } });
    }
    await sleep(1000);
  }
}
```

### 7.3 Idempotency

```ts
// Aynı idempotency-key ile tekrar eden istekler aynı sonucu döner
async function handlePayment(req: Request) {
  const idempotencyKey = req.headers["idempotency-key"];
  if (!idempotencyKey) return Response.json({ error: "Missing key" }, { status: 400 });

  const existing = await db.idempotencyRecord.findUnique({
    where: { key: idempotencyKey },
  });
  if (existing) {
    return Response.json(existing.response, { status: existing.status });
  }

  const result = await processPayment(req.body);
  await db.idempotencyRecord.create({
    data: {
      key: idempotencyKey,
      response: JSON.stringify(result.body),
      status: result.status,
      expiresAt: new Date(Date.now() + 86400_000),
    },
  });
  return Response.json(result.body, { status: result.status });
}
```

### 7.4 Circuit Breaker

```ts
class CircuitBreaker {
  private failures = 0;
  private state: "closed" | "open" | "half-open" = "closed";
  private openedAt?: Date;

  constructor(
    private maxFailures = 5,
    private resetTimeout = 30_000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.openedAt!.getTime() > this.resetTimeout) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit open");
      }
    }
    try {
      const result = await fn();
      this.failures = 0;
      this.state = "closed";
      return result;
    } catch (e) {
      this.failures++;
      if (this.failures >= this.maxFailures) {
        this.state = "open";
        this.openedAt = new Date();
      }
      throw e;
    }
  }
}

const paymentBreaker = new CircuitBreaker();
const result = await paymentBreaker.execute(() => callPaymentAPI());
```

### 7.5 Service Discovery

```ts
// Consul / Kubernetes DNS
async function getServiceUrl(name: string): Promise<string> {
  const res = await fetch(`http://consul:8500/v1/health/service/${name}?passing=true`);
  const services = await res.json();
  if (services.length === 0) throw new Error("No healthy instance");
  const s = services[Math.floor(Math.random() * services.length)];
  return `http://${s.Service.Address}:${s.Service.Port}`;
}
```

---

## 8. API Design

### 8.1 REST — Best practices

```
GET    /api/orders              # list
POST   /api/orders              # create
GET    /api/orders/:id          # get one
PATCH  /api/orders/:id          # partial update
PUT    /api/orders/:id          # full replace
DELETE /api/orders/:id          # delete
POST   /api/orders/:id/cancel   # action (verb)
GET    /api/orders/:id/items    # sub-resource
```

```ts
// Versiyonlama — URL'de
app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

// Pagination
// GET /api/orders?page=2&limit=20
// → { data: [...], pagination: { page, limit, total, totalPages } }

// Filtering
// GET /api/orders?status=submitted&createdAfter=2026-01-01

// Sorting
// GET /api/orders?sort=-createdAt,name
```

### 8.2 GraphQL

```ts
import { gql } from "graphql-tag";

const typeDefs = gql`
  type Order {
    id: ID!
    status: OrderStatus!
    items: [OrderItem!]!
    customer: Customer!
    total: Money!
    createdAt: DateTime!
  }

  type Query {
    order(id: ID!): Order
    orders(status: OrderStatus, limit: Int = 20, after: ID): OrderConnection!
  }

  type Mutation {
    placeOrder(input: PlaceOrderInput!): PlaceOrderResult!
  }

  type PlaceOrderResult {
    order: Order
    errors: [ValidationError!]
  }
`;

// DataLoader — N+1 çözümü
import DataLoader from "dataloader";
const customerLoader = new DataLoader(async (ids: string[]) => {
  const customers = await db.customer.findMany({ where: { id: { in: ids } } });
  return ids.map((id) => customers.find((c) => c.id === id));
});

// Resolver
{
  Order: {
    customer: (order) => customerLoader.load(order.customerId),
  },
}
```

### 8.3 gRPC

```proto
syntax = "proto3";
package orders.v1;

service OrderService {
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc PlaceOrder(PlaceOrderRequest) returns (PlaceOrderResponse);
  rpc StreamOrders(StreamOrdersRequest) returns (stream OrderEvent);
}

message Order {
  string id = 1;
  string status = 2;
  repeated OrderItem items = 3;
  string customer_id = 4;
  int64 created_at = 5;
}
```

### 8.4 Karşılaştırma

| Özellik | REST | GraphQL | gRPC |
|---|---|---|---|
| Hız | Orta | Orta | Çok hızlı (Protobuf) |
| Esneklik | Az | Çok (field seçimi) | Orta |
| Browser desteği | Tam | Tam | Yok (gRPC-Web) |
| Streaming | Hayır | Subscriptions | Evet (bi-directional) |
| Schema | OpenAPI | SDL | .proto |
| Kullanım | Public API | BFF, mobile | Internal service |

---

## 9. Message Queue Patterns

### 9.1 RabbitMQ — Task queue

```ts
import amqp from "amqplib";

const conn = await amqp.connect("amqp://rabbitmq");
const ch = await conn.createChannel();
await ch.assertQueue("email.send", { durable: true });

// Producer
ch.sendToQueue("email.send", Buffer.from(JSON.stringify({
  to: "user@example.com",
  subject: "Welcome",
  body: "...",
})), { persistent: true });

// Consumer
ch.prefetch(1); // 1 mesaj tek seferde
ch.consume("email.send", async (msg) => {
  try {
    const data = JSON.parse(msg!.content.toString());
    await sendEmail(data);
    ch.ack(msg!);
  } catch (e) {
    ch.nack(msg!, false, false); // dead-letter queue'ya
  }
});
```

### 9.2 Kafka — Event streaming

```ts
import { Kafka } from "kafkajs";

const kafka = new Kafka({ brokers: ["kafka:9092"] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "order-service" });

await producer.connect();
await producer.send({
  topic: "order-events",
  messages: [{
    key: order.id,
    value: JSON.stringify({ type: "OrderPlaced", data: order }),
  }],
});

await consumer.connect();
await consumer.subscribe({ topic: "order-events", fromBeginning: false });
await consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value!.toString());
    if (event.type === "OrderPlaced") {
      await updateInventory(event.data);
    }
  },
});
```

### 9.3 SQS — AWS

```ts
import { SQSClient, SendMessageCommand, ReceiveMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: "eu-central-1" });
const queueUrl = "https://sqs.eu-central-1.amazonaws.com/123/order-queue";

await sqs.send(new SendMessageCommand({
  QueueUrl: queueUrl,
  MessageBody: JSON.stringify({ orderId: "123" }),
  DelaySeconds: 0,
  MessageAttributes: {
    Priority: { DataType: "Number", StringValue: "1" },
  },
}));

const result = await sqs.send(new ReceiveMessageCommand({
  QueueUrl: queueUrl,
  MaxNumberOfMessages: 10,
  WaitTimeSeconds: 20, // long polling
}));
```

### 9.4 Pattern'ler

| Pattern | Açıklama |
|---|---|
| **Competing consumers** | Aynı queue, birden fazla consumer paralel |
| **Work queue** | Task dağıtma |
| **Pub/Sub** | Bir mesaj, birden consumer |
| **Dead letter queue** | İşlenemeyen mesajlar |
| **Priority queue** | Öncelikli mesajlar |
| **Delayed delivery** | Geleceğe zamanlanmış |
| **Poison message** | Tekrar tekrar başarısız, ayrıştır |

---

## 10. Database Design

### 10.1 Normalization

- **1NF** — Atomik değerler.
- **2NF** — 1NF + partial dependency yok.
- **3NF** — 2NF + transitive dependency yok.
- **BCNF** — 3NF + her determinant aday anahtar.

Read-heavy sistemlerde **denormalization** (3NF'den çıkma) performans için yapılır.

### 10.2 Indexing

```sql
-- B-tree (varsayılan) — eşitlik, aralık
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Composite index — sorgu sırası önemli
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- Partial index — sadece koşulu sağlayanlar
CREATE INDEX idx_active_users ON users(last_login) WHERE active = true;

-- GIN — JSON, array, full-text
CREATE INDEX idx_products_attrs ON products USING GIN (attributes);
```

### 10.3 Sharding — Yatay bölümleme

```ts
// Hash-based sharding
function shardForUser(userId: string, shardCount = 16): string {
  const hash = crc32(userId);
  return `db_${hash % shardCount}`;
}

// Range-based — coğrafi
function shardByRegion(country: string): string {
  if (["US", "CA"].includes(country)) return "db_us";
  if (["TR", "DE", "FR"].includes(country)) return "db_eu";
  return "db_asia";
}

// Directory-based
const shardMap = await redis.get(`shard:${userId}`);
const conn = shardMap ? pools[shardMap] : pickShardRoundRobin();
```

### 10.4 Replication

- **Master-slave (read replica)** — Yazma master'a, okuma replica'lara.
- **Master-master** — Multi-region yazma. Conflict resolution şart.
- **Synchronous** — Tüm replica'lar onayladıkça commit. Yavaş, tutarlı.
- **Asynchronous** — Master hemen commit, replica'lar sonradan. Hızlı, eventual.

```ts
// Read replica routing
async function query(sql: string, params: unknown[]) {
  if (sql.trim().toUpperCase().startsWith("SELECT")) {
    return replicaPool.query(sql, params);
  }
  return masterPool.query(sql, params);
}
```

---

## 11. Caching Strategies

### 11.1 Cache-aside (lazy)

```ts
async function getUser(id: string): Promise<User> {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError();
  await redis.set(`user:${id}`, JSON.stringify(user), "EX", 3600);
  return user;
}
```

### 11.2 Write-through

```ts
async function updateUser(id: string, data: Partial<User>) {
  const updated = await db.user.update({ where: { id }, data });
  await redis.set(`user:${id}`, JSON.stringify(updated), "EX", 3600);
  return updated;
}
```

### 11.3 Write-behind (write-back)

```ts
// Yazma önce cache'e, DB'ye async
async function incrementView(postId: string) {
  const key = `views:${postId}`;
  const newCount = await redis.incr(key);
  if (newCount % 100 === 0) {
    // Her 100 view'da DB'ye flush
    await queue.add("flush-views", { postId, count: newCount });
  }
}
```

### 11.4 Cache invalidation — En zor problem

```ts
// TTL her zaman
await redis.set(key, val, "EX", 3600);

// Event-based invalidation
eventBus.subscribe("UserUpdated", async (e) => {
  await redis.del(`user:${e.userId}`);
});

// Tag-based — birden fazla key
await redis.set(`user:${id}`, val, "EX", 3600, "TAGS", "users");
// Update olunca
await invalidateByTag("users"); // SCAN + DEL
```

### 11.5 Stampede önleme

```ts
async function getUserWithLock(id: string): Promise<User> {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  // Lock — sadece bir thread DB'ye gider
  const lockAcquired = await redis.set(`lock:user:${id}`, "1", "NX", "EX", 5);
  if (!lockAcquired) {
    await sleep(50);
    return getUserWithLock(id); // retry
  }

  try {
    const user = await db.user.findUnique({ where: { id } });
    await redis.set(`user:${id}`, JSON.stringify(user), "EX", 3600);
    return user;
  } finally {
    await redis.del(`lock:user:${id}`);
  }
}
```

---

## 12. Observability — Logs, Metrics, Traces

### 12.1 Three pillars

- **Logs** — Olay kaydı (structured JSON).
- **Metrics** — Sayısal (counter, gauge, histogram).
- **Traces** — Request lifecycle (span'ler).

### 12.2 OpenTelemetry

```ts
import { trace, metrics, context, SpanStatusCode } from "@opentelemetry/api";
import { registerOTel } from "@vercel/otel";

registerOTel({ serviceName: "ai-studio" });

const tracer = trace.getTracer("api");
const meter = metrics.getMeter("api");

const requestCounter = meter.createCounter("requests", { description: "Total requests" });
const requestDuration = meter.createHistogram("request_duration", { unit: "ms" });

export async function GET(req: Request) {
  const span = tracer.startSpan("api.users.list");
  const start = Date.now();
  try {
    const users = await db.user.findMany();
    requestCounter.add(1, { endpoint: "/users", method: "GET" });
    span.setAttribute("user.count", users.length);
    return Response.json(users);
  } catch (e) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: (e as Error).message });
    throw e;
  } finally {
    requestDuration.record(Date.now() - start, { endpoint: "/users" });
    span.end();
  }
}
```

### 12.3 Structured logging

```ts
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

logger.info("user_login", {
  userId: "u_123",
  ip: "1.2.3.4",
  method: "password",
  duration: 245,
});

// Log levels: debug, info, warn, error, fatal
// PII loglama YASAK — hash'le veya mask'le
logger.info("user_viewed", { userId: hash(req.user.id) });
```

### 12.4 Trace propagation — Distributed

```ts
// Service A
const span = tracer.startSpan("process-order");
const ctx = trace.setSpan(context.active(), span);

// HTTP call to Service B — propagate context
const headers = {};
propagation.inject(context.active(), headers);
await fetch("http://service-b/api/process", { headers });

// Service B — extract context
const ctx = propagation.extract(context.active(), req.headers);
const span = tracer.startSpan("process-in-service-b", undefined, ctx);
```

### 12.5 SLI / SLO / SLA

```ts
// SLI: 99.9% of requests < 200ms
// SLO: 99.9% (error budget = 0.1% over 30 days)
// SLA: 99.5% (legal commitment, refund below)

const SLO_TARGET = 0.999;
const WINDOW_DAYS = 30;

async function errorBudgetRemaining(): Promise<number> {
  const total = await metrics.query("rate(http_requests_total[30d])");
  const errors = await metrics.query('rate(http_requests_total{status=~"5.."}[30d])');
  const actual = 1 - (errors / total);
  const budget = (actual - SLO_TARGET) / (1 - SLO_TARGET);
  return budget * 100; // % of budget remaining
}
```

---

## 13. Scalability Patterns

### 13.1 Load balancing

- **Round-robin** — Basit, eşit yük.
- **Least connections** — Bağlantı sayısı en az olan.
- **IP hash** — Sticky session.
- **Weighted** — Donanım gücüne göre.

### 13.2 Auto-scaling

```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 50
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 13.3 Backpressure

```ts
// Stream tabanlı — producer'ı yavaşlat
import { pipeline, Transform } from "stream";

async function processLarge(input: ReadableStream) {
  const nodeStream = Readable.toWeb(input) as any;
  await pipeline(
    nodeStream,
    new Transform({
      objectMode: true,
      highWaterMark: 16,
      transform(chunk, enc, cb) {
        processChunk(chunk).then(() => cb()).catch(cb);
      },
    }),
    outputSink,
  );
}
```

### 13.4 Queue-based load leveling

```ts
// Anlık spike → kuyruğa → worker'lar yavaşça işler
// Burst capacity = queue depth × worker rate
await sqs.send(new SendMessageCommand({
  QueueUrl: heavyTaskQueue,
  MessageBody: JSON.stringify(task),
}));
```

---

## 14. Trade-off Matrisi

| Karar | Performans | Karmaşıklık | Hata Oranı | Tutarlılık |
|---|---|---|---|---|
| Monolith vs microservices | Mono daha az overhead | Microservices yüksek | Microservices daha fazla network failure | Mono ACID |
| Sync vs async | Sync anlık | Async daha karmaşık | Async retry kolay | Sync tutarlı, async eventual |
| SQL vs NoSQL | SQL joins, NoSQL read-yoğun | SQL şema disiplini | — | SQL güçlü, NoSQL zayıf |
| Cache her şey | Çok hızlı | Invalidation zor | Stale data | Zayıf |
| Event sourcing | Tam audit | Çok karmaşık | Replay destekli | Eventual |

---

## 15. Kompozit Örnek — AI Stüdyo Mimari Şeması

```
                              [Browser]
                                 |
                          [Cloudflare CDN/WAF]
                                 |
                          [Next.js Edge / API]
                            /          \
                   [Auth Service]   [Project Service]
                            \          /
                          [PostgreSQL Primary]
                          [PostgreSQL Read Replicas]
                                 |
                          [Redis Cache]
                                 |
                          [Kafka (events)]
                                 |
                          [Agent Service]
                                 |
                          [DeepSeek API]
                                 |
                          [Vector DB (Chroma)]
                                 |
                          [Object Storage (S3)]
                                 |
                          [OpenTelemetry → Tempo/Loki/Prometheus]
```

**Servis sorumlulukları:**
- **Auth Service**: Login, MFA, session, RBAC
- **Project Service**: CRUD proje, dosya, versiyon
- **Agent Service**: ReAct loop, function calling, memory
- **AI Gateway**: DeepSeek API çağrısı, rate limit, cache, fallback

**Tutarlılık modeli:**
- Project data: strong consistency (PostgreSQL ACID)
- AI generation: eventual (Kafka → Agent → DB update)
- Analytics: eventual (Kafka → ClickHouse)

**Caching:**
- Project metadata: cache-aside, 5 dk TTL
- Policy/standard list: write-through, 1 saat TTL
- DeepSeek response: idempotency-key cache, 24 saat

---

## 16. Skill Çıktısı Beklentisi

Bu skill çağrıldığında AI:

1. Domain analizi yapar (Bounded Context'ler).
2. Mimari desen önerir (monolith vs micro, CQRS, event sourcing).
3. API tasarımı verir (REST/GraphQL/gRPC).
4. Veri modeli çizer (entity, aggregate, value object).
5. Cache stratejisi önerir.
6. Observability planı verir.
7. Trade-off'ları açıklar.

Tüm çıktılar **TypeScript** ve enterprise-grade olmalı.

---

## 17. Kapanış

Enterprise mimari **doğru cevap değil, doğru trade-off**'lar yapmaktır.

Bu skill'in 3 ana çıktısı:
1. **Karar verilebilir** — Her mimari karar gerekçeli, alternatifleri değerlendirilmiş.
2. **Genişletilebilir** — Yeni özellik mevcut yapıyı bozmamalı.
3. **Gözlemlenebilir** — Sistem çalışırken ne yaptığını bilmeliyiz.

AI stüdyo arayüzünde bu skill her mimari kararda kendini gösterir. Yeni bir özellik istendiğinde, bu skill önce **"hangi bounded context?", "hangi aggregate?", "hangi event?"** sorularını sorar.

**Unutma:** Karmaşıklık gerçek bir ihtiyaçtır; ama gereksiz karmaşıklık teknik borçtur. Önce basit, sonra ölçeklendikçe karmaşık. "Working software over comprehensive documentation" — Agile Manifesto.
