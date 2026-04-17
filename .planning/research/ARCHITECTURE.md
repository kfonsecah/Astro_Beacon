# Architecture: REST API with Express v4

**Domain:** Mobile Backend API (Node.js + Express v4)
**Project:** Astro_Beacon - Planetary Exploration Mobile App
**Researched:** 2026-04-16
**Confidence:** HIGH (multiple current sources, Express v4 stable since 2014)

---

## Executive Summary

Express v4 remains the standard choice for Node.js REST APIs due to its maturity, extensive ecosystem, and flexibility. This architecture establishes a layered pattern (Routes → Controllers → Services → Models) that scales from MVP to production. For Astro_Beacon's integration with the existing Expo/React Native frontend, the key considerations are: API versioning under `/api/v1`, JWT-based authentication matching the frontend's existing auth store, and CORS configuration that accommodates mobile clients (not just browsers).

---

## 1. Project Structure

### Recommended Folder Layout

```
astro-beacon-api/
├── src/
│   ├── config/
│   │   ├── index.js           # Environment variables, constants
│   │   ├── database.js        # Database connection (MongoDB)
│   │   └── jwt.js             # JWT secret and config
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── astronaut.controller.js
│   │   ├── resource.controller.js
│   │   ├── logbook.controller.js
│   │   ├── species.controller.js
│   │   ├── trip.controller.js
│   │   └── supply.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── astronaut.service.js
│   │   ├── resource.service.js
│   │   ├── logbook.service.js
│   │   ├── species.service.js
│   │   ├── trip.service.js
│   │   └── supply.service.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── astronaut.model.js
│   │   ├── resource.model.js
│   │   ├── logbook.model.js
│   │   ├── species.model.js
│   │   ├── trip.model.js
│   │   └── supply.model.js
│   │
│   ├── routes/
│   │   ├── index.js           # Central router
│   │   ├── auth.routes.js
│   │   ├── astronaut.routes.js
│   │   ├── resource.routes.js
│   │   ├── logbook.routes.js
│   │   ├── species.routes.js
│   │   ├── trip.routes.js
│   │   └── supply.routes.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT verification
│   │   ├── error.middleware.js    # Global error handler
│   │   ├── validate.middleware.js # Request validation
│   │   └── validate.schema.js     # Zod/Joi schemas
│   │
│   ├── utils/
│   │   ├── response.js        # Standardized response helpers
│   │   ├── logger.js          # Logging utility
│   │   └── async.js           # Async wrapper (avoid try/catch in controllers)
│   │
│   ├── app.js                # Express app configuration
│   └── server.js             # Entry point
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── package.json
└── README.md
```

### Folder Responsibilities

| Folder | Responsibility | Examples |
|--------|----------------|----------|
| `config/` | Environment and app settings | DB URLs, JWT secret, ports |
| `controllers/` | HTTP handling only | Parse request, call service, send response |
| `services/` | Business logic | Data transformations, external API calls |
| `models/` | Database schemas | Mongoose schemas, data shapes |
| `routes/` | URL mapping | Path definitions, middleware binding |
| `middlewares/` | Request processing | Auth, validation, error handling |
| `utils/` | Shared helpers | Response formatters, logging |

### Where to Put Utilities

**Utilities belong in `src/utils/` when:**
- Used in multiple places (validators, formatters, loggers)
- No side effects or dependencies on other layers
- Pure functions or static helpers

**Examples for Astro_Beacon:**
```javascript
// src/utils/response.js
const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data });
};

const error = (res, message, statusCode = 500, errors = null) => {
  const response = { success: false, error: message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

// src/utils/async.js - Wraps async route handlers to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

---

## 2. Layer Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         REQUEST                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  MIDDLEWARE STACK                                               │
│  1. CORS → 2. Helmet → 3. express.json → 4. Route-specific     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  ROUTES        (/api/v1/astronauts)                             │
│  - Maps HTTP method + path to controller                        │
│  - Applies route-level middleware (auth)                         │
│  - NO business logic                                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  CONTROLLER     (astronaut.controller.js)                       │
│  - Receives req, res                                            │
│  - Extracts and validates request data                          │
│  - Calls service methods                                         │
│  - Formats and sends response                                    │
│  - THIN - no business logic                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  SERVICE        (astronaut.service.js)                           │
│  - Contains ALL business logic                                   │
│  - Orchestrates multiple operations                              │
│  - Data transformation and validation                            │
│  - Calls repositories/models                                     │
│  - NO req/res access                                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  MODEL/REPOSITORY (astronaut.model.js)                           │
│  - Database schema definition                                    │
│  - Raw database queries                                          │
│  - NO business logic                                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Separation Matters

| Layer | Why Separate | What It Contains |
|-------|--------------|-----------------|
| Routes | Single responsibility, easy routing changes | Path definitions, HTTP methods |
| Controllers | Testable without HTTP, swap frameworks | Request parsing, response formatting |
| Services | Business logic reusable, testable in isolation | Rules, transformations, external calls |
| Models | Database abstraction, schema changes isolated | Schemas, queries |

### Dependency Injection Pattern

**Recommended for Astro_Beacon:**

```javascript
// src/services/astronaut.service.js
class AstronautService {
  constructor(astronautModel) {
    this.astronautModel = astronautModel;
  }

  async getById(id) {
    return this.astronautModel.findById(id);
  }

  async create(data) {
    // Business logic here
    const astronaut = new this.astronautModel(data);
    return astronaut.save();
  }
}

module.exports = (AstronautModel) => new AstronautService(AstronautModel);

// src/controllers/astronaut.controller.js
const createAstronautService = require('../services/astronaut.service');
const Astronaut = require('../models/astronaut.model');

const astronautService = createAstronautService(Astronaut);

exports.getAstronaut = asyncHandler(async (req, res) => {
  const astronaut = await astronautService.getById(req.params.id);
  if (!astronaut) {
    return error(res, 'Astronaut not found', 404);
  }
  return success(res, astronaut);
});
```

**Alternative (simpler for MVP):** Direct imports (services import models directly). This is acceptable for smaller projects but becomes harder to test.

---

## 3. Data Flow Details

### Request Lifecycle in Express v4

```javascript
// src/server.js
const app = require('./app');
const config = require('./config');

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' })); // For image uploads, increase limit
app.use(express.urlencoded({ extended: true }));

// Health check (before auth)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes - ALL under /api/v1
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler - MUST BE LAST
app.use(errorHandler);

module.exports = app;
```

### Where Validation Happens

**Validation occurs at THREE levels:**

| Level | Tool | What to Validate |
|-------|------|------------------|
| **Route** | Express Router | HTTP method, path existence |
| **Middleware** | auth.middleware.js | JWT token presence and validity |
| **Controller** | validate.middleware.js | Request body, params, query against schemas |
| **Service** | Manual or schema library | Business rules, cross-field validation |

**Recommended: Zod for validation (modern, type-safe, works with TypeScript)**

```javascript
// src/middlewares/validate.middleware.js
const { ZodSchema } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (err) {
    return error(res, 'Validation failed', 400, err.errors);
  }
};

module.exports = validate;

// src/middlewares/validate.schema.js
const { z } = require('zod');

const createAstronautSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    role: z.enum(['commander', 'scientist', 'engineer', 'pilot']),
    status: z.enum(['active', 'inactive']).default('active')
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/)
  })
});

// src/routes/astronaut.routes.js
const validate = require('../middlewares/validate.middleware');
const schema = require('../middlewares/validate.schema');

router.post('/', 
  authMiddleware, 
  validate(schema.createAstronautSchema),
  astronautController.create
);
```

### Business Logic Location

**Business logic ALWAYS lives in services:**

```javascript
// src/services/resource.service.js
class ResourceService {
  // GOOD: Business logic in service
  async consumeResource(astronautId, resourceType, amount) {
    const astronaut = await Astronaut.findById(astronautId);
    if (!astronaut) throw new Error('Astronaut not found');
    
    const resource = await Resource.findOne({ 
      astronautId, 
      type: resourceType 
    });
    
    if (!resource) throw new Error('Resource not found');
    if (resource.current < amount) {
      throw new Error('Insufficient resources');
    }
    
    // Consume and log
    resource.current -= amount;
    resource.history.push({
      type: 'consumption',
      amount,
      timestamp: new Date()
    });
    
    // Check for low resource alert
    if (resource.current < resource.minimum) {
      await this.sendLowResourceAlert(astronautId, resource);
    }
    
    return resource.save();
  }
  
  // GOOD: Complex transformation in service
  async getResourceStats(astronautId) {
    const resources = await Resource.find({ astronautId });
    return resources.map(r => ({
      type: r.type,
      current: r.current,
      percentage: (r.current / r.maximum) * 100,
      status: this.getStatus(r),
      lastUpdated: r.updatedAt
    }));
  }
}
```

### Database Access Patterns

**Use Mongoose for MongoDB (fits the document model of Astro_Beacon entities):**

```javascript
// src/models/resource.model.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  astronautId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Astronaut',
    required: true
  },
  type: {
    type: String,
    enum: ['oxygen', 'food', 'water', 'fuel', 'medicine'],
    required: true
  },
  current: { type: Number, required: true, min: 0 },
  maximum: { type: Number, required: true },
  minimum: { type: Number, required: true },
  unit: { type: String, default: 'units' },
  history: [{
    type: { type: String, enum: ['consumption', 'supply', 'refill'] },
    amount: Number,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}, { timestamps: true });

// Compound index for common queries
resourceSchema.index({ astronautId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Resource', resourceSchema);
```

---

## 4. Integration with Frontend

### API Versioning Strategy

**All endpoints under `/api/v1/` to allow future breaking changes:**

```
/api/v1/auth/register     POST
/api/v1/auth/login        POST
/api/v1/auth/refresh      POST
/api/v1/auth/logout        POST

/api/v1/astronauts         GET, POST
/api/v1/astronauts/:id     GET, PUT, DELETE

/api/v1/resources           GET, POST
/api/v1/resources/:id      GET, PUT, DELETE
/api/v1/resources/stats    GET

/api/v1/logbook            GET, POST
/api/v1/logbook/:id        GET, PUT, DELETE

/api/v1/species            GET, POST
/api/v1/species/:id        GET, PUT, DELETE

/api/v1/trips              GET, POST
/api/v1/trips/:id          GET, PUT, DELETE
/api/v1/trips/:id/start    POST
/api/v1/trips/:id/complete POST

/api/v1/supplies           GET
/api/v1/supplies/nearby    GET
```

### CORS Configuration for Mobile

**Mobile apps (React Native/Expo) don't enforce CORS like browsers**, but you should still configure it properly:

```javascript
// src/config/index.js
module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '*').split(','),
  
  JWT: {
    SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  DATABASE: {
    URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/astro-beacon'
  }
};

// src/app.js - CORS setup
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost
    if (config.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check against allowlist
    if (config.ALLOWED_ORIGINS.includes('*')) {
      return callback(null, true);
    }
    
    if (config.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### JWT Verification Middleware

**Matches existing frontend auth store with Zustand + JWT:**

```javascript
// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const { error } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'No token provided', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, config.JWT.SECRET);
    
    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid token', 401);
    }
    return error(res, 'Authentication failed', 401);
  }
};

// Optional: Role-based access control
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return error(res, 'Insufficient permissions', 403);
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
```

### Error Response Format Consistency

**Standardized error format matching frontend expectations:**

```javascript
// src/middlewares/error.middleware.js
const config = require('../config');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: `${field} already exists`
    });
  }
  
  // JWT errors (handled in middleware, but catch-all here)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

---

## 5. Build Order

### Recommended Implementation Sequence

| Phase | What to Build | Rationale | Duration |
|-------|---------------|-----------|----------|
| **1. Setup** | Project scaffold, dependencies, config, server entry | Foundation must be solid | 1 day |
| **2. Database** | MongoDB connection, User model, basic CRUD | Data layer needed before business logic | 1 day |
| **3. Auth** | Register, login, JWT generation, auth middleware | Frontend auth store expects this | 2 days |
| **4. Auth Integration** | Connect frontend to backend, test login/register | Verify token flow works | 1 day |
| **5. Domain Entities** | Astronaut, Resource, Logbook, Species, Trip, Supply models | Core domain data | 2-3 days |
| **6. Domain Services** | CRUD + business logic for each entity | Where the value lives | 3-4 days |
| **7. Domain Routes** | Wire routes to controllers | Expose the API | 1 day |
| **8. Advanced Features** | Pagination, filtering, offline sync endpoints | Polish and scale | 2 days |
| **9. Error Handling** | Comprehensive error handling, logging | Production readiness | 1 day |

### Critical Path

```
Setup → Database → Auth → Frontend Integration → Domain Entities → Domain Services → Routes
```

### Phase 1: Setup Details

```bash
# Create project
mkdir astro-beacon-api && cd astro-beacon-api
npm init -y

# Install dependencies
npm install express@4 helmet cors dotenv jsonwebtoken bcryptjs mongoose zod
npm install -D nodemon

# Install dev dependencies for TypeScript (optional but recommended)
npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs
```

### Phase 3: Auth Implementation Details

```javascript
// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/user.model');

class AuthService {
  async register(email, password, name) {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });
    
    // Generate tokens
    return this.generateAuthTokens(user);
  }
  
  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }
    
    return this.generateAuthTokens(user);
  }
  
  generateAuthTokens(user) {
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      config.JWT.SECRET,
      { expiresIn: config.JWT.EXPIRES_IN }
    );
    
    return {
      user: { id: user._id, email: user.email, name: user.name },
      accessToken
    };
  }
}

module.exports = new AuthService();
```

---

## 6. Summary

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Layered (Routes → Controllers → Services → Models) | Scalability, testability, maintainability |
| Database | MongoDB with Mongoose | Document model fits domain, mature ecosystem |
| Auth | JWT (access token, no refresh for MVP) | Matches frontend Zustand store |
| Validation | Zod | Type-safe, modern, works with TypeScript |
| Error handling | Centralized middleware | Consistent responses, easier debugging |
| API versioning | `/api/v1/` prefix | Future-proof for breaking changes |
| CORS | Environment-based allowlist | Security + mobile compatibility |

### Integration Points with Existing Frontend

| Frontend Component | API Endpoint | Notes |
|--------------------|--------------|-------|
| `src/services/api.ts` | Already configured for `/api/v1` | No changes needed |
| `src/context/auth.context.tsx` | POST `/api/v1/auth/login`, POST `/api/v1/auth/register` | JWT returned, stored in Zustand |
| Protected screens | All non-auth routes | Use `Authorization: Bearer <token>` header |
| Offline sync | Future: endpoints for batch operations | Design for this now |

### Files to Create

```
astro-beacon-api/
├── src/
│   ├── config/
│   │   ├── index.js         (NEW)
│   │   └── database.js      (NEW)
│   ├── controllers/
│   │   ├── auth.controller.js      (NEW)
│   │   └── [entity].controller.js  (NEW - 6 more)
│   ├── services/
│   │   ├── auth.service.js         (NEW)
│   │   └── [entity].service.js     (NEW - 6 more)
│   ├── models/
│   │   ├── user.model.js           (NEW)
│   │   └── [entity].model.js        (NEW - 6 more)
│   ├── routes/
│   │   ├── index.js                 (NEW)
│   │   ├── auth.routes.js           (NEW)
│   │   └── [entity].routes.js      (NEW - 6 more)
│   ├── middlewares/
│   │   ├── auth.middleware.js      (NEW)
│   │   ├── error.middleware.js     (NEW)
│   │   └── validate.middleware.js   (NEW)
│   ├── utils/
│   │   ├── response.js              (NEW)
│   │   └── async.js                 (NEW)
│   ├── app.js                       (NEW)
│   └── server.js                    (NEW)
├── tests/
│   └── ...                          (NEW)
└── package.json                     (NEW)
```

### Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Folder structure | HIGH | Industry standard, multiple recent sources confirm |
| Layer architecture | HIGH | Battle-tested pattern, Express v4 docs recommend |
| JWT auth | HIGH | Standard pattern, matches frontend implementation |
| CORS for mobile | HIGH | Mobile apps don't enforce CORS, but config included for browser dev |
| Build order | MEDIUM | Recommended based on dependencies; may adjust based on team |
| Database choice | HIGH | MongoDB fits document-heavy domain, Mongoose mature |

---

## Sources

- [Express 4.x API Reference](https://expressjs.com/en/4x/api.html) — Official documentation
- [Stop Writing Spaghetti API Routes](https://dev.to/teguh_coding/stop-writing-spaghetti-api-routes-a-practical-guide-to-clean-expressjs-architecture-3ba7) — DEV Community, March 2026
- [How to Structure Express.js Projects for Scale](https://oneuptime.com/blog/post/2026-02-02-express-project-structure/view) — OneUptime, February 2026
- [How to Build REST APIs with Express and TypeScript](https://oneuptime.com/blog/post/2026-02-03-express-typescript-rest-apis/view) — OneUptime, February 2026
- [Allowing CORS in Express](https://thelinuxcode.com/allowing-cors-in-express-practical-patterns-safer-defaults-and-2026-ready-workflows/) — TheLinuxCode, January 2026
- [Best Practices for Structuring Express.js Applications](https://medium.com/@dwincahya8/best-practices-for-structuring-and-writing-express-js-applications-0fa4fe127f07) — Medium, November 2025
