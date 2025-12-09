# ARCHITECTURE.MD

The architecture is structured as a RESTful monolith for initial simplicity and ease of development, with clear separation of concerns, modular components, and event hooks to facilitate future enhancements. This includes preparing for asynchronous processing (e.g., via message queues), caching layers, and containerized deployment without incorporating them in the current implementation. For instance, commission and spillover logic are encapsulated in isolated modules with synchronous execution now, but designed with event emitters and configurable triggers for seamless integration of queues or caches later.

## 1. High-Level Architecture

The system adopts a layered architecture with a focus on modularity, fault tolerance, and compliance with MLM regulations (e.g., anti-pyramid scheme safeguards via product-based enrollment). The frontend handles interactive visualizations, while the backend manages tree operations, commission calculations, and data integrity. Real-time features (e.g., live tree updates, commission notifications) are supported via WebSockets, with hooks for future asynchronous expansions.

### System Diagram

```mermaid
graph TD
    User[User Browser/Mobile App] -->|HTTPS/WSS| CDN[Vite Frontend Assets (via CDN for Global Distribution)]
    User -->|API Requests (REST/GraphQL)| API[Express.js Server]
    User -->|Real-Time Updates| WS[WebSocket Server (Socket.io)]

    subgraph "Frontend Layer"
        CDN --> React[React.js + Vite + Redux Toolkit]
        React --> TreeViz[Interactive Tree Visualizer]
    end

    subgraph "Backend Services (Monolith with Modular Controllers)"
        API --> Auth[Auth & User Management Controller]
        API --> Genealogy[Genealogy Tree & Spillover Controller]
        API --> Commission[Commission Engine Controller]
        API --> Wallet[Wallet & Financials Controller]
        API --> Notification[Notification & Event Bus Controller]
        WS --> Notification
    end

    subgraph "Data Layer"
        API --> DB[(MongoDB - Clustered for Future Sharding)]
    end

    subgraph "Security & Monitoring"
        API --> Security[JWT/OAuth, Rate Limiting, Audit Logging]
        All[All Components] --> Monitor[Monitoring (Prometheus + Grafana)]
        All --> Log[Centralized Logging (ELK Stack)]
    end

    subgraph "External Integrations"
        Wallet --> Payment[Payment Gateways (Stripe/PayPal for Enrollments & Payouts)]
        Notification --> Email[SMS/Email Services (Twilio/SendGrid)]
    end
```

### Key Architectural Principles
- **Modularity for Future Scalability**: Components are loosely coupled with interfaces and event emitters, allowing easy addition of caching (e.g., for leg volumes), message queues (e.g., for async tasks like notifications), and horizontal scaling. Current implementation uses synchronous processing to maintain monolith simplicity.
- **Real-Time Processing**: Handled synchronously via WebSockets for now; designed with pub/sub patterns for future queue integration.
- **Security**: End-to-end encryption (TLS 1.3), JWT for authentication, role-based access control (RBAC), and audit trails for all tree modifications and payouts to ensure compliance.
- **Fault Tolerance**: Built-in retry logic in critical functions (e.g., database transactions); prepared for circuit breakers in external integrations.
- **Performance Optimization**: Lazy loading for trees, batch processing for commissions, and indexing on materialized paths for O(1) queries in large trees. Hooks exist for caching frequent queries.
- **Extensibility**: Commission logic is pluggable to support customizable plans (e.g., 1:1, 1:2, 2:1 ratios, hybrid variants like Tri-Binary or Australian Binary). Modules include placeholders for async wrappers.

## 2. Tech Stack Specification

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend Framework** | React.js + Vite | Provides fast HMR, optimized bundles, and component-based UI for complex, interactive dashboards. Supports mobile responsiveness for app-like experiences. |
| **State Management** | Redux Toolkit + RTK Query | Efficiently manages nested genealogy state, caching API responses, and handling optimistic updates for tree expansions without prop-drilling. |
| **Tree Visualization** | react-d3-tree or react-flow | Specialized for rendering hierarchical binary trees with dynamic SVG connectors, zoom/pan, lazy loading, and custom node rendering (e.g., user avatars, PV stats). Supports interactivity like node clicks for expansions. |
| **Real-Time Client** | Socket.io Client | Enables live notifications for enrollments, commission payouts, and tree changes. |
| **Backend Framework** | Node.js + Express | Non-blocking I/O handles high concurrency for real-time tree traversals and API requests. Modular routing for future microservices split. |
| **API Style** | RESTful + GraphQL (Optional) | REST for core CRUD; GraphQL for flexible tree queries (e.g., fetch specific depths or subtrees). |
| **Database** | MongoDB (Cluster-Ready) | NoSQL flexibility for hierarchical data using Materialized Path + Parent Reference patterns. Supports efficient regex queries for subtrees and aggregation pipelines for commission calculations. Designed for future sharding. |
| **ORM/ODM** | Mongoose | Enforces schema validation, handles relationships, and provides hooks for pre-save operations (e.g., updating paths during spillover). |
| **Scheduling** | Node-Cron | Runs periodic jobs for commission flushing, carry-forwards, and rank achievements. |
| **Security** | JWT (jsonwebtoken), bcrypt, helmet, rate-limiter | Secure auth, password hashing, HTTP headers protection, and DDoS mitigation. |
| **Monitoring & Logging** | Prometheus + Grafana, ELK (Elasticsearch, Logstash, Kibana) | Real-time metrics on tree depth, query times, commission volumes; centralized logs for debugging. |
| **Testing** | Jest + Supertest (Backend), React Testing Library (Frontend) | Unit/integration tests for spillover logic, commission calculations, and UI interactions. |

Note: The stack is kept lightweight for monolith deployment. Placeholders and configurable options are included for future additions like caching layers or message queues without requiring major refactors.

## 3. Database Schema Design

Efficient tree querying is paramount in Binary MLM to handle deep structures (unlimited depth) without performance degradation. We combine **Materialized Path Pattern** (for fast subtree queries via regex) with **Parent Reference** (for quick insertions/deletions). Additional fields support advanced features like multi-ratio pairing, carry-forwards, flushing, and capping. Schemas include hooks for future caching invalidation.

### 3.1 Users Collection (users)

```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, index: true },
  email: { type: String, unique: true },
  password: { type: String }, // Hashed with bcrypt
  profileImage: { type: String }, // URL to avatar
  enrollmentPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages' }, // Affects bonuses
  isActive: { type: Boolean, default: true },
  enrollmentDate: { type: Date, default: Date.now },

  // Genealogy Pointers
  sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  position: { type: String, enum: ['left', 'right'] },

  // Optimization for Queries
  path: { type: String, index: true }, // e.g., ",rootId,parentId,thisId,"
  level: { type: Number, default: 0 },
  leftChildId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rightChildId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Advanced Features
  spilloverPreference: { type: String, enum: ['extreme_left', 'extreme_right', 'weaker_leg', 'balanced'], default: 'weaker_leg' },
  multiCenter: { type: Boolean, default: false },
  rank: { type: String, enum: ['Bronze', 'Silver', 'Gold', /* ... */], default: 'Bronze' },
});

// Pre-save hook for path/level updates (extensible for future cache invalidation)
userSchema.pre('save', async function(next) {
  if (this.isNew && this.parentId) {
    const parent = await this.constructor.findById(this.parentId);
    this.path = `${parent.path}${this._id},`;
    this.level = parent.level + 1;
  }
  // Placeholder for future cache invalidation event emission
  next();
});

module.exports = mongoose.model('User', userSchema);
```

### 3.2 Commissions Collection (commissions)

```javascript
const commissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  leftLegPV: { type: Number, default: 0 },
  rightLegPV: { type: Number, default: 0 },
  carriedLeftPV: { type: Number, default: 0 },
  carriedRightPV: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  cyclePointThreshold: { type: Number, default: 100 }, // Configurable
  capping: {
    type: { type: String, enum: ['sv_based', 'commission_based'] },
    limit: { type: Number }
  },
  history: [{
    type: { type: String, enum: ['BINARY_BONUS', 'PAIRING_BONUS', 'MATCHING_BONUS', 'DIRECT_REFERRAL', 'ROI', 'RANK_ACHIEVEMENT', 'CUSTOM'] },
    amount: { type: Number },
    date: { type: Date, default: Date.now },
    details: { type: String }
  }]
});

// Post-save hook for event emission (ready for future queue integration)
commissionSchema.post('save', function(doc) {
  // Emit event for notifications or async processing
  // Placeholder: emitter.emit('commissionUpdated', doc);
});

module.exports = mongoose.model('Commission', commissionSchema);
```

### 3.3 Packages Collection (packages)

```javascript
const packageSchema = new mongoose.Schema({
  name: { type: String },
  price: { type: Number },
  pvValue: { type: Number },
  bonuses: [{
    type: { type: String },
    percentage: { type: Number }
  }]
});

module.exports = mongoose.model('Package', packageSchema);
```

### 3.4 Wallets Collection (wallets)

```javascript
const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 },
  transactions: [{
    type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'COMMISSION'] },
    amount: { type: Number },
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Wallet', walletSchema);
```

## 4. Key Functional Modules

### 4.1 Genealogy Tree Visualizer (Frontend)

- **Interactive UI**: Supports zoom, pan, search/jump to nodes, and color-coding (e.g., green for active, red for imbalanced legs).
- **Lazy Loading**: Fetch root + 2-3 levels initially via API. On + icon click, append children to Redux state using RTK Query.
- **Visual Enhancements**: Dynamic SVG paths for connectors; tooltips with PV stats, rank, and spillover indicators.
- **Search & Navigation**: Fuzzy search for users; breadcrumb navigation for deep trees.
- **Mobile Optimization**: Responsive design with touch gestures.
- **Extensibility**: Redux actions include hooks for future cache synchronization.

### 4.2 Spillover Logic (Backend)

Critical for binary growth. Supports configurable preferences to prevent imbalances. Currently synchronous; designed with modular functions for future async wrapping.

- **Algorithm** (Recursive with Built-in Memoization):
  1. Receive new_recruit, sponsor_id, preferred_leg (optional).
  2. If sponsor has open slot (left/right based on preference), place directly.
  3. Else, traverse down preferred leg (e.g., weaker_leg: compare left/right PV via direct query).
  4. Find first node with empty slot (check leftChildId/rightChildId).
  5. Insert: Update parentId, position, path (append to parent's path), level (parent.level + 1) using MongoDB transactions.
  6. Trigger synchronous updates: Update sponsor's PV, emit events for notifications.
- **Preferences**:
  - **Extreme Left/Right**: Spill to outermost left/right for depth focus.
  - **Weaker Leg**: Place in leg with lower PV (query commissions synchronously).
  - **Balanced**: Maintain 1:1 ratio by alternating placements.
  - **Multi-Center**: For premium users, create new tree positions after filling first.
- **Edge Cases**: Handle overflows (e.g., max depth limits), concurrent placements (transactions ensure atomicity).
- **Preparation for Future**: Function emits events post-placement, ready for queue listeners.

### 4.3 Commission Engine (Backend)

Modular, pluggable engine supporting all binary variants. Runs via cron (nightly/weekly) or synchronously on events.

- **Triggers**: On PV updates (enrollments, purchases). Use aggregation pipelines to sum subtree PV.
- **Core Logic**:
  1. Fetch user's left/right PV (including carried forwards) synchronously.
  2. Identify weaker leg (min(left, right)).
  3. Apply ratio (configurable: 1:1, 1:2, 2:1, 2:3, etc.).
     - Example (1:1): Pairs = floor(min(left/100, right/100)); Commission = pairs * bonus_rate; Carry forward remainders.
     - Example (1:2): Pairs = floor(left/100); If right >= pairs*200, commission = pairs * rate; Carry excess.
  4. Apply bonuses:
     - **Binary Bonus**: X% of weaker leg PV.
     - **Pairing Bonus**: Per matched pair in ratio.
     - **Matching Bonus**: Traverse upline (via path/sponsorId) for % of downline earnings.
     - **Direct Referral**: Fixed/percentage per sponsored member.
     - **ROI/Rank Achievement**: Threshold-based (e.g., 5000 PV for Gold rank bonus).
     - **Custom**: Plugin for company-specific rules.
  5. Handle Capping: Flush excess PV if sv_based; Cap total payout if commission_based.
  6. Carry Forward: Roll over unmatched PV to next cycle.
  7. Flush: Reset legs post-payout (optional per plan).
- **Efficiency**: Use MongoDB $graphLookup for upline traversals; Batch updates in transactions.
- **Variants**: Support Tri-Binary (three legs, 1:1:1), Australian Binary (three legs, payout on two matches).
- **Preparation for Future**: Engine emits events on calculations, allowing easy addition of async batching.

### 4.4 Wallet & Payouts

- Integrates synchronously with gateways for deposits/withdrawals.
- Automates payouts post-commission cycles, with tax withholding and compliance checks.
- Hooks for future async notifications.

### 4.5 Notifications & Real-Time

- Synchronous: Send emails/SMS on events via direct calls.
- WebSockets: Push tree/PV updates to connected clients.
- Event bus in controllers prepares for queue decoupling.

## 5. API Endpoints

### Auth & User
- POST /api/v1/auth/register: Validates package, runs spillover synchronously, creates user/commission docs (transactional).
- POST /api/v1/auth/login: JWT issuance with RBAC claims.
- PATCH /api/v1/users/:id: Update profile, preferences.

### Genealogy
- GET /api/v1/network/tree?rootId={id}&depth={n}: Returns JSON subtree (lazy-loaded).
- GET /api/v1/network/search?query={name}: Fuzzy search with pagination.
- POST /api/v1/network/spillover: Manual placement simulation (admin only).

### Financials
- GET /api/v1/commissions/summary?userId={id}: PV stats, history.
- POST /api/v1/commissions/calculate: Trigger manual cycle (admin).
- GET /api/v1/wallet/balance: Current balance/transactions.
- POST /api/v1/wallet/payout: Initiate withdrawal (with KYC checks).

All endpoints: Rate-limited, authenticated, logged. Designed with middleware hooks for future caching.

## 6. Security & Compliance

- **Authentication**: JWT with refresh tokens; Multi-factor (optional).
- **Authorization**: RBAC (user, admin, sponsor views).
- **Data Protection**: Encrypt sensitive fields (PII, wallets); GDPR-compliant.
- **Anti-Fraud**: Detect imbalances/anomalies via synchronous checks; Audit all changes.
- **Compliance**: Ensure product-based enrollments; Report generation for tax authorities.

## 7. Scalability & Performance

- **Handling Large Trees**: Limit query depths; Use indexes for efficiency.
- **Load Testing**: Simulate 1M users with tools like Artillery.
- **Batch Processing**: Commissions in chunks to avoid timeouts.
- **Preparation for Future**: Query patterns optimized for caching; Async placeholders in heavy operations.

## 8. Testing & Quality Assurance

- **Unit Tests**: Cover spillover recursion, commission calculations (edge cases: imbalances, caps).
- **Integration Tests**: API flows, DB transactions.
- **E2E Tests**: UI tree interactions with Cypress.
- **Performance Tests**: Query times for 100-level trees.
- **Security Audits**: OWASP scans, penetration testing.

## 9. Implementation Steps

1. **Backend Setup**: Initialize Express, Mongoose schemas, connections. Implement spillover recursion with tests.
2. **Commission Engine**: Build modular calculator with ratio plugins; Integrate cron jobs.
3. **Frontend Initialization**: Vite + React setup; Install tree lib, Redux.
4. **Tree Integration**: Mock API data; Implement lazy loading, WebSockets.
5. **Full Integration**: Connect FE/BE; Add security, monitoring.
6. **Optimization & Testing**: Profile for bottlenecks; Run load tests.
7. **Launch & Monitoring**: Roll out with feature flags; Monitor live metrics.

This architecture ensures a robust, extensible Binary MLM monolith ready for future scaling integrations like queues, caching, and containerization without disruptive changes. If you'd like the full Mongoose schema code or further details on any module, let me know.
