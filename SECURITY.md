# SECURITY.md — Security Architecture & Policy

## 1. Threat Model & Scope
This application provides a public ambient music experience and a private admin management dashboard.

### Assets Protected:
- Admin credentials & session tokens.
- Server environment secrets (`JWT_SECRET`, database connection strings).
- Database integrity (Playlists, Songs, Theme configurations).

### Threat Vectors Mitigated:
- **Authentication Bypass**: Enforced server-side via HTTP-only, SameSite, Secure JWT cookies.
- **SQL Injection**: Prevented using Prisma ORM parameterized queries.
- **Cross-Site Scripting (XSS)**: Input validation via Zod schemas, strict output escaping.
- **Server-Side Request Forgery (SSRF)**: Sanitization and validation of YouTube Video/Playlist IDs using strict regex normalization before processing.

---

## 2. Authentication & Session Security
- Admin passwords hashed using `bcrypt` (salt rounds: 10).
- Session tokens generated via signed JWTs (`jose`) with 24-hour expiration.
- Auth cookies marked `HttpOnly`, `SameSite=Strict`, `Path=/`.

---

## 3. Secret Management
- Secrets are stored exclusively in environment variables (`.env`).
- Never committed to source control or exposed in frontend JavaScript bundles.

---

## 4. Input Validation
- Server-side validation via Zod schemas (`lib/validation.ts`).
- Reject unexpected API payload fields.

---

## 5. Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 6. Backup & Recovery Strategy
- SQLite database stored at `prisma/dev.db`. Regular automated backups recommended for production deployments.
