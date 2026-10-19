# Coin Collection API

A serverless API for managing US state quarters, deployed on Cloudflare Workers
with OORT decentralized storage. Includes session-based authentication, password
reset via email, and rate limiting.

## Tech Stack

- **Cloudflare Workers** — serverless runtime (V8 isolates, not Node)
- **OORT** — S3-compatible decentralized object storage
- **PBKDF2 + pepper** — password hashing via Web Crypto
- **worker-mailer / nodemailer** — SMTP email delivery
- **Node.js built-in test runner** — no external test framework
- **ESM** throughout (`"type": "module"`)

## Features

- **Authentication** — signup, login, logout, session lookup (`/api/me`)
- **Password reset** — emailed 6-digit PIN, verified against a hash, expires in 15 minutes
- **Rate limiting** — sliding-window counters for PIN requests (per-email) and general requests (per-IP)
- **Session cookies** — AES-GCM encrypted payload with embedded expiry, `HttpOnly`, `Secure`, `SameSite=None`
- **Admin endpoint** — bulk coin upload protected by HTTP Basic auth
- **US state quarters** — fetch by state name, bulk upload from the Numista API

## Architecture

```
Request
  ↓
Worker (index.js) — router; dispatches by METHOD:path
  ↓
Handler (coin-collection-proxy/functions/*.js) — thin Lambda wrapper; parses event, calls controller
  ↓
Controller (coin-collection-controller/*.js) — HTTP ↔ domain boundary; error handling via APIController
  ↓
Service (coin-collection-service/*.js) — business logic; validation, hashing, merging
  ↓
Repository (coin-collection-repository/*.js) — storage abstraction; OORT keys, JSON handling
  ↓
OORTStorageClient — boto3-compatible S3 client
```

Each layer has one job. The service layer never knows whether it's talking to OORT, an in-memory mock, or a future database — the repository hides that.

### Error handling

`APIController` wraps every operation in try/catch. Errors that extend `CoinCollectionError` carry a status, a message, and a context. Unknown errors are wrapped. 5xx errors log at `ERROR` level, 4xx at `WARN`. The router's top-level catch formats the final HTTP response.

## Getting Started

### 1. Install

```powershell
npm install
```

### 2. Configure local environment

Create `.env` at the project root:

```
OORT_ACCESS_KEY=...
OORT_SECRET_KEY=...
OORT_BUCKET=...
SERVER_KEY=...          # 64-char hex, for AES-GCM session encryption
PEPPER_KEY=...          # 64-char hex, prepended to passwords before hashing
EMAIL_ADMIN=you@gmail.com
EMAIL_PASS=...          # Gmail app password, not your account password
```

Generate the two hex keys:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Generate HTTPS certs (local only)

```powershell
mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1 ::1
```

Add `certs/` to `.gitignore`.

### 4. Run locally

```powershell
npm run local
```

Server starts on `https://localhost:3000`. Uses a custom Node HTTPS wrapper that mimics Cloudflare's `fetch(request, env)` contract, so the same code runs in production.

### 5. Deploy

```powershell
npx wrangler secret put SERVER_KEY
npx wrangler secret put PEPPER_KEY
npx wrangler secret put EMAIL_ADMIN
npx wrangler secret put EMAIL_PASS
npx wrangler secret put OORT_ACCESS_KEY
npx wrangler secret put OORT_SECRET_KEY
npx wrangler secret put OORT_BUCKET

npx wrangler deploy
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/coin?stateName=` | None | Fetch a single state quarter |
| POST | `/api/signup` | None | Create a user account |
| POST | `/api/login` | None | Authenticate, set session cookie |
| POST | `/api/logout` | Session | Clear session cookie |
| GET | `/api/me` | Session | Get the current user |
| PUT | `/api/user/collection` | Session | Update the user's collection |
| POST | `/api/pin` | None | Request a password reset PIN |
| PUT | `/api/password` | None | Reset password with PIN |
| POST | `/api/postCoins` | **Basic** | Bulk upload coins (admin) |

**Auth legend:**
- **None** — public
- **Session** — requires `auth` cookie
- **Basic** — requires `Authorization: Basic <base64(EMAIL_ADMIN:EMAIL_PASS)>`

### Example — fetch a coin

```
GET /api/coin?stateName=California
```

```json
{
  "id": 634,
  "stateName": "California",
  "obvThumb": "https://.../california-front.jpg",
  "revThumb": "https://.../california-back.jpg",
  "mintYear": 2005
}
```

### Example — signup

```
POST /api/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "hunter2hunter2",
  "collection": { "favorites": [], "archive": [] }
}
```

Response `201` with `Set-Cookie: auth=...`.

### Example — reset password

```
PUT /api/password
Content-Type: application/json

{
  "email": "user@example.com",
  "pin": "840990",
  "newPassword": "Tadpole123"
}
```

## Authentication

### Session cookies

Login and signup issue a cookie:

```
Set-Cookie: auth=<encrypted>; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800
```

The encrypted payload contains:

```json
{ "uuid": "<user uuid>", "exp": <unix ms> }
```

- `HttpOnly` — not readable from JS
- `Secure` — HTTPS only
- `SameSite=None` — required for cross-origin frontends (GitHub Pages → Workers)
- 7-day expiry, enforced server-side on every authenticated request

### Password hashing

- **Algorithm:** PBKDF2-HMAC-SHA256
- **Iterations:** 100,000 (Cloudflare Workers' ceiling)
- **Salt:** 16 random bytes per password
- **Pepper:** `PEPPER_KEY` prepended to the password before hashing (server-side only, never stored)

Stored format is self-describing:

```
pbkdf2:<iterations>:<salt-hex>:<hash-hex>
```

The iteration count and salt travel with the hash, so the algorithm can be upgraded without breaking existing passwords.

### Password reset flow

1. `POST /api/pin` — generates a 6-digit PIN, hashes it with PBKDF2 + pepper, emails the plaintext to the user, stores the hash on the user record with a 15-minute expiry.
2. `PUT /api/password` — verifies the submitted PIN against the stored hash, updates the password, clears the PIN.

Failed PIN attempts increment a counter; after 5 failures the PIN is invalidated.

## Rate Limiting

Two sliding-window rate limiters, both backed by OORT:

| Limiter | Key | Limit | Window | Purpose |
|---|---|---|---|---|
| PIN requests | Email | 5 | 15 min | Prevent inbox flooding |
| General requests | IP | 20 | 60s | Prevent endpoint abuse |

Counters store an array of timestamps. On each request, timestamps outside the window are pruned; if the array is at the limit, the request is rejected with `429`.

The IP limiter reads `cf-connecting-ip` in production; the local server injects `local-connecting-ip` from the socket.

## Testing

```powershell
npm run test:unit
```

Node's built-in test runner, no external dependencies.

**Coverage:**
- Password hashing round-trip, salt uniqueness, unknown algorithm rejection
- `CoinService` — fetch, normalize, not-found, bulk upload validation
- `UserRepository` — user creation, duplicate detection
- `UserService` — signup normalization, validation errors
- `CoinDTO` — Numista API shape transformation
- `postCoins` handler — Basic auth gate (missing, malformed, wrong credentials)

Tests use fake OORT clients and mocked repos — no network, no database, no Cloudflare.

## Project Structure

```
coin-collection-backend/
├── coin-collection-proxy/functions/   # Lambda handlers (one per endpoint)
├── src/
│   ├── coin-collection-controller/    # HTTP ↔ domain
│   ├── coin-collection-service/       # Business logic
│   ├── coin-collection-repository/    # Storage (OORT, browser, etc.)
│   ├── coin-collection-dto/           # Wire shapes
│   ├── coin-collection-entity/        # Storage shapes
│   ├── coin-collection-auth/          # Session + password crypto
│   ├── coin-collection-exception/     # Error hierarchy
│   ├── coin-collection-validation/    # Input validators
│   └── Main.js                        # Composition root
├── tests/                             # node:test suite
├── local-server.js                    # Local HTTPS server
├── wrangler.toml                      # Cloudflare config
└── .env                               # Local secrets (gitignored)
```

## Notes

- **OORT limitation:** no conditional writes (`If-None-Match` is ignored). User creation uses read-before-write, which has a small race window. Documented in `UserRepository.createUser`.
- **Cloudflare PBKDF2 cap:** Workers limits PBKDF2 to 100,000 iterations. The pepper compensates for the lower work factor.
- **No Node.js in production:** `nodemailer` is only used locally; `worker-mailer` runs on Workers via `cloudflare:sockets`. The import is conditional and opaque to the bundler.