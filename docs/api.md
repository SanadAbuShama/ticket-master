# TicketMaster API Contract

> Status: draft · Version: v1
> Every endpoint traces back to a requirement in the PRD (FR-x / BR-x).
> Rule: change this contract first, then the code — never the other way round.

---

## Conventions

### Base URL

```
/api/v1
```

<!-- TODO: What does a new version (v2) mean? When would you introduce one? -->

### Authentication

<!-- TODO: Fill in your decisions. -->

- **Mechanism:** session ID in a cookie
- **Cookie name:** `__Host-sid`
- **Cookie attributes:** `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`
- **Lifetime:** absolute `14 days` · idle timeout `	3 days`
- **Missing / expired / invalid session:** `TODO status` + `TODO code`
- **Suspended or deactivated user:** `TODO status` + `TODO code`
- **CSRF protection:** 
  - The session cookie uses `SameSite=Lax`, so browsers don't send it on cross-site `POST`, `PUT`, `PATCH` or `DELETE` requests.
  - `GET` requests never change data, so the cross-site `GET` navigations that `Lax` allows are safe.
  - Every request that changes data must have an `Origin` header that exactly matches an allowed frontend origin (e.g. `https://tickets.example.com`). A mismatch returns `403 ORIGIN_NOT_ALLOWED`.
  - Requests with no `Origin` header: TODO (rejected, or allowed only when no session cookie is present).
  - No separate CSRF tokens are needed.`

### Request & response format

- **Content type:** `application/json`
- **Field naming:** `snake_case`
- **Empty responses:** `204 No Content`

### Errors

Every error uses this shape:

```json
**Validation errors** (field-level):

Returned with status `400 Bad Request` when one or more fields fail validation.
All invalid fields are reported at once, not just the first one.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Some fields are invalid.",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Must be a valid email address."
      },
      {
        "field": "password",
        "code": "TOO_SHORT",
        "message": "Must be at least 8 characters."
      }
    ]
  }
}
```

**Status codes used in this API**

| Status | Meaning in this API |
| --- | --- |
| 200 | Request succeeded. Returns the requested or updated resource. |
| 201 | A resource was created. Returns the new resource. |
| 204 | Request succeeded and there is nothing to return (e.g. logout, deleting a draft). No body. |
| 400 | The request is invalid: malformed JSON, or one or more fields fail validation. Field errors are listed in `details`. |
| 401 | Not authenticated: no session, an expired or invalid session, or wrong login credentials. |
| 403 | Authenticated but not allowed: not the event's organizer, a suspended account, or an `Origin` that isn't allowed. |
| 404 | The resource doesn't exist, or the user isn't allowed to know it exists. |
| 409 | The request conflicts with the current state: email already registered, tickets sold out, an order already paid. |
| 429 | Too many requests. Includes a `Retry-After` header saying when to try again. |
| 500 | Unexpected server error. Returns a generic message only; details go to the logs. |
| 503 | A dependency (e.g. the database) is unavailable. Used by the health check. |

### Pagination

- **Query parameters:** `TODO`
- **Defaults and limits:** `TODO`
- **Response shape:**

```json
TODO
```

### Money, dates and IDs

- **Money:** `TODO` (integer in smallest unit + currency — show an example)
- **Timestamps:** `TODO` (format + example)
- **Event local time:** `TODO` (how the event's timezone is returned)
- **IDs:** `TODO` (type, and which IDs are never exposed)

---

## Reference example

### GET /api/v1/health

**Access:** Public
**Purpose:** Report whether the API and its dependencies are up.

**Request**
- Headers: none
- Body: none

**Success: `200 OK`**

```json
{
  "status": "ok",
  "database": "ok"
}
```

**Errors**

| Status | Code | When |
| --- | --- | --- |
| 503 | `SERVICE_UNAVAILABLE` | The database can't be reached |

---

## Auth

### POST /api/v1/auth/register

**Access:** Public
**Purpose:** TODO (FR-1)

**Request**
- Headers: TODO
- Body:

```json
TODO
```

**Success: `TODO`**
- Cookies / headers set: TODO

```json
TODO
```

- Never returned: TODO

**Errors**

| Status | Code | When |
| --- | --- | --- |
| TODO | TODO | TODO |

---

### POST /api/v1/auth/login

**Access:** TODO
**Purpose:** TODO (FR-1)

**Request**
- Headers: TODO
- Body:

```json
TODO
```

**Success: `TODO`**
- Cookies / headers set: TODO

```json
TODO
```

**Errors**

| Status | Code | When |
| --- | --- | --- |
| TODO | TODO | TODO |

---

### POST /api/v1/auth/logout

**Access:** TODO
**Purpose:** TODO (FR-1)

**Request**
- Headers: TODO
- Body: TODO

**Success: `TODO`**
- Side effects: TODO

**Errors**

| Status | Code | When |
| --- | --- | --- |
| TODO | TODO | TODO |

---

### GET /api/v1/auth/me

**Access:** TODO
**Purpose:** TODO (FR-1)

**Request**
- Headers: TODO

**Success: `TODO`**

```json
TODO
```

**Errors**

| Status | Code | When |
| --- | --- | --- |
| TODO | TODO | TODO |

---

## Endpoint template (copy for each new endpoint)

```markdown
### METHOD /api/v1/path

**Access:** Public | Logged in | Event organizer | Admin
**Purpose:** What it does (FR-x, BR-x)

**Request**
- Headers:
- Path params:
- Query params:
- Body:

**Success: `STATUS`**
- Cookies / headers set:
- Side effects:
- Never returned:

(example JSON)

**Errors**

| Status | Code | When |
| --- | --- | --- |
```

---

## Endpoint index

<!-- TODO: List every endpoint here once, before filling them in. Go through FR-1 to FR-12. -->

| Method | Path | Access | Requirement |
| --- | --- | --- | --- |
| GET | /api/v1/health | Public | — |
| POST | /api/v1/auth/register | TODO | FR-1 |
| POST | /api/v1/auth/login | TODO | FR-1 |
| POST | /api/v1/auth/logout | TODO | FR-1 |
| GET | /api/v1/auth/me | TODO | FR-1 |
| TODO | TODO | TODO | FR-2 |
