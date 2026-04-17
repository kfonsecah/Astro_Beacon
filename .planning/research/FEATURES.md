# Feature Landscape: Astro Beacon REST API

**Domain:** Planetary exploration survival app — REST API backend
**Researched:** 2026-04-16
**Confidence:** HIGH

## Executive Summary

This API serves a single-astronaut survival mobile app on an unknown planet. The astronaut must track resources (O2, water, food), log discoveries in a bitácora, identify species with AI, manage exploration trips with oxygen budgets, and collect NASA supply drops via GPS. The API must support **offline-first** mobile behavior where the app works disconnected and syncs when reconnected.

**Critical insight:** This is a **single-user system** — one astronaut per installation. User isolation is needed for session management, but most queries are `WHERE astronautId = currentUser`. This simplifies authorization but means every entity has a hard dependency on the authenticated session.

---

## 1. Authentication Features

### Table Stakes (Must Have)

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|---------------------|
| **User Registration** | Course requirement: "El sistema debe implementar seguridad" | Low | Email/password, returns JWT immediately (auto-login pattern) |
| **Login (JWT Token)** | Course requirement: session-based auth | Low | Returns access token + optional refresh token |
| **Token Refresh** | Prevent frequent re-logins during active sessions | Medium | Silent refresh before expiry, sliding expiration |
| **Session Expiration** | Course requirement: "sesión debe expirar tras período de inactividad" | Medium | 15-30 min inactivity timeout, server-side session tracking |
| **Password Reset Flow** | Industry standard, defensive | Medium | Email-based reset link with expiry token |
| **Logout (Token Invalidation)** | Security best practice | Low | Blacklist refresh token or mark session inactive |

### Differentiators (Nice to Have)

| Feature | Value Proposition | Complexity | When to Build |
|---------|-------------------|------------|---------------|
| **OAuth2 Social Login** | Faster onboarding (Google, Apple) | Medium | If supporting multiple users later |
| **2FA/MFA** | Enhanced security | High | Out of scope for single-user app |
| **Login Activity Log** | Audit trail for security | Low | Nice for defense demonstration |

### Anti-Features (Avoid)

| Anti-Feature | Why Avoid | Instead |
|--------------|-----------|---------|
| **Session cookies (HTTP-only)** | Mobile apps don't handle cookies well, JWT in headers is standard | JWT Bearer tokens in Authorization header |
| **Role-based access control (RBAC)** | Single user = single role ("astronaut") | User ID filtering on all queries |
| **API key authentication** | Designed for server-to-server, not mobile-to-server | JWT only |

### Authentication Endpoint Specifications

```
POST /api/v1/auth/register
  Body: { email, password, name }
  Response: { success, data: { user, token, refreshToken } }
  Notes: Auto-login after registration, no email verification (MVP)

POST /api/v1/auth/login
  Body: { email, password }
  Response: { success, data: { user, token, refreshToken, expiresIn } }
  Notes: Token typically 1h, refresh token 7d

POST /api/v1/auth/refresh
  Body: { refreshToken }
  Response: { success, data: { token, refreshToken, expiresIn } }
  Notes: Issues new token pair, invalidates old refresh token

POST /api/v1/auth/logout
  Headers: Authorization: Bearer <token>
  Response: { success, message: "Logged out" }
  Notes: Invalidates refresh token in database

POST /api/v1/auth/forgot-password
  Body: { email }
  Response: { success, message: "Reset email sent" }
  Notes: Generates reset token, sends email (or logs to console in dev)

POST /api/v1/auth/reset-password
  Body: { resetToken, newPassword }
  Response: { success, data: { user, token } }
  Notes: Reset token expires in 1h

GET /api/v1/auth/me
  Headers: Authorization: Bearer <token>
  Response: { success, data: { user } }
  Notes: Returns current astronaut profile
```

### Feature Dependencies

```
User Registration → Login → Token Storage (mobile)
Login → Token Refresh → Session Expiration Check
Forgot Password → Reset Password → Login
```

---

## 2. Domain Endpoints

### 2.1 Astronaut (User Profile)

**Purpose:** Own astronaut profile, track base location and status.

#### Table Stakes

| Endpoint | Method | Purpose | Complexity |
|----------|--------|---------|------------|
| Get own profile | GET | Fetch astronaut data | Low |
| Update profile | PATCH | Update name, base location | Low |
| Get activity summary | GET /stats | Dashboard metrics | Medium |

```
GET /api/v1/astronauts/me
  Response: { id, name, email, status, currentPlanet, baseCampLocation, lastActiveAt }
  Notes: All other astronaut endpoints are /me, no /astronauts/:id

PATCH /api/v1/astronauts/me
  Body: { name?, currentPlanet?, baseCampLocation? }
  Response: { success, data: { astronaut } }

GET /api/v1/astronauts/me/stats
  Response: {
    totalDiscoveries: number,
    totalTrips: number,
    resourcesCollected: number,
    oxygenConsumed: number,
    survivalDays: number
  }
  Notes: Aggregated for dashboard display
```

#### Differentiators

| Endpoint | Value Proposition | Complexity |
|----------|-------------------|------------|
| Update avatar | Personalization | Low |
| Update status (emergency mode) | Course requirement: status field | Low |
| Export all data (GDPR-style) | Data ownership | Medium |

---

### 2.2 Resources (Inventory Management)

**Purpose:** Track survival resources (O2, water, food, medical, equipment). Must generate alerts when below threshold.

#### Table Stakes

| Endpoint | Method | Purpose | Complexity |
|----------|--------|---------|------------|
| List all resources | GET | Dashboard view | Low |
| Get single resource | GET /:id | Detail view | Low |
| Update resource amount | PATCH /:id | Add/subtract quantities | Medium |
| Get resource history | GET /:id/movements | Income/expense log | Low |
| Add resource movement | POST /:id/movements | Record income or expense | Low |

```
GET /api/v1/resources
  Query: ?includeCritical=true
  Response: { success, data: { resources: Resource[], criticalAlerts: Resource[] } }
  Notes: Returns all resources, flagged if below threshold

GET /api/v1/resources/:id
  Response: { success, data: { resource } }

PATCH /api/v1/resources/:id
  Body: { currentAmount }
  Response: { success, data: { resource, previousAmount } }
  Notes: Direct set, prefer movements for income/expense

POST /api/v1/resources/:id/movements
  Body: { type: "income" | "expense", amount: number, reason: string }
  Response: { success, data: { movement, resource: updatedResource } }
  Notes: Automatically updates resource.currentAmount

GET /api/v1/resources/:id/movements
  Query: ?page=1&limit=20&type=expense
  Response: { success, data: { movements }, pagination }
  Notes: Paginated history for detail screen

GET /api/v1/resources/alerts
  Response: { success, data: { alerts: Resource[] } }
  Notes: Resources where currentAmount < minAlertThreshold
```

#### Resource Movement Types

| Type | Trigger | Example |
|------|---------|---------|
| income | Resource gained | NASA drop collected, food found |
| expense | Resource consumed | Oxygen used during trip, water drunk |
| adjustment | Manual correction | Inventory recount, supply error fixed |
| transfer | Resource moved | Water transferred between containers |

#### Differentiators

| Endpoint | Value Proposition | Complexity |
|----------|-------------------|------------|
| Bulk update resources | NASA drop collection in one call | Medium |
| Low stock notifications (push) | Alert astronaut proactively | Medium |
| Consumption rate calculation | Predict when O2 runs out | Medium |

---

### 2.3 Species / Bitácora (Discovery Logbook)

**Purpose:** Catalog species discovered on the planet. AI classification of photos, danger level tracking, audio narration.

#### Table Stakes

| Endpoint | Method | Purpose | Complexity |
|----------|--------|---------|------------|
| List all species | GET | Bestiary screen | Low |
| Get single species | GET /:id | Detail view | Low |
| Create entry (with photo) | POST | Add discovery | High |
| Update species | PATCH /:id | Edit classification, notes | Low |
| Identify from photo | POST /identify | AI classification | High |
| Get nearby species | GET /nearby | Map integration | Medium |

```
GET /api/v1/species
  Query: ?classification=animal&dangerLevel=dangerous&page=1&limit=20
  Response: { success, data: { species }, pagination }
  Notes: Filter by classification (animal, plant, resource, microorganism, other)

GET /api/v1/species/:id
  Response: { success, data: { species: { id, name, classification, dangerLevel, description, imageUrl, discoveredAt, aiConfidence, location } } }

POST /api/v1/species
  Headers: Content-Type: multipart/form-data
  Body: { name?, description, classification?, dangerLevel?, image: file, location? }
  Response: { success, data: { species } }
  Notes: File upload for photo, optional AI classification on server side

PATCH /api/v1/species/:id
  Body: { name?, description?, classification?, dangerLevel?, notes? }
  Response: { success, data: { species } }
  Notes: Manual override of AI classification (course requirement: user can correct AI)

POST /api/v1/species/identify
  Headers: Content-Type: multipart/form-data
  Body: { image: file }
  Response: { success, data: { classification, dangerLevel, confidence, suggestions } }
  Notes: AI classification endpoint, returns results without saving

GET /api/v1/species/nearby
  Query: ?lat=-33.8688&lng=151.2093&radius=500
  Response: { success, data: { species: Species[] } }
  Notes: For map overlay, return species near current location

GET /api/v1/species/export
  Response: { success, data: { downloadUrl } }
  Notes: Export bitácora as JSON or PDF for offline viewing
```

#### Classification Enum

| Value | Description | Example |
|-------|-------------|---------|
| animal | Living creatures that move | Alien insects, predators |
| plant | Stationary life forms | Crystalline flora, moss |
| resource | Natural resources | Minerals, water deposits |
| microorganism | Microscopic life | Bacteria, spores |
| other | Unclassified | Anomalies, unknown phenomena |
| unknown | Pending classification | Awaiting AI or manual classification |

#### Danger Level Enum

| Value | Description | UI Color |
|-------|-------------|----------|
| friendly | Safe to approach | Green |
| cautious | Approach with care | Yellow |
| dangerous | Hazardous, avoid | Orange |
| lethal | Deadly on contact | Red |

#### Differentiators

| Endpoint | Value Proposition | Complexity |
|----------|-------------------|------------|
| Batch create entries | Upload multiple photos at once | Medium |
| Species comparison | Compare two species side-by-side | Medium |
| Species timeline | View discoveries chronologically | Low |
| Audio narration (TTS) | Generate audio description | Low (offload to client with expo-speech) |

---

### 2.4 Logbook Entries (Discovery Journal)

**Purpose:** Detailed journal entries linking to species, with photos, descriptions, and GPS locations.

#### Table Stakes

| Endpoint | Method | Purpose | Complexity |
|----------|--------|---------|------------|
| List entries | GET | Journal feed | Low |
| Get entry | GET /:id | Entry detail | Low |
| Create entry | POST | New journal entry | Medium |
| Update entry | PATCH /:id | Edit entry | Low |
| Delete entry | DELETE /:id | Remove entry | Low |

```
GET /api/v1/logbook
  Query: ?page=1&limit=20&speciesId=xxx&from=2026-01-01&to=2026-04-16
  Response: { success, data: { entries }, pagination }
  Notes: Chronological feed, filterable by species or date range

GET /api/v1/logbook/:id
  Response: { success, data: { entry: { id, description, imageUrl, location, species, createdAt, syncedAt } } }

POST /api/v1/logbook
  Headers: Content-Type: multipart/form-data
  Body: { description, image: file?, speciesId?, location: { lat, lng } }
  Response: { success, data: { entry } }
  Notes: Creates entry, optionally links to existing species

PATCH /api/v1/logbook/:id
  Body: { description?, image?: file, speciesId?, location? }
  Response: { success, data: { entry } }
  Notes: Full or partial update

DELETE /api/v1/logbook/:id
  Response: { success, message: "Entry deleted" }
  Notes: Soft delete or hard delete based on sync requirements
```

#### Offline Sync Support (Critical)

```
POST /api/v1/logbook/sync
  Body: { entries: [{ localId, description, imageUri, location, speciesId?, createdAt }] }
  Response: { success, data: { synced: [{ localId, serverId }], failed: [...] } }
  Notes: Bulk sync endpoint for offline-created entries
```

---

### 2.5 Trips (Exploration Management)

**Purpose:** Track exploration trips, oxygen consumption during EVA, resource collection.

#### Table Stakes

| Endpoint | Method | Purpose | Complexity |
|----------|--------|---------|------------|
| List trips | GET | Trip history | Low |
| Get trip | GET /:id | Trip detail | Low |
| Start trip | POST | Begin exploration | Medium |
| End trip | PATCH /:id/end | Complete or abort trip | Medium |
| Update location | PATCH /:id/location | GPS ping during trip | Medium |
| Log oxygen consumed | POST /:id/oxygen | Record O2 usage | Low |

```
GET /api/v1/trips
  Query: ?status=active&page=1&limit=10
  Response: { success, data: { trips }, pagination }
  Notes: Include trip stats (oxygen consumed, distance, duration)

GET /api/v1/trips/:id
  Response: { success, data: { trip: { id, status, destination, startedAt, oxygenBudget, oxygenConsumed, resourcesCollected, waypoints } } }

POST /api/v1/trips
  Body: { destination: { lat, lng }, oxygenBudget: number, notes? }
  Response: { success, data: { trip } }
  Notes: Creates trip with status="planned", astronaut must manually start

POST /api/v1/trips/:id/start
  Body: { currentLocation: { lat, lng } }
  Response: { success, data: { trip } }
  Notes: Changes status to "active", starts tracking

POST /api/v1/trips/:id/oxygen
  Body: { amount: number, reason: string }
  Response: { success, data: { trip, remainingBudget } }
  Notes: Log O2 consumption, auto-calculates remaining

PATCH /api/v1/trips/:id/waypoint
  Body: { location: { lat, lng } }
  Response: { success, data: { trip } }
  Notes: GPS ping to track route

PATCH /api/v1/trips/:id/end
  Body: { status: "completed" | "aborted", finalLocation: { lat, lng }, collectedResources?: [...] }
  Response: { success, data: { trip, summary: { totalO2Consumed, totalDistance, resourcesGathered } } }
  Notes: Finalizes trip, calculates stats, triggers resource income

GET /api/v1/trips/active
  Response: { success, data: { trip: Trip | null } }
  Notes: Get currently active trip (for resume functionality)
```

#### Trip Status Enum

| Status | Description | Transitions To |
|--------|-------------|----------------|
| planned | Trip created, not started | active, aborted |
| active | Astronaut is exploring | completed, aborted |
| completed | Trip finished successfully | (terminal) |
| aborted | Trip ended early (emergency) | (terminal) |

#### Differentiators

| Endpoint | Value Proposition | Complexity |
|----------|-------------------|------------|
| Trip route replay | View completed trip on map | Medium |
| Oxygen forecast | Predict O2 at current consumption rate | Medium |
| Auto-abort on critical O2 | Safety feature, aborts if O2 < 10% | Medium |

---

### 2.6 Supply Drops (NASA Resource Packages)

**Purpose:** GPS-tracked NASA supply drops that astronaut must collect.

#### Table Stakes

| Endpoint | Method | Purpose | Complexity |
|----------|--------|---------|------------|
| List supply drops | GET | Map view | Low |
| Get supply drop | GET /:id | Drop detail | Low |
| Update drop status | PATCH /:id/collect | Mark as collected | Low |
| Get nearby drops | GET /nearby | Drops within radius | Medium |

```
GET /api/v1/supplies
  Query: ?status=delivered&page=1&limit=20
  Response: { success, data: { supplies }, pagination }
  Notes: Filter by status (pending, delivered, collected, expired)

GET /api/v1/supplies/nearby
  Query: ?lat=-33.8688&lng=151.2093&radius=5000
  Response: { success, data: { supplies: SupplyDrop[] } }
  Notes: For map overlay, sorted by distance

GET /api/v1/supplies/:id
  Response: { success, data: { supply: { id, location, status, contents: ResourceItem[], droppedAt, expiresAt } } }

PATCH /api/v1/supplies/:id/collect
  Body: { collectedResources: [{ resourceId, amount }] }
  Response: { success, data: { supply, movements: ResourceMovement[] } }
  Notes: Marks drop as collected, creates resource income movements
```

#### Supply Drop Status Enum

| Status | Description |
|--------|-------------|
| pending | Drop incoming, not yet landed |
| delivered | Drop has landed, awaiting collection |
| collected | Astronaut has collected |
| expired | Drop has expired (uncollected) |

#### Supply Contents Structure

```typescript
interface SupplyContents {
  resourceId: string;
  resourceName: string;
  amount: number;
  unit: string;
}
```

---

## 3. Common API Patterns

### 3.1 Pagination

**Standard cursor-based pagination for lists:**

```
GET /api/v1/{resource}
  Query: ?page=1&limit=20&sort=createdAt&order=desc
  Response:
  {
    success: true,
    data: { items: [...] },
    pagination: {
      page: 1,
      limit: 20,
      total: 150,
      totalPages: 8,
      hasNext: true,
      hasPrev: false
    }
  }
```

**For large datasets or real-time data, consider cursor-based:**

```
GET /api/v1/{resource}
  Query: ?cursor=abc123&limit=20
  Response:
  {
    success: true,
    data: { items: [...] },
    pagination: {
      nextCursor: "def456",
      hasMore: true
    }
  }
```

### 3.2 Filtering and Sorting

**Common filter patterns:**

```
GET /api/v1/species
  ?classification=animal,plant          # Multi-value filter (OR)
  ?dangerLevel=lethal&classification=animal  # Combined filters (AND)
  ?search=alien                          # Full-text search on name
  ?discoveredAfter=2026-01-01            # Date range
  ?minConfidence=0.8                    # Numeric threshold

GET /api/v1/resources
  ?category=oxygen,water                # Filter by category
  ?belowThreshold=true                   # Resources in alert state
  ?sort=currentAmount&order=asc         # Sort by current level
```

### 3.3 Offline Sync Support

**Strategy: `lastModified` timestamps + bulk sync endpoint**

```
GET /api/v1/sync/state
  Headers: Authorization: Bearer <token>
  Query: ?since=2026-04-10T00:00:00Z
  Response:
  {
    success: true,
    data: {
      resources: { items: [...], lastModified: "2026-04-16T10:00:00Z" },
      species: { items: [...], lastModified: "2026-04-15T14:30:00Z" },
      logbook: { items: [...], lastModified: "2026-04-16T09:00:00Z" },
      supplies: { items: [...], lastModified: "2026-04-14T08:00:00Z" }
    }
  }
```

**Mobile sync flow:**

1. **On reconnect:** GET /sync/state?since={lastSyncTimestamp}
2. **Merge server data:** Update local store with server changes
3. **Push pending changes:** POST /{entity}/sync with queued operations
4. **Conflict resolution:** Last-write-wins (compare timestamps)
5. **Update sync timestamp:** Store current time for next sync

**Bulk sync endpoint:**

```
POST /api/v1/{entity}/sync
  Body:
  {
    operations: [
      { type: "create", localId: "local-123", data: {...}, timestamp: "..." },
      { type: "update", localId: "local-456", serverId: "abc", data: {...}, timestamp: "..." }
    ]
  }
  Response:
  {
    success: true,
    data: {
      synced: [{ localId, serverId }],
      conflicts: [{ localId, reason, resolution: "server_wins" }],
      failed: [{ localId, error }]
    }
  }
```

### 3.4 File Upload for Photos

**Multi-part form upload with compression:**

```
POST /api/v1/species
  Headers: Content-Type: multipart/form-data
  Body:
  {
    description: "Found near water source",
    image: [binary data],
    location: { lat: -33.8688, lng: 151.2093 }
  }
  Response:
  {
    success: true,
    data: {
      species: { ..., imageUrl: "/uploads/species/abc123.jpg" }
    }
  }

Configuration:
- Max file size: 5MB
- Allowed formats: JPEG, PNG, WebP
- Server-side compression: sharp library (optional)
- Image URL returned for subsequent requests
```

**For large files or slow connections, consider chunked upload:**

```
POST /api/v1/upload/init
  Body: { filename, mimeType, size }
  Response: { uploadId, chunkSize }

POST /api/v1/upload/:uploadId/chunk
  Body: { chunkIndex, data: [binary] }
  Response: { received: true, chunksRemaining }

POST /api/v1/upload/:uploadId/complete
  Response: { fileUrl }
```

### 3.5 Error Response Format

**Standardized error structure:**

```typescript
{
  success: false,
  error: {
    code: "RESOURCE_NOT_FOUND",
    message: "Species with ID xyz not found",
    details?: { field: "id", value: "xyz" }
  }
}
```

**HTTP Status Codes:**

| Code | Use Case |
|------|----------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (token valid but no access) |
| 404 | Not Found |
| 409 | Conflict (duplicate, version mismatch) |
| 422 | Unprocessable Entity (business rule violation) |
| 429 | Too Many Requests (rate limiting) |
| 500 | Internal Server Error |

---

## 4. Feature Dependencies

```
Authentication
├── User Registration → Create Astronaut profile
├── Login → JWT issued → All subsequent requests authenticated
├── Token Refresh → Session continues
└── Logout → Token invalidated → Requires re-auth

Astronaut (Profile)
└── View Dashboard Stats → Aggregates from all other entities

Resources
├── List Resources → Dashboard display
├── Update Amount → Via Resource Movements
├── Movement History → Audit trail
└── Alerts → Triggered when below threshold

Species
├── List Species → Bestiary screen
├── Identify → AI classification (external API call)
├── Create Entry → File upload + location
└── Nearby → Map overlay

Logbook
├── List Entries → Journal feed
├── Create Entry → Optional species link
└── Sync → Offline support

Trips
├── Start Trip → Creates planned trip → Activates
├── Log Oxygen → Decreases oxygen budget
├── Update Location → GPS tracking
└── End Trip → Marks complete → Resource income

Supplies
├── List Nearby → Map display
├── Collect → Resource income → Updates resources
└── Expiration check → Background job (optional)
```

---

## 5. MVP Recommendation

### Prioritize (Phase 1 of API)

1. **Authentication** — Login, register, token refresh, logout
2. **Resources** — CRUD, movements, alerts
3. **Species** — CRUD with basic classification (no AI in MVP)
4. **Logbook** — CRUD with photo upload

### Defer (Phase 2+)

| Feature | Why Defer | Implementation Effort |
|---------|-----------|----------------------|
| AI Species Classification | Requires external API integration, prompt engineering | High |
| Trip GPS Tracking | Needs background location on mobile | Medium |
| Offline Sync | Complex conflict resolution, queue management | High |
| Push Notifications | Requires push service setup | Medium |
| Supply Drop Expiration | Needs background job/cron | Low |

### Anti-Features to Avoid

| Don't Build | Why | Instead |
|------------|-----|---------|
| User roles/permissions | Single user, astronaut = admin | User ID filtering |
| Multi-tenant architecture | One astronaut per deployment | Single astronaut context |
| Complex RBAC | Overkill for survival app | Hardcoded permissions |
| Real-time WebSocket | Not required by spec | Polling if needed |
| GraphQL | Adds complexity without benefit | REST is simpler for mobile |

---

## Sources

- Project requirements (`project-requirements.md`) — Domain requirements, course rubric
- Phase 1 research (`01-RESEARCH.md`) — Technology stack, architecture patterns
- Phase 2 data design plan (`02-01-PLAN.md`) — Entity definitions, offline strategy
- Express.js best practices — REST API conventions
- JWT authentication patterns — Industry standard implementation

---

## Open Questions

1. **Image storage:** Where to store uploaded photos?
   - Options: Local filesystem (Nginx serve), AWS S3, Cloudinary, Base64 in MongoDB
   - Recommendation: Cloudinary for easiest integration, S3 for production
   - Status: Needs decision before species/logbook photo upload

2. **AI Classification provider:** Which service for species identification?
   - Options: OpenAI Vision, Google Cloud Vision, custom model
   - Recommendation: OpenAI Vision for prototype simplicity
   - Status: Needs API key + integration in Phase 2

3. **Push notifications:** How to alert astronaut of low resources?
   - Options: Expo Notifications, OneSignal, Firebase Cloud Messaging
   - Status: Defer to Phase 2 unless early prototype needed

4. **Supply drop simulation:** Who creates supply drops?
   - Options: Admin API, scheduled background job, external NASA system
   - Status: Assume admin-only creation for MVP

5. **Session expiration duration:** How long before session times out?
   - Recommendation: 15 minutes inactivity (matches course requirement)
   - Implementation: Redis for session tracking, or token expiry check
