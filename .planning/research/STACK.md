# Technology Stack: Astro_Beacon REST API

**Project:** Astro_Beacon API Backend
**Researched:** 2026-04-16
**Purpose:** REST API with Node.js + Express v4 for Astro_Beacon mobile app

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|-----------|---------|---------|-----|
| **Node.js** | 20+ LTS | Runtime | LTS stability, ESM support, modern async patterns |
| **Express** | ^4.21.x | Web framework | User requirement, mature ecosystem, middleware model |
| **TypeScript** | ^5.x | Language | Type safety, better DX, catches errors at compile time |

### Database

| Technology | Version | Purpose | Why |
|-----------|---------|---------|-----|
| **MongoDB** | 7.x | Primary database | Flexible schema for evolving domain entities, works well with nested data (species classifications, resource hierarchies) |
| **Mongoose** | ^8.x | ODM | TypeScript support, schema validation, lifecycle hooks, middleware |

**Why MongoDB over alternatives:**
- **vs PostgreSQL**: Schema flexibility matters for evolving species/resource classifications
- **vs SQLite**: Not suitable for production API with concurrent users
- **vs MySQL**: MongoDB's document model fits hierarchical domain data better

### Authentication

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **jsonwebtoken** | ^9.x | JWT handling | RFC-compliant, supports both HS256/RS256, async API |
| **bcryptjs** | ^2.x | Password hashing | Async API, 12 rounds recommended for production |
| **cookie-parser** | ^1.x | Cookie handling | For refresh token storage (httpOnly cookies) |

**Why not Passport.js:** Adds complexity without value for simple JWT auth. Passport is better for OAuth flows, not JWT-based auth.

### Validation

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **zod** | ^3.x | Schema validation | TypeScript-first, type inference, ~11KB gzipped, 20M+ weekly downloads |

**Why Zod over alternatives:**
- **vs Joi**: Zod has native TypeScript inference (`z.infer<typeof schema>`), smaller bundle size, and modern API
- **vs express-validator**: Zod provides compile-time + runtime type safety
- **vs Yup**: Better TypeScript integration, actively maintained

### Security Middleware

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **helmet** | ^8.x | Security headers | Sets CSP, HSTS, X-Frame-Options, etc. automatically |
| **cors** | ^2.x | Cross-origin | Configurable origins, supports credentials |
| **express-rate-limit** | ^7.x | Rate limiting | Protects against brute force, configurable windows |
| **express-async-errors** | ^3.x | Async error handling | Eliminates need for try/catch in every handler |

### API Documentation

| Tool | Purpose | Use Case |
|------|---------|----------|
| **Postman** | API testing & documentation | Manual testing, shareable collections, environment variables |
| **swagger-ui-express** | OpenAPI documentation | Auto-generated interactive docs at `/api-docs` |

**Why Postman over Swagger for initial dev:**
- Faster iteration for manual testing
- Environment variables for dev/prod switching
- Easy to share collections with team

### Testing

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **jest** | ^29.x | Test runner | Mature, parallel execution, coverage reports |
| **supertest** | ^6.x | HTTP assertions | Tests Express routes without starting real server |
| **mongodb-memory-server** | ^9.x | In-memory DB | Fast tests without requiring real MongoDB instance |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **tsx** | ^4.x | TypeScript runner (faster than ts-node) |
| **dotenv** | ^16.x | Environment variables |
| **nodemon** | ^3.x | Dev server auto-restart |
| **eslint** | ^9.x | Linting |
| **prettier** | ^3.x | Code formatting |

---

## Project Structure

```
api/
├── src/
│   ├── config/
│   │   └── index.ts           # Environment configuration
│   ├── controllers/           # Route handlers (HTTP layer)
│   │   ├── auth.controller.ts
│   │   └── [domain].controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT verification
│   │   ├── error.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── models/                # Mongoose schemas
│   │   ├── user.model.ts
│   │   └── [domain].model.ts
│   ├── routes/                # Express route definitions
│   │   ├── auth.routes.ts
│   │   └── [domain].routes.ts
│   ├── services/              # Business logic layer
│   │   ├── auth.service.ts
│   │   └── [domain].service.ts
│   ├── schemas/               # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   └── [domain].schema.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── express.d.ts      # Extended Express types
│   │   └── index.ts
│   ├── utils/                 # Helper functions
│   │   ├── asyncHandler.ts
│   │   └── AppError.ts
│   ├── app.ts                # Express app setup
│   └── server.ts             # Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Installation Commands

```bash
# Initialize project
mkdir api && cd api
npm init -y

# Core dependencies
npm install express mongoose dotenv

# Authentication
npm install jsonwebtoken bcryptjs cookie-parser

# Validation
npm install zod

# Security middleware
npm install helmet cors express-rate-limit express-async-errors

# Development dependencies
npm install -D typescript tsx @types/node @types/express @types/jsonwebtoken @types/bcryptjs @types/cookie-parser @types/cors nodemon

# Testing
npm install -D jest @types/jest ts-jest supertest @types/supertest mongodb-memory-server
```

---

## tsconfig.json (Recommended)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/astro_beacon

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

---

## Key Integration Points with Frontend

The frontend already has:
- `api.ts` configured with `baseURL: 'http://localhost:3000/api/v1'`
- JWT token interceptor attaching `Authorization: Bearer <token>`
- Auth store expecting `{ id, name, email }` user object

**API must respond with:**
```json
// POST /api/v1/auth/login
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "65f1a...",
    "name": "Agent Smith",
    "email": "agent@astrobeacon.com"
  }
}
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Database | MongoDB + Mongoose | PostgreSQL + Prisma | MongoDB's document model better fits hierarchical domain data (species, resources) |
| Validation | Zod | Joi | Zod has native TypeScript inference and smaller bundle |
| Auth | JWT + bcrypt | Passport.js | Passport adds complexity without benefit for simple JWT auth |
| Test runner | Jest | Vitest | Jest has wider ecosystem support for Node.js APIs |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Express setup | HIGH | Express v4 is stable, well-documented |
| MongoDB + Mongoose | HIGH | Standard stack, excellent TypeScript support in v8+ |
| Zod validation | HIGH | Clear winner for TypeScript projects in 2026 |
| JWT + bcrypt | HIGH | Battle-tested, recommended by all sources |
| Jest + Supertest | HIGH | Industry standard for Node.js API testing |
| Security middleware | HIGH | All libraries are well-maintained and compatible |

---

## Sources

- [Express.js TypeScript REST API Guide (2026)](https://habitualcs.io/post/developing-a-rest-api-with-expressjs-and-typescript-a-practical-guide) — HIGH
- [Node.js + TypeScript + MongoDB Guide (2026)](https://medium.com/@krishsurya1249/mastering-node-js-with-typescript-2026-guide-build-scalable-apis-with-express-mongodb-668d94936803) — MEDIUM
- [JWT Authentication in Express (2026)](https://thelinuxcode.com/how-i-implement-jwt-authentication-in-an-express-app-production-ready-2026/) — HIGH
- [Node.js Authentication Guide (2026)](https://workos.com/blog/nodejs-authentication-guide-2026) — HIGH
- [Zod vs Joi vs Class-Validator (2026)](https://dev.to/young_gao/input-validation-in-typescript-apis-zod-vs-joi-vs-class-validator-2gcg) — HIGH
- [Jest + Supertest API Testing (2026)](https://dev.to/addwebsolutionpvtltd/testing-nodejs-apis-jest-supertest-and-best-practices-3ddp) — HIGH
- [NPM Package Comparison](https://npm-compare.com/) — HIGH
