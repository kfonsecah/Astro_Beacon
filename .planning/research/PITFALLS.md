# Domain Pitfalls: Node.js + Express v4 REST API Development

**Domain:** REST API with Node.js + Express v4 for mobile app (Expo/React Native)
**Project:** Astro_Beacon — Planetary exploration mobile app
**Researched:** 2026-04-16
**Confidence:** HIGH (verified with multiple authoritative sources)

---

## Executive Summary

Building a REST API with Node.js + Express v4 introduces specific pitfalls that can compromise security, scalability, and maintainability. This document catalogs the most critical mistakes and provides actionable prevention strategies. For Astro_Beacon, the key concerns are:

1. **Security is non-negotiable** — The app handles astronaut survival data and must protect user credentials
2. **Mobile integration requires extra care** — CORS, network handling, and offline sync are major failure points
3. **Architecture decisions early** — Business logic in routes becomes unmaintainable quickly
4. **Consistent error handling** — Mobile apps depend on predictable API responses

---

## 1. Security Pitfalls

### 1.1 Storing Passwords in Plain Text

**What goes wrong:** User credentials are stored as-is in the database. A breach exposes all passwords immediately.

**Why it happens:** Developers underestimate risk or prioritize "simplicity" in early development.

**Consequences:**
- Complete user account compromise
- Legal/regulatory exposure (password reuse is common)
- Loss of user trust in a survival-critical app

**Prevention:**
```javascript
// ❌ NEVER do this
const user = { email, password: req.body.password };

// ✅ ALWAYS hash passwords with bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

// ✅ Verify login with bcrypt.compare()
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

**Detection:** Code review, security scanning tools, never store raw passwords in dev logs.

**Phase recommendation:** Authentication phase — implement from day one.

---

### 1.2 Not Validating Input (SQL/NoSQL Injection)

**What goes wrong:** User input is passed directly to database queries, allowing injection attacks.

**Why it happens:** Express doesn't enforce input validation by default. Developers assume "TypeScript types are enough."

**Consequences:**
- Data theft or destruction
- Authentication bypass
- Server compromise

**Prevention:**
```javascript
// ❌ NEVER trust user input directly
const user = await User.findOne({ email: req.body.email });

// ✅ Use express-validator or Joi for validation + sanitization
const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).trim(),
];

// ✅ For MongoDB, also sanitize to prevent NoSQL injection
const sanitize = require('express-mongo-sanitize');
app.use(sanitize());
```

**Phase recommendation:** API foundation phase — middleware-level validation.

---

### 1.3 Missing or Weak JWT Secret Complexity

**What goes wrong:** JWT tokens can be forged if the secret is weak or exposed.

**Why it happens:** Using default/example secrets like "secret" or "mySecret123".

**Consequences:**
- Attackers forge valid tokens
- Unauthorized access to all protected resources
- Session hijacking

**Prevention:**
```javascript
// ❌ NEVER do this
const JWT_SECRET = "secret123";

// ✅ Use cryptographically random secrets from environment
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Generate secure secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

// ✅ Use strong algorithm and explicit verification options
const jwt = require('jsonwebtoken');
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '15m',  // Short-lived access tokens
  issuer: 'astro-beacon-api',
  audience: 'astro-beacon-app'
});

// Verify with explicit options
jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256'],  // Prevent algorithm confusion attacks
  issuer: 'astro-beacon-api'
});
```

**Phase recommendation:** Authentication phase — environment setup at project initialization.

---

### 1.4 Exposing Sensitive Data in Responses

**What goes wrong:** Password hashes, internal IDs, or sensitive fields leak in API responses.

**Why it happens:** Returning full database objects without transformation.

**Consequences:**
- Password hash exposure (even if hashed, it's a security risk)
- Internal implementation details revealed
- Potential PII leakage

**Prevention:**
```javascript
// ❌ NEVER return full database objects
app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);  // Contains password hash!
});

// ✅ Use DTOs/serializers to control what returns
class UserDTO {
  static toPublic(user) {
    return {
      id: user._id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
      // No password, no internal fields
    };
  }
}

app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(UserDTO.toPublic(user));
});
```

**Phase recommendation:** API design phase — establish response patterns early.

---

### 1.5 Not Implementing Rate Limiting

**What goes wrong:** APIs are vulnerable to brute-force attacks, DoS, and abuse.

**Why it happens:** Rate limiting feels like "future concern" during development.

**Consequences:**
- Credential stuffing attacks on login endpoints
- Server resource exhaustion
- API quota exhaustion from a single client

**Prevention:**
```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 requests per window
  message: { error: 'Too many requests, please try again later' }
});

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts, please try again in 15 minutes' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

**Phase recommendation:** Security phase — implement before any public endpoints.

---

## 2. Architecture Pitfalls

### 2.1 Putting Business Logic in Routes/Controllers

**What goes wrong:** Routes become massive, untestable, and duplicated across endpoints.

**Why it happens:** "It's just a simple endpoint" mentality leads to quick-and-dirty implementations.

**Consequences:**
- Impossible to unit test business logic in isolation
- Code duplication when multiple endpoints need same logic
- Routes become 500+ lines of spaghetti code
- Business rules scattered across the codebase

**Prevention — Layered Architecture:**
```
src/
├── routes/           # Only routing: path matching, middleware ordering
├── controllers/      # Only HTTP concerns: request parsing, response formatting
├── services/        # Business logic: validation, calculations, domain rules
├── models/          # Database schemas and queries
├── middleware/      # Cross-cutting: auth, validation, error handling
└── utils/           # Shared utilities
```

```javascript
// ❌ BAD: Route contains business logic
app.post('/resources', async (req, res) => {
  const { type, quantity } = req.body;
  if (!type || !quantity) return res.status(400).send('Missing fields');
  if (quantity < 0) return res.status(400).send('Invalid quantity');

  // Business logic in route!
  const alertThreshold = type === 'oxygen' ? 20 : 10;
  if (quantity < alertThreshold) {
    // More business logic...
  }

  const resource = await Resource.create({ type, quantity });
  // More business logic...
  res.json(resource);
});

// ✅ GOOD: Business logic in service
// routes/resourceRoutes.js
router.post('/', validateResource, async (req, res, next) => {
  try {
    const resource = await resourceService.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
});

// services/resourceService.js
class ResourceService {
  async create(data) {
    this.validate(data);
    this.checkAlertThresholds(data);
    return this.repository.create(data);
  }

  validate(data) {
    if (!data.type || !data.quantity) {
      throw new ValidationError('Missing required fields');
    }
    if (data.quantity < 0) {
      throw new ValidationError('Quantity cannot be negative');
    }
  }

  checkAlertThresholds(data) {
    const alertThreshold = data.type === 'oxygen' ? 20 : 10;
    if (data.quantity < alertThreshold) {
      // Trigger alert logic
      alertService.notifyLowResource(data.type, data.quantity);
    }
  }
}
```

**Phase recommendation:** Project initialization — establish structure from day one.

---

### 2.2 Tight Coupling to Database

**What goes wrong:** Business logic directly uses database-specific APIs, making changes impossible.

**Why it happens:** "We might not even need a different database" — premature optimization.

**Consequences:**
- Impossible to test without a real database
- Database changes cascade everywhere
- Cannot scale or switch to better solutions

**Prevention:**
```javascript
// ❌ BAD: Controllers directly use MongoDB/Mongoose
app.get('/astronauts', async (req, res) => {
  const astronauts = await Astronaut.find({ status: 'active' }).lean();
  res.json(astronauts);
});

// ✅ GOOD: Repository pattern abstracts database
// repositories/astronautRepository.js
class AstronautRepository {
  constructor(model) {
    this.model = model;
  }

  async findActive() {
    return this.model.find({ status: 'active' }).lean();
  }

  async findById(id) {
    return this.model.findById(id).lean();
  }
}

// services/astronautService.js
class AstronautService {
  constructor(repository) {
    this.repository = repository;
  }

  async getActiveAstronauts() {
    return this.repository.findActive();
  }
}
```

**Phase recommendation:** Project initialization — repository pattern from day one.

---

### 2.3 Not Handling Errors Consistently

**What goes wrong:** Different endpoints return different error formats, confusing mobile clients.

**Why it happens:** Ad-hoc error handling without a strategy.

**Consequences:**
- Mobile app must handle dozens of error formats
- 500 errors leak internal details
- Unhandled promise rejections crash the server

**Prevention:**
```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Factory methods for common errors
AppError.badRequest = (msg) => new AppError(msg, 400);
AppError.unauthorized = (msg) => new AppError(msg || 'Unauthorized', 401);
AppError.forbidden = (msg) => new AppError(msg || 'Forbidden', 403);
AppError.notFound = (msg) => new AppError(msg || 'Resource not found', 404);
AppError.conflict = (msg) => new AppError(msg, 409);

// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    statusCode,
    message: err.message,
    timestamp: new Date().toISOString()
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error({ statusCode, message: err.message, stack: err.stack });
  }

  res.status(statusCode).json(response);
};

// Async handler wrapper to catch promise rejections
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage in routes
router.get('/:id', asyncHandler(async (req, res) => {
  const astronaut = await astronautService.findById(req.params.id);
  if (!astronaut) {
    throw AppError.notFound('Astronaut not found');
  }
  res.json({ success: true, data: astronaut });
}));
```

**Phase recommendation:** API foundation phase — error handler first, then routes.

---

### 2.4 Circular Dependencies

**What goes wrong:** Module A requires Module B, which requires Module A — causing crashes at startup.

**Why it happens:** Natural code organization creates dependency cycles (A → B → A).

**Consequences:**
- Application crashes on startup
- Difficult to debug (error points elsewhere)
- Forces bad architectural decisions

**Prevention:**
```javascript
// ❌ AVOID: Circular dependency
// services/astronautService.js
const tripService = require('./tripService');  // ❌ If tripService also needs astronautService

// ✅ SOLUTION 1: Dependency injection
// Pass dependencies as constructor parameters
class AstronautService {
  constructor(tripService) {
    this.tripService = tripService;  // Injected, not imported
  }
}

// ✅ SOLUTION 2: Event-driven communication
// Use events instead of direct calls
const EventEmitter = require('events');
class AuthService extends EventEmitter {
  onUserCreated(callback) { this.on('user:created', callback); }
}

// ✅ SOLUTION 3: Move shared code to third module
// common/database.js exports what both need

// ✅ SOLUTION 4: Lazy loading
// Use require() inside functions instead of at module level (last resort)
```

**Phase recommendation:** Project initialization — document dependencies, use DI from day one.

---

## 3. API Design Pitfalls

### 3.1 Inconsistent Response Formats

**What goes wrong:** Different endpoints return data in different structures.

**Why it happens:** No response envelope standard defined upfront.

**Consequences:**
- Mobile app must handle multiple response formats
- Confusing API contract
- Difficult to implement generic error handling

**Prevention — Standard Response Envelope:**
```javascript
// utils/responseFormatter.js
class ResponseFormatter {
  static success(data, meta = {}) {
    return {
      success: true,
      data,
      ...meta,
      timestamp: new Date().toISOString()
    };
  }

  static paginated(data, pagination) {
    return {
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit)
      },
      timestamp: new Date().toISOString()
    };
  }

  static error(message, statusCode = 500, details = null) {
    return {
      success: false,
      statusCode,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString()
    };
  }
}

// Usage
router.get('/astronauts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const { astronauts, total } = await astronautService.findAll({ page, limit });

  res.json(ResponseFormatter.paginated(astronauts, { page, limit, total }));
});
```

**Phase recommendation:** API design phase — define envelope before implementing endpoints.

---

### 3.2 Not Using Proper HTTP Status Codes

**What goes wrong:** All responses return 200, even errors — clients cannot distinguish success from failure.

**Why it happens:** "200 means it worked, right?" mentality.

**Consequences:**
- Mobile app cannot show appropriate error UI
- Search engines index error pages
- Caching issues with error responses

**Prevention:**
| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST that creates resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors, malformed JSON |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, version conflict |
| 422 | Unprocessable | Semantic validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected errors |

```javascript
// ❌ BAD: Wrong status codes
res.json({ error: 'Unauthorized' });  // Returns 200!

// ✅ GOOD: Correct status codes
res.status(401).json(ResponseFormatter.error('Unauthorized'));

// ✅ Return 201 for resource creation
app.post('/astronauts', async (req, res) => {
  const astronaut = await astronautService.create(req.body);
  res.status(201).json(ResponseFormatter.success(astronaut));
});

// ✅ Return 204 for deletion with no body
app.delete('/astronauts/:id', async (req, res) => {
  await astronautService.delete(req.params.id);
  res.status(204).send();
});
```

**Phase recommendation:** API design phase — include in API standards documentation.

---

### 3.3 Missing Pagination Leading to Huge Responses

**What goes wrong:** Endpoints return all records, causing memory exhaustion and slow responses.

**Why it happens:** "We only have a few records" — until we don't.

**Consequences:**
- Memory exhaustion with large datasets
- Slow mobile responses, draining battery
- Timeouts on mobile networks
- Database performance degradation

**Prevention:**
```javascript
// ✅ Implement pagination for all list endpoints
class PaginationHelper {
  static parse(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }
}

// Repository
async findPaginated({ skip, limit }) {
  const [data, total] = await Promise.all([
    this.model.find().skip(skip).limit(limit).lean(),
    this.model.countDocuments()
  ]);
  return { data, total };
}

// Service
async getResources(query) {
  const { skip, limit, page } = PaginationHelper.parse(query);
  const { data, total } = await this.repository.findPaginated({ skip, limit });
  return { data, total, page, limit };
}

// Response
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 156,
    totalPages: 8
  }
}
```

**Phase recommendation:** API foundation phase — pagination is a requirement, not an optimization.

---

### 3.4 N+1 Query Problems

**What goes wrong:** Fetching a list fetches related data one query at a time — 100 records = 101 queries.

**Why it happens:** Not using population/joins properly with ORMs.

**Consequences:**
- Catastrophic performance at scale
- Database connection exhaustion
- Response times of 10+ seconds

**Prevention:**
```javascript
// ❌ BAD: N+1 query
router.get('/trips', async (req, res) => {
  const trips = await Trip.find();  // 1 query
  const enrichedTrips = trips.map(async (trip) => {
    trip.astronaut = await Astronaut.findById(trip.astronautId);  // N queries!
    trip.supplies = await Supply.find({ tripId: trip._id });  // N more queries!
    return trip;
  });
  res.json(await Promise.all(enrichedTrips));
});

// ✅ GOOD: Single query with populate or manual join
router.get('/trips', async (req, res) => {
  const trips = await Trip.find()
    .populate('astronaut', 'name email')  // Single query with join
    .populate('supplies')
    .lean();

  res.json(ResponseFormatter.success(trips));
});

// ✅ GOOD: Explicit field selection for performance
router.get('/trips', async (req, res) => {
  const trips = await Trip.find()
    .select('startTime endTime status astronautId')
    .populate('astronaut', 'name -_id')
    .lean();

  res.json(ResponseFormatter.success(trips));
});
```

**Phase recommendation:** API foundation phase — establish query patterns early.

---

## 4. Integration Pitfalls

### 4.1 CORS Misconfiguration Blocking Mobile App

**What goes wrong:** Mobile app cannot connect to API due to CORS policy.

**Why it happens:** CORS defaults are restrictive; misconfiguration is common.

**Consequences:**
- Complete failure to connect from mobile
- "Network request failed" errors
- Hours wasted debugging connection issues

**Prevention:**
```javascript
const cors = require('cors');

// ❌ BAD: Too permissive
app.use(cors());  // Allows any origin in production!

// ✅ GOOD: Explicit allowed origins
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,  // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests
app.options('*', cors(corsOptions));

// Environment setup
// .env
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
```

**Mobile-specific considerations:**
- Expo apps on Android emulator: Use `10.0.2.2` for localhost
- Physical devices: Use actual IP address, not localhost
- Production: Use HTTPS with proper domain

**Phase recommendation:** API foundation phase — test CORS on actual mobile devices, not just browser.

---

### 4.2 Token Expiration Without Refresh

**What goes wrong:** Access tokens expire; users must re-login frequently.

**Why it happens:** Implementing only access tokens, ignoring refresh flow.

**Consequences:**
- Poor user experience
- Users lose work in progress
- Forced re-authentication mid-session

**Prevention — Token Refresh Pattern:**
```javascript
// ✅ Access + Refresh token pattern
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

app.post('/auth/login', async (req, res) => {
  // Verify credentials
  const user = await verifyCredentials(email, password);

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  res.json({
    accessToken,
    refreshToken,
    expiresIn: 900  // 15 minutes in seconds
  });
});

app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // Check if token was revoked
    const isRevoked = await tokenService.isRevoked(decoded.jti);
    if (isRevoked) {
      throw new Error('Token revoked');
    }

    const user = await userService.findById(decoded.userId);
    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    res.json({ accessToken: newAccessToken, expiresIn: 900 });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

**Phase recommendation:** Authentication phase — implement refresh flow alongside auth.

---

### 4.3 Missing Offline Sync Support (Critical for Astro_Beacon)

**What goes wrong:** App fails when network unavailable — astronauts need functionality in any condition.

**Why it happens:** Backend designed assuming always-online clients.

**Consequences:**
- Core feature unusable offline (rejected by professor requirements)
- Data loss when connectivity fails
- Poor UX during network transitions

**Prevention — Backend API Design for Offline:**
```javascript
// ✅ 1. Support for client-generated IDs
app.post('/sync/push', async (req, res) => {
  const { deviceId, changes } = req.body;

  const results = await Promise.all(changes.map(async (change) => {
    const { entityType, clientId, operation, payload, clientTimestamp } = change;

    // Client-generated ID prevents conflicts
    const existing = await checkByClientId(entityType, clientId);
    if (existing) {
      // Conflict detection
      if (existing.updatedAt > clientTimestamp) {
        return { clientId, status: 'conflict', serverVersion: existing };
      }
      return { clientId, status: 'skipped' };
    }

    // Process create/update/delete
    await processOfflineChange(entityType, clientId, operation, payload);
    return { clientId, status: 'success' };
  }));

  res.json({ results });
});

// ✅ 2. Delta sync (only changed records since last sync)
app.get('/sync/pull', async (req, res) => {
  const { deviceId, lastSyncTimestamp, cursor } = req.query;

  // Query only records modified since last sync
  const changes = await ChangeLog.find({
    updatedAt: { $gt: new Date(lastSyncTimestamp) }
  })
  .sort({ updatedAt: 1 })
  .limit(100)
  .lean();

  res.json({
    changes: changes.map(c => ({
      entity: c.entityType,
      id: c.entityId,
      operation: c.operation,
      data: c.newState,
      serverTimestamp: c.updatedAt
    })),
    nextCursor: changes.length === 100 ? changes[99].updatedAt : null
  });
});

// ✅ 3. Endpoints that work offline-first
// POST /logbook (creates locally with client-generated ID)
// GET /logbook (serves locally cached data)
// PATCH /logbook/:id (queues for sync when online)
```

**Phase recommendation:** Offline features phase — backend must support sync patterns, not just CRUD.

---

### 4.4 Not Handling Network Timeouts

**What goes wrong:** Mobile app hangs waiting for responses that never come.

**Why it happens:** Default timeout is too long or infinite for mobile networks.

**Consequences:**
- App freezes on poor connections
- Battery drain from waiting connections
- User frustration

**Prevention:**
```javascript
// ✅ Set reasonable timeouts on both sides

// Server side - Express/Node
const server = app.listen(PORT, () => {
  // Set keep-alive timeout
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
});

// ✅ Implement request timeout middleware
const timeout = require('connect-timeout');
app.use('/api/', timeout('10s'), haltOnTimedout);

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

// ✅ Client side - Mobile API client
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,  // 10 second timeout
  retryConfig: {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => {
      return error.code === 'ECONNABORTED' ||
             error.code === 'ETIMEDOUT' ||
             !error.response;
    }
  }
});

// ✅ Implement circuit breaker for degraded states
const CircuitBreaker = require('opossum');
const breaker = new CircuitBreaker(apiCall, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});
```

**Phase recommendation:** API foundation phase — timeouts and retry logic from day one.

---

## 5. Prevention Strategy Summary

### Phase-by-Phase Recommendations

| Phase | Pitfalls to Address | Quick Wins |
|-------|---------------------|------------|
| **Project Init** | Architecture structure, circular deps | Set up folder structure, DI pattern |
| **API Foundation** | Error handling, pagination, timeouts | Global error handler, pagination helper |
| **Authentication** | Password storage, JWT, rate limiting | bcrypt, env secrets, auth rate limiter |
| **Core Endpoints** | Input validation, response format, N+1 | express-validator, response formatter |
| **Integration** | CORS, offline sync | Test on mobile, sync API design |
| **Production Ready** | Security hardening, performance | Helmet, caching, load testing |

### Quick Wins to Implement Early (Week 1)

1. **Global error handler** — Prevents inconsistent error responses
2. **Input validation middleware** — Stops bad data at the gate
3. **bcrypt password hashing** — Non-negotiable security
4. **Pagination helper** — Prevents memory issues
5. **Response formatter** — Consistent API contract
6. **CORS configuration** — Test on actual mobile devices early

### Testing Strategies

| Pitfall | Test Strategy |
|---------|---------------|
| Password security | Unit test: hash never equals input, different salts each time |
| Input validation | Integration test: send malformed data, verify 400 + error details |
| JWT expiration | Integration test: expire token, verify 401 |
| Pagination | Load test: request 10K records, verify limit enforcement |
| N+1 queries | Performance test: monitor query count per request |
| Offline sync | Manual test: airplane mode, perform actions, reconnect, verify sync |
| CORS | Manual test: request from mobile device (not browser) |

---

## Critical Pitfalls Summary Table

| Pitfall | Severity | Prevention Complexity | Phase to Address |
|---------|----------|----------------------|------------------|
| Plain text passwords | CRITICAL | Low | Authentication (Week 2) |
| Missing JWT secret | CRITICAL | Low | Authentication (Week 2) |
| No input validation | CRITICAL | Medium | Foundation (Week 1) |
| No error handling | HIGH | Low | Foundation (Week 1) |
| N+1 queries | HIGH | Medium | Foundation (Week 1) |
| Missing pagination | HIGH | Low | Foundation (Week 1) |
| CORS misconfiguration | HIGH | Low | Integration (Week 3) |
| No rate limiting | HIGH | Low | Security (Week 2) |
| Offline not supported | CRITICAL | High | Integration (Week 4) |
| Business logic in routes | MEDIUM | Medium | Architecture (Week 1) |
| Inconsistent responses | MEDIUM | Low | Foundation (Week 1) |
| No token refresh | MEDIUM | Medium | Authentication (Week 2) |

---

## Sources

- **Express.js Security Best Practices** (Official) — expressjs.com/en/advanced/best-practice-security.html [HIGH]
- **Common Mistakes in Express.js** (Medium, 2025-12) — medium.com/@uyanhewagetr [MEDIUM]
- **Top 10 Mistakes Developers Make with Express.js** (Medium, 2025-05) — medium.com/@shankhwarshipra2001 [MEDIUM]
- **Production-Ready Node.js Express API** (OneUptime, 2026-02) — oneuptime.com [HIGH]
- **Building REST APIs with Express.js: Complete Guide** (Grizzly Peak, 2026-02) — grizzlypeaksoftware.com [HIGH]
- **Express.js JWT Authentication Guide** (CodeFixes, 2025-08) — codefixeshub.com [MEDIUM]
- **Authentication Strategies in Express** (TheLinuxCode, 2026-02) — thelinuxcode.com [HIGH]
- **Node.js Auth Security Best Practices** (Authgear, 2026-03) — authgear.com [HIGH]
- **8 Advanced REST API Pitfalls** (JavaScript in Plain English, 2025-07) — javascript.plainenglish.io [MEDIUM]
- **Offline-First Done Right** (DevelopersVoice, 2025-09) — developersvoice.com [MEDIUM]
- **How to Design an Offline-Friendly Backend** (Medium, 2026-02) — medium.com/@ranju.r [MEDIUM]
- **Expo and Express: Web + Mobile Dev** (Keyhole Software, 2025-01) — keyholesoftware.com [MEDIUM]
- **React Native Expo Network Issues** (Stack Overflow) — stackoverflow.com [MEDIUM]
