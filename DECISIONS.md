# Architectural Decisions & Technical Assumptions (DECISIONS.md)

This document records architectural decisions, assumptions, and convention selections for **CamGO Business (Step 2A)** within the unified CamGO monorepo.

---

## 1. Locked Decisions (from Specifications)
1. **Contact-first tourism flow:** Direct phone, Telegram, WhatsApp, Messenger, email, and directions. No booking engine, commission, or online payment for tourism transactions. Subscription fees are collected manually (KHQR/offline) during the pilot.
2. **Admin-provisioned accounts:** Super Admin creates businesses and owner accounts; Business Owner access is scoped to the linked business only. No public self-registration, and owners cannot verify or publish themselves.
3. **One shared backend:** Single Laravel backend powering Travel and Business directories; additive migrations only (`biz_` prefix); Travel code untouched.
4. **Billing Core (Phase 1 complete):** Plan catalog, subscription records, manual payment records, owner upgrade requests, Super Admin billing APIs/UI, audit logging, and scheduled expiry/downgrade are implemented.
   - The verified badge remains a KYC trust decision. A paid Verified/Featured plan activates billing and placement, but the badge is only granted when KYC documents exist.
   - Still out of scope: automated payment gateways, payouts, commissions, booking slots, QR check-in, and Telegram bots.
5. **Phase 2 entitlements:** Effective tiers fall back to `free` when a paid subscription expires, independent of the scheduled downgrade job. Category/province sponsorships require an active paid subscription, are capped to `subscription_expires_at`, and only boost the matching category/province listing context. Verified badges remain KYC-only.
6. **Phase 3 portal separation complete:** Staff and owners use distinct frontend applications, route trees, layouts, navigation, and route guards. Staff use `/admin/*` in `admin-business`; owners use `/owner/*` in `frontend-business`. The API enforces the same split with the `admin` and `owner` middleware aliases. Cross-portal access returns 403.

---

## 1a. Prompt 2A-plus Resolution (2026-10-23)

- **Schema strategy:** Option A, additive in-place evolution. The existing `biz_` tables were extended; no existing migration was edited or dropped.
- **Canonical vocabulary:** plans `free` / `pro` / `premium`; payment status `recorded`; trial state `trialing`; organisation roles `owner` / `admin` / `staff` via `biz_business_users`.
- **Routes:** public `/api/v1/business/...`; canonical owner `/api/v1/business/me/...`; legacy `/business/owner/...` and `/business/team/accept/{token}` retained for compatibility.
- **Portal ownership:** owner dashboard moved to `frontend-business` (`/owner`); `admin-business` is staff-only (`/admin`).
- **Known compatibility gap:** `OwnerTeamPage` still calls legacy `/business/owner/team` because `/business/me/team` returns `{members, invitations}` and uses the newer role vocabulary.
- **Verification:** backend 101 tests / 557 assertions pass; OpenAPI re-exported with Scramble; both frontends build.

---

## 2. Ports Allocation
- `http://localhost:8000` : Shared Laravel 13 Backend API (`backend/`)
- `http://localhost:5173` : Public Travel Website (`frontend-travel/`)
- `http://localhost:5174` : Travel Admin Panel (`admin/`)
- `http://localhost:5175` : Public Business Directory (`frontend-business/`)
- `http://localhost:5176` : Business Staff Portal (`admin-business/`, `/admin`)


CORS (`config/cors.php`) and Sanctum (`config/sanctum.php`) are configured to support `localhost:5175` and `localhost:5176`.

---

## 3. Database & Model Decisions
- **Prefix:** All new tables are prefixed with `biz_`.
- **Existing Tables Reused:**
  - `provinces`: Reused existing `provinces` table (all 25 Cambodian provinces already seeded with geo-coordinates, Khmer and English names).
  - `destinations`: Reused existing `destinations` table for calculating proximity distance to nearby tourist sites.
  - `users`: Reused existing `users` table for staff accounts (`Super Admin`, `Content Manager`, etc.).
  - `audit_logs`: Reused existing `audit_logs` table via `App\Models\AuditLog::record(...)` to maintain a unified system audit trail.
- **Additive Tables:**
  - `biz_categories`: Tourism business categories (Accommodation, Restaurant and Cafe, Tour Guide, Transport, Crafts and Souvenirs, Spa and Wellness, Activities).
  - `biz_businesses`: Main business entity with status (`draft`, `pending_review`, `approved`, `suspended`), verification state, internal owner fields, coordinates, rating cache.
  - `biz_contacts`: Multi-channel contact points (`phone`, `telegram`, `whatsapp`, `messenger`, `email`, `website`, `facebook`).
  - `biz_hours`: Split-shift opening hours per weekday (0 = Sunday to 6 = Saturday).
  - `biz_closures`: Special closure windows with bilingual notes.
  - `biz_media`: Gallery images with generated 800px and 400px WebP thumbnails and sort orders.
  - `biz_documents`: KYC compliance records on private disk (`storage/app/private/`).
  - `biz_reviews`: Anonymous visitor reviews with moderation status (`pending`, `approved`, `rejected`), honeypot protection, and hashed anti-spam identifiers.
  - `biz_contact_events`: Privacy-preserving contact clicks and view events using daily rotating hashes.
  - `biz_daily_stats`: Aggregated analytics table filled nightly by scheduled console command.
  - `biz_destination_links`: Distance cache between businesses and tourist destinations.
  - `biz_plans`: Billing plan catalog (`free`, `verified`, `featured`) with price, cycle, bilingual copy, feature list, active flag, and sort order.
  - `biz_subscriptions`: Activation history per business with plan, status, start/end dates, price, auto-renew, approver, and cancellation state.
  - `biz_payments`: Manual KHQR/offline settlement records linked to a subscription, including method, reference, unique receipt number, verifier, and status.
  - `biz_subscription_requests`: Owner upgrade requests with requested plan, contact, owner note, review status, admin note, and approver.

---

## 4. Image Processing & Optimization
- **Technology:** Native PHP 8.3 `gd` extension (bundled in Laragon and server environments) without introducing heavy external composer packages.
- **Processing Pipeline:**
  - Validates image dimensions, types (JPEG, PNG, WebP) and 5MB limit.
  - Re-encodes uploaded images into WebP format with EXIF metadata stripped for privacy and performance.
  - Generates 800px (display) and 400px (thumbnail) versions with high quality compression.
  - Dispatches image thumbnail resizing via asynchronous/sync job queue (`biz:process-media`).

---

## 5. Security, KYC & Privacy
- **Private KYC Storage:** KYC documents (`id_card`, `business_license`, etc.) are written exclusively to the `'local'` disk (`storage/app/private/business/documents/...`).
- **KYC Downloads:** Public access is strictly forbidden. Served exclusively via an authenticated, permission-checked endpoint generating temporary signed URLs or streamed with authorization (`business.kyc.view`).
- **Anonymization & Anti-Spam:**
  - Session hashes in contact events: `sha256(ip + user_agent + YYYY-MM-DD + APP_KEY)`. No raw IP addresses or full user agents are stored.
  - Review deduplication: `email_hash = sha256(trim(strtolower(email)) + APP_KEY)` and `ip_hash = sha256(ip + YYYY-MM-DD + APP_KEY)`.
- **Public API Privacy Guarantee:**
  - `owner_name`, `owner_phone`, `internal_notes`, KYC documents, and email/IP hashes are strictly filtered out by Eloquent API Resources (`BusinessPublicDetailResource`, `BusinessPublicListResource`).

---

## 6. Business Hours & "Open Now" Computation
- Timezone is fixed to `Asia/Phnom_Penh` (UTC+7).
- Calculation handles:
  1. Active temporary closures (`biz_closures`) taking precedence.
  2. Multiple shifts on the same weekday (e.g. morning shift + evening shift).
  3. Midnight-crossing shifts (e.g., closing at 02:00 next day).

---

## 7. Frontend Conventions
- **`frontend-business/`:** Public tourism business directory matching the aesthetic tokens of `frontend-travel/` (Angkor Gold `#D4A017`, Deep Teal `#0F766E`, Lotus Pink `#E11D74`, stone dark mode `#222831` / `#1e1e1e`).
- **`admin-business/`:** Shared shell with two separate portals. Staff (`/admin`) use the Angkor Gold staff layout matching `admin/`. Owners (`/owner`) use an amber-accented owner layout with only Dashboard/Leads, My Business, and Subscription/Billing navigation.
- **Language Support:** Bilingual Khmer (`km`) and English (`en`) with default `km`.
- **Performance:** Lazy loading Leaflet maps on user demand, code-split routes, responsive touch targets (44px min).

---

## 8. Billing Core (Phase 1)
- **Plan codes are tier codes:** Only `free`, `verified`, and `featured` are valid plan codes because `biz_businesses.tier` and public ranking already use those values.
- **Activation is transactional:** Activating a plan cancels the previous active subscription, creates a new subscription record, updates business tier/expiry/featured dates, optionally records a payment, and writes audit entries.
- **Expiry is defensive:** Public ranking checks `subscription_expires_at` at query time, and `biz:expire-subscriptions` runs daily at 00:15 to mark subscriptions expired and downgrade businesses to `free`.
- **Manual payments only:** Super Admin records verified KHQR, cash, bank transfer, or other payments; unique receipt numbers are generated when omitted.
- **Owner self-service is request-only:** Owners can list active plans, view their subscription/payment summary, submit one pending upgrade request, and cancel it. Only Super Admin can approve/reject and activate plans.
- **Permissions:** `plans.manage`, `subscriptions.manage`, and `payments.verify` are granted to Super Admin. Business Manager and Business Owner roles do not receive billing-management permissions.
- **Pricing assumptions:** Verified ~$5–$10/month and Featured ~$15–$20/month; seeded defaults are $7 and $18 and should be validated with the first 20 businesses.

---

## 9. Entitlements & Sponsored Placement (Phase 2)
- **Effective tier is query-time:** Expired paid tiers resolve to `free` immediately for API resources and ranking, even if the nightly downgrade command has not run yet. Raw `tier` remains available to Super Admin views.
- **Sponsorships require paid access:** `sponsored_category_until` and `sponsored_province_until` only take effect while a paid subscription is active. Activating the free plan clears both fields.
- **Sponsor dates are capped:** Sponsor end dates cannot exceed `subscription_expires_at`. Renewing with a shorter period caps any existing sponsor dates to the new end date.
- **Contextual ranking:** Default public relevance order is matching category/province sponsor, featured, KYC-verified, rating, newest. A category sponsorship boosts only category-filtered listings; a province sponsorship boosts only province-filtered listings.
- **Owner-visible entitlements:** Owner subscription summaries expose effective tier, billing tier, sponsored flags/dates, and a consolidated `entitlements` object. Public resources expose only display flags, not sponsor end dates.
- **KYC stays separate:** A paid plan activates placement/billing, but the verified badge still requires KYC documents. Downgrades keep the KYC badge while removing paid placement.

---

## 10. Staff vs Owner Portal Separation (Phase 3)
- **Separate route trees:** `/admin/*` is staff-only; `/owner/*` is owner-only. `/admin/my-business` and `/admin/subscription` no longer exist.
- **Separate layouts:** `AdminLayout` and `OwnerLayout` both wrap the shared `PortalLayout` shell but expose role-specific navigation, branding, accent color, and header context.
- **Role-based redirects:** After login, admins go to `/admin`, owners go to `/owner`, and an attempted deep link is honored only if it belongs to the user's portal. `/` resolves to the role's portal.
- **Frontend guards:** `AdminRoute` permits staff roles only and redirects owners to `/owner`; `OwnerRoute` permits users with the owner role and a linked business, redirecting staff to `/admin`.
- **API guard:** The `owner` middleware alias (`EnsureBusinessOwner`) is applied to `/api/v1/business/owner/*` after `auth:sanctum`. It requires the owner role, an active account, and an existing linked business. Staff cannot call owner endpoints only via ownership policy checks.
- **No shared authority:** Being able to view a business as staff does not grant owner-portal access, and owner access never grants staff endpoints, plan management, payment verification, or publishing rights.
- **Demo account:** `owner@khemaramorodok.com` is seeded with the `business_owner` role and linked to the first approved demo business.

---

## 11. Partner Success & Monetization (Phase 4)
- **Capability-based team access:** Business membership is stored in `biz_business_members` with roles `owner`, `manager`, `editor`, and `viewer`. Owner endpoints use the `business.can:<capability>` middleware in addition to the `owner` guard. Owners retain full access; managers handle profile, leads, reviews, stats, and notifications; editors handle profile content, media, and hours; viewers can read business data, stats, and notifications.
- **Organization ownership:** `biz_organizations` groups business records, and newly admin-provisioned owner accounts receive both an organization owner link and an active owner membership. At least one active owner membership is always required.
- **Lead capture is privacy-preserving:** Contact events from the public profile create or update leads by daily session hash. Owner lead APIs expose channel, source, locale, counts, timestamps, stage, note, and assignee — never raw visitor identity. Stages are `new`, `contacted`, `qualified`, `won`, and `lost`.
- **Owner review replies:** Owners can reply only to approved reviews. Replies and their timestamps/author are stored on `biz_reviews` and audited; clearing the reply removes the public response.
- **Notification preferences:** `biz_owner_notifications` stores per-user in-app notifications. Preferences cover in-app delivery, Telegram delivery, leads, reviews, and billing. Telegram is opt-in and requires a chat ID; no bot is bundled in this phase.
- **Profile completeness drives eligibility:** `ProfileScoreService` scores identity 20, contacts 10, location 10, media 20, hours 10, category details 20, and KYC 10. Trial eligibility requires a score of at least 80, KYC verification, and no prior trial.
- **14-day Featured trial:** `SubscriptionService::activateTrial()` creates a trial subscription and sets `trial_started_at`, `trial_ends_at`, and Featured placement for 14 days. A paid subscription or an existing/used trial blocks another trial.
- **Category-specific fields:** `biz_categories.profile_schema` defines field metadata (key, bilingual labels, type, placeholder), and `biz_businesses.profile_data` stores the submitted values. Owner updates are filtered to schema keys on the server.
- **Manual monetization remains:** Owners submit upgrade requests and choose from active plans. Staff verify KHQR, cash, bank transfer, or other payments. There is no automated payment gateway, commission deduction, payout, or public self-verification.
- **Scheduled reminders:** `biz:send-subscription-reminders` runs daily at 09:00 to create owner notifications for upcoming and expired subscriptions.
- **Demo/category setup:** `BusinessModuleSeeder` creates the organization, owner membership, and demo gallery; `BusinessProfileSchemaSeeder` defines schemas for accommodation, restaurants, tour guides, transport, crafts, spa/wellness, and activities.
