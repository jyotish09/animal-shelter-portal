# API Reference (Swagger-style)

Base URL (dev): `http://localhost:4000`

## Conventions

### Request ID

- You can send `x-request-id: <any string>` to correlate client logs.
- The server always returns `x-request-id` response header.
- Most endpoints include `requestId` in the JSON body.

### Response envelopes

**Success envelope (most endpoints):**
```json
{
  "data": "...",
  "requestId": "e.g. 2c2a7a1d-..."
}
```

**Paginated success envelope (list endpoints):**
```json
{
  "data": [ "...items..." ],
  "meta": { "page": 1, "limit": 20, "total": 137, "totalPages": 7 },
  "requestId": "e.g. 2c2a7a1d-..."
}
```

**Error envelope (all errors):**
```json
{
  "error": {
    "code": "BAD_REQUEST | NOT_FOUND | CONFLICT | DB_CONSTRAINT | INTERNAL_SERVER_ERROR",
    "message": "Human-readable message",
    "details": "Optional extra info"
  },
  "requestId": "e.g. 2c2a7a1d-..."
}
```

### Pagination

List endpoints support:
- `page` (optional, default `1`, min `1`)
- `limit` (optional, default `20`, min `1`, max `100`)

### Status enums

**Pet status**
- `AVAILABLE` → `PENDING` → `ADOPTED`

**Application status**
- `SUBMITTED` → `APPROVED`
- All other applications for the pet become `INVALIDATED` when one is approved.

---

## Models

### Pet
```json
{
  "id": "uuid",
  "name": "Buddy",
  "breed": "saluki",
  "ageYears": 4,
  "status": "AVAILABLE",
  "imageUrl": "https://images.dog.ceo/...",
  "createdAt": "2026-02-27 12:00:00",
  "updatedAt": "2026-02-27 12:00:00"
}
```

### Application
```json
{
  "id": "uuid",
  "petId": "uuid",
  "applicantName": "Alex Nguyen",
  "contact": "alex.nguyen@example.com",
  "reason": "Looking for a companion and can provide a stable home.",
  "status": "SUBMITTED",
  "createdAt": "2026-02-27 12:00:00",
  "updatedAt": "2026-02-27 12:00:00"
}
```

---

## Endpoints

### Health

#### GET `/api/health`
Simple readiness endpoint.

**Response 200**
```json
{
  "data": {
    "status": "ok",
    "time": "2026-02-27T12:00:00.000Z"
  }
}
```

---

### Pets (Visitor)

#### GET `/api/pets`
List pets (paginated).

**Query params**
- `status` (optional): `AVAILABLE | PENDING | ADOPTED` (currently not strictly validated)
- `page` (optional): number, default `1`
- `limit` (optional): number, default `20`, max `100`

**Response 200**
```json
{
  "data": [ /* Pet[] */ ],
  "meta": { "page": 1, "limit": 20, "total": 30, "totalPages": 2 },
  "requestId": "uuid"
}
```

---

#### GET `/api/pets/{petId}`
Get pet by ID.

**Path params**
- `petId` (uuid)

**Response 200**
```json
{
  "data": { /* Pet */ },
  "requestId": "uuid"
}
```

**Response 404**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Pet not found",
    "details": { "petId": "uuid" }
  },
  "requestId": "uuid"
}
```

---

### Applications (Visitor)

#### POST `/api/pets/{petId}/applications`
Submit an adoption application for a pet.

**Path params**
- `petId` (uuid)

**Workflow**
- Allowed when pet is `AVAILABLE` or `PENDING`
- Creates an `Application` with status `SUBMITTED`
- If pet is `AVAILABLE`, pet becomes `PENDING`
- If pet is `ADOPTED`, returns `409 CONFLICT`

**Request body**
```json
{
  "applicantName": "Alex Nguyen",
  "contact": "alex.nguyen@example.com",
  "reason": "Looking for a companion and can provide a stable home."
}
```

**Response 201**
```json
{
  "data": {
    "pet": { /* Pet (possibly updated to PENDING) */ },
    "application": { /* Application (SUBMITTED) */ }
  },
  "requestId": "uuid"
}
```

---

### Admin (No Auth)

#### GET `/api/admin/applications`
List applications (paginated).

**Query params**
- `status` (optional): `SUBMITTED | APPROVED | INVALIDATED`
- `petId` (optional uuid)
- `page` (optional): number, default `1`
- `limit` (optional): number, default `20`, max `100`

**Response 200**
```json
{
  "data": [ /* Application[] */ ],
  "meta": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 },
  "requestId": "uuid"
}
```

**Response 400 (invalid query)**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid query params",
    "details": { "fieldErrors": { "petId": ["Invalid uuid"] } }
  },
  "requestId": "uuid"
}
```

---

#### GET `/api/admin/pets/{petId}/applications`
List applications for a specific pet (paginated).

**Path params**
- `petId` (uuid)

**Query params**
- `page` (optional): number, default `1`
- `limit` (optional): number, default `20`, max `100`

**Response 200**
```json
{
  "data": [ /* Application[] */ ],
  "meta": { "page": 1, "limit": 20, "total": 4, "totalPages": 1 },
  "requestId": "uuid"
}
```

**Response 404**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Pet not found",
    "details": { "petId": "uuid" }
  },
  "requestId": "uuid"
}
```

---

#### PATCH `/api/admin/applications/{applicationId}/approve`
Approve an application and adopt the pet.

**Path params**
- `applicationId` (uuid)

**Workflow (transactional)**
- Pet transitions to `ADOPTED`
- This application becomes `APPROVED`
- All other `SUBMITTED` applications for that pet become `INVALIDATED`

**Response 200**
```json
{
  "data": {
    "pet": { /* Pet (ADOPTED) */ },
    "approvedApplication": { /* Application (APPROVED) */ }
  },
  "requestId": "uuid"
}
```

---

## Pets search API

### GET `/api/pets`

Returns a paginated list of pets.

Supports:
- `search` (optional): case-insensitive search across `name` and `breed`
- `status` (optional): `AVAILABLE | PENDING | ADOPTED`
- `page` (optional): default `1`
- `limit` (optional): default `20`, max `100`

### Example queries

Search by breed:
```http
GET /api/pets?search=pug&page=1&limit=12
````

Search by name:

```http
GET /api/pets?search=charlie&page=1&limit=12
```

Search + status:

```http
GET /api/pets?search=pug&status=AVAILABLE&page=1&limit=12
```

### Notes

* Search is applied **before pagination**
* `meta.total` and `meta.totalPages` reflect the **filtered results**
* Search matches both pet `name` and `breed`

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Milo",
      "breed": "pug",
      "ageYears": 1,
      "status": "AVAILABLE",
      "imageUrl": "https://images.dog.ceo/...",
      "createdAt": "2026-02-26 19:03:11",
      "updatedAt": "2026-02-26 19:03:11"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 2,
    "totalPages": 1
  },
  "requestId": "..."
}
```