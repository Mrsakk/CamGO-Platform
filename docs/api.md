# CamGO Business API Specification

REST API for the Business module in the shared Laravel backend (`backend/app/Modules/Business/`).

- **Base path:** `/api/v1`
- **Auth:** Laravel Sanctum bearer tokens (`Authorization: Bearer <token>`)
- **Response envelope:** `{ "success": true, "data": ... }` unless a download or CSV export is returned.
- **Generated contract:** `backend/storage/api-docs/openapi.json` (Scramble)
- **Postman:** `backend/storage/api-docs/postman_collection.json`

Canonical public routes omit the legacy `/public` segment. Legacy aliases remain available during migration.

---

## 1. Public Endpoints (No Auth)

### Home and directory

- `GET /business/home`
  - Returns curated pools, categories, and provinces for the public home page.
- `GET /business/businesses`
  - Filters: `q`, `category`, `province`, `verified`, `open_now`, `price_level`, `near=lat,lng`, `radius_km`, `destination`, `sort` (`relevance`, `rating`, `distance`, `newest`), `page`.
  - Only published businesses are returned.
- `GET /business/businesses/{slug}`
  - Full public profile: contacts, hours, closures, media, services, approved reviews, computed `open_now`, nearby destinations, and active `branches`.
  - **Privacy:** never returns owner details, internal notes, KYC documents, `email_hash`, or `ip_hash`.
- `GET /business/categories`
- `GET /business/provinces`

Legacy aliases: `GET /business/public/home`, `/business/public/businesses`, `/business/public/businesses/{slug}`, `/business/public/categories`, `/business/public/provinces`.

### Leads, reviews, and events

- `POST /business/businesses/{slug}/leads`
  - Public contact form. Body includes `name`, `email`, `phone`, `message`, and `preferred_contact`.
- `GET /business/businesses/{slug}/reviews`
  - Paginated approved reviews.
- `POST /business/businesses/{slug}/reviews`
  - Auth required for the canonical review endpoint. Body: `rating` (1–5), `title`, `body`.
  - One review per user per business; new reviews start as `pending`.
- `POST /business/businesses/{slug}/events`
  - Privacy-preserving contact click/profile view tracking.
  - Body: `channel` (`phone`, `telegram`, `whatsapp`, `messenger`, `email`, `website`, `directions`, `profile_view`) and `source` (`list`, `profile`, `nearby`).

### Travel integration

- `GET /destinations/{slug}/nearby-businesses?limit=6`
  - Compact read-only payload for `frontend-travel`.

---

## 2. Owner Portal (Sanctum + Active Business Membership)

- **Canonical base:** `/api/v1/business/me`
- **Legacy base:** `/api/v1/business/owner`
- Owner routes require `auth:sanctum`, the `owner` middleware, an active linked business, and a capability check (`business.can:<capability>`).
- Owners can only access their own business. Cross-business access returns `403`.
- The owner UI lives in `frontend-business` under `/owner`.

### Profile and operations

- `GET /me/business` (`business.view`) — scoped business detail.
- `PUT|PATCH /me/business` (`profile.update`) — update bilingual content, coordinates, price level, cover, and profile fields. Core identity/address changes return the business to `pending`.
- `GET /me/stats?range=7d|30d|90d` (`stats.view`) — views, contacts, channels, trends, leads, profile score, and tier/trial state.
- `GET|POST /me/branches` and `PUT|DELETE /me/branches/{branchId}` — manage branch locations.
- `PUT /me/hours` (`hours.manage`) — replace the 7-day schedule.
- `POST /me/closures` and `DELETE /me/closures/{closureId}` — temporary closures.
- `POST /me/contacts`, `PUT|DELETE /me/contacts/{contactId}` — public contact channels.
- `POST /me/media`, `POST /me/media/{mediaId}/cover`, `DELETE /me/media/{mediaId}` — gallery and cover.
- `GET|POST /me/services`, `PUT|DELETE /me/services/{serviceId}` — service catalog.
- `GET|POST /me/partner-requests` — partner-success requests.

### Leads

- `GET /me/leads?status=new|contacted|qualified|won|lost&page=` (`leads.view`)
- `GET /me/leads/stats?days=90`
- `GET /me/leads/export`
- `PUT /me/leads/{leadId}` (`leads.manage`) — update stage, note, and assignee.
- `POST /me/leads/{leadId}/notes` — add a private lead note.

### Reviews and notifications

- `GET /me/reviews?status=pending|approved|rejected` (`reviews.view`)
- `GET /me/reviews/stats`
- `POST /me/reviews/{reviewId}/reply` (`reviews.manage`) — create/update/clear `owner_reply`.
- `GET /me/notifications`, `GET /me/notifications/unread-count`
- `POST /me/notifications/{notificationId}/read`, `POST /me/notifications/read-all`
- `GET|PUT /me/notifications/settings` — Telegram chat ID and channel preferences.

### Verification and KYC

- `GET /me/verifications`, `POST /me/verifications` — submit business/licence verification.
- `GET /me/kyc`, `POST /me/kyc` — private KYC documents.
- `GET /me/kyc/{documentId}/download`, `DELETE /me/kyc/{documentId}` — permission-checked access.
- The verified badge is granted only by staff after KYC review. It is never sold with a plan.

### Team

- `GET /me/team` — returns `{ members, invitations }`.
- `POST /me/team/invitations`, `DELETE /me/team/invitations/{id}`.
- `POST /me/team/invitations/{token}/accept` — accept an invitation.
- Legacy UI endpoints remain: `GET /business/owner/team`, `POST /business/owner/team/invite`, `PUT|DELETE /business/owner/team/{memberId}`, `POST /business/team/accept/{token}`.
- The organisation membership table is `biz_business_users` with roles `owner`, `admin`, `staff`. The legacy team UI still uses `manager`, `editor`, and `viewer` capabilities; until that UI is migrated, keep using the legacy team endpoints.

### Subscription and plans

- `GET /me/plans` — public plan catalog.
- `GET /me/subscription` — tier, trial state, entitlements, active/latest subscription, and pending request.
- `POST /me/subscription/trial` — start the one-time **30-day Pro trial** when eligible.
- `POST /me/subscription/request` — request a plan upgrade with `plan_id`, billing cycle, and contact note.
- `POST /me/subscription/requests/{id}/cancel` — cancel a pending upgrade request.

Canonical plans: **Free**, **Pro $10/month**, **Premium $25/month**. A business may use the Pro trial once. Payments are recorded manually by staff (KHQR/cash/bank); there is no automated gateway.

---

## 3. Staff Admin (Sanctum + Admin Permissions)

- **Base path:** `/api/v1/admin/business`
- Requires the `admin` middleware and staff permissions.
- Staff portal: `admin-business` at `/admin`; it does not serve owner pages.

### Businesses

- `GET /businesses` — list/filter by status, category, province, search.
- `POST /businesses` — create a business and provision its owner account.
- `GET /businesses/{id}`, `PUT|PATCH /businesses/{id}`, `DELETE /businesses/{id}`.
- `POST /businesses/{id}/status` — `draft`, `pending`, `pending_review`, `published`, `approved`, `suspended`.
- `POST /businesses/{id}/verify`, `POST /businesses/{id}/unverify` — KYC trust badge.
- `POST /businesses/{id}/owner-account`, `POST /businesses/{id}/owner-accounts/{userId}/setup-link`.
- Sub-resources: contacts, hours, closures, media, documents, stats, report.
- `GET /businesses/{id}/subscription`.

### Categories, reviews, metrics

- `GET|POST /categories`, `PUT|DELETE /categories/{id}`.
- `GET /reviews`, `GET /reviews/{id}`, `POST /reviews/{id}/approve`, `POST /reviews/{id}/reject`, `POST /reviews/bulk-moderate`, `DELETE /reviews/{id}`.
- `GET /stats`, `GET /businesses/{id}/stats`, `GET /businesses/{id}/report`.
- `GET /audit-logs`.

### Billing

- `GET|POST /billing/plans`, `PUT /billing/plans/{id}`.
- `GET|POST /billing/subscriptions`.
- `GET|POST /billing/payments`, `PUT /billing/payments/{id}`, `POST /billing/payments/{id}/void`.
- `GET /billing/stats`.
- `GET /billing/subscription-requests`, `POST /billing/subscription-requests/{id}/approve`, `POST /billing/subscription-requests/{id}/reject`.
- `POST /billing/businesses/{id}/activate`.
- `POST /billing/subscriptions/{id}/payments`.

### Trust, invoices, placements, partner success

- `GET /verifications`, `POST /verifications/{id}/approve`, `POST /verifications/{id}/reject`.
- `GET|POST /invoices`, `POST /invoices/{id}/paid`, `POST /invoices/{id}/void`.
- `GET|POST /featured-slots`, `PUT|DELETE /featured-slots/{id}`.
- `GET /partner-requests`, `POST /partner-requests/{id}/review`.
- `GET /metrics` (alias of business metrics/stats).

---

## 4. Status and Privacy Rules

- Business lifecycle: `draft` → `pending` / `pending_review` → `published` / `approved` → `suspended`.
- Public queries use the `published` scope (legacy `approved` rows are backfilled).
- Subscription states include `trialing`, `active`, `past_due`, `expired`, `cancelled`.
- A paid business keeps access during `past_due` until `grace_ends_at`; after that it downgrades to the free plan.
- Public responses never expose owner info, KYC files, internal notes, email/IP hashes.
- Review moderation statuses: `pending`, `approved`, `rejected`.
