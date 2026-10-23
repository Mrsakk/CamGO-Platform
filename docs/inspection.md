# CamGO Business Module — Repository Inspection

**Date:** 2026-10-23  
**Scope:** Prompt 2A-plus Phase 2 business-directory implementation  
**Status:** Inspection complete. **Option A (additive in-place evolution) approved and implemented.**

## Resolution Update (2026-10-23)

- Migration `2026_10_23_000001_evolve_business_module_to_prompt_2a_plus.php` evolved the existing `biz_` schema additively: canonical plan/tier values, new tables, and backfills.
- Canonical plans are `free`, `pro`, and `premium`; payment status uses `recorded`; trial state uses `trialing`.
- Public routes are `/api/v1/business/...`; canonical owner routes are `/api/v1/business/me/...`; legacy owner endpoints remain for compatibility.
- The owner portal now lives in `frontend-business` at `/owner`; `admin-business` is staff-only at `/admin`.
- Backend suite passes: 101 tests, 557 assertions. Scramble OpenAPI exported to `backend/storage/api-docs/openapi.json`.
- Remaining compatibility note: `OwnerTeamPage` still uses the legacy `/business/owner/team` API because the new `/business/me/team` response shape and role vocabulary differ from the current UI.

## 1. Executive Summary

The repository already contains a substantial Phase 2 business module, but it was built against an earlier, different design. It is not a clean starting point for Prompt 2A-plus.

The existing module includes public listings, owner profile management, media, KYC, leads, reviews, notifications, team members, plans, subscriptions, and manual payments. However, its database model, plan codes, route prefixes, role names, and frontend ownership do not match the new specification. Implementing the new spec without a migration decision would create duplicate or conflicting behavior.

At inspection time, no Prompt 2A-plus code changes had been made. See **Resolution Update** above for the implemented additive path.

## 2. Actual Repository Structure

| Path | Purpose | Stack / Port |
|---|---|---|
| `backend/` | Shared Laravel API | Laravel 13, PHP 8.3, MySQL, Sanctum, Spatie Permission, Scramble |
| `frontend-travel/` | Tourist travel app | React + Vite, port 5173 |
| `frontend-business/` | Public business directory | React + Vite, port 5175 |
| `admin-business/` | Business staff + owner portal | React + Vite, port 5176 |
| `A-Khemra-supper-admin/` | Super-admin/content admin | React + Vite, port 5174 |
| `docs/` | Project documentation | Markdown |
| `start.bat` | Starts backend and all frontends | Windows batch |

There is no `admin/` folder. The older inspection report referenced one; that reference was stale.

### Existing test and build coverage

- Backend: 101 tests, 554 assertions expected. Latest run: **100 passed, 1 failed**.
- `frontend-business`: 5/5 tests passing.
- `frontend-travel`: 4/4 tests passing.
- All four frontend production builds passed during the CamGO rebrand.

### Backend test baseline failure

Command:

```powershell
php artisan test
```

Result:

```text
SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry 'adavis@example.com' for key 'users.users_email_unique'
```

Location: `backend/tests/Feature/BusinessBillingPhase1Test.php:67`

Cause: tests run against the shared `khemara_morodok` database configured in `backend/phpunit.xml`. Some feature tests use `DatabaseTransactions`, but the suite is not fully isolated. `backend/tests/Feature/AuthTest.php` imports `RefreshDatabase` but does not use the trait, so test data can persist. A user with `adavis@example.com` already exists in the shared database.

This is a test-infrastructure defect, not a business-module logic failure. It must be fixed before the baseline can be trusted. Do not truncate or drop the shared developer database to fix it.

## 3. Existing Authentication and Authorization

- API authentication uses Laravel Sanctum bearer tokens.
- Roles and permissions use Spatie Permission.
- Admin middleware: `admin` → `App\Http\Middleware\AdminMiddleware`.
- Owner middleware: `owner` → `App\Http\Middleware\EnsureBusinessOwner`.
- Owner capability middleware: `business.can:<capability>` → `App\Http\Middleware\EnsureBusinessCapability`.

### Current roles

- `Super Admin` and `super_admin`
- `Content Manager`
- `Moderator`
- `Business Manager` and `business_manager`
- `Business Owner` and `business_owner`
- `Tourist`

Prompt 2A-plus requires the canonical roles `super_admin`, `business_admin`, `business_owner`, and `business_staff`. `business_admin` and `business_staff` do not exist as canonical roles.

### Current admin permissions

Examples: `business.view`, `business.create`, `business.update`, `business.publish`, `business.verify`, `business.kyc.view`, `business.reviews.moderate`, `business.categories.manage`, `business.stats.view`, `plans.manage`, `subscriptions.manage`, `payments.verify`.

Prompt 2A-plus requires the listed `business.view`, `business.create`, `business.edit`, `business.delete`, `business.verify`, `business.feature`, `business.leads`, `business.reviews`, `business.plans`, `business.payments`, `business.settings`, and `business.audit` permissions. The current names differ in several places.

### Owner membership model

- `users.business_id` links a user to one business.
- `biz_business_members` is the current membership table.
- `BusinessMember::ROLE_CAPABILITIES` controls owner/manager/staff capabilities.
- Prompt 2A-plus expects `biz_business_users` with `role` values `owner`, `admin`, `staff`.

The concepts overlap, but the table and role vocabulary do not match the spec.

## 4. Existing Data Model

### Current business tables

- `biz_categories`
- `biz_businesses`
- `biz_contacts`
- `biz_hours`
- `biz_closures`
- `biz_media`
- `biz_documents`
- `biz_reviews`
- `biz_contact_events`
- `biz_daily_stats`
- `biz_destination_links`
- `biz_organizations`
- `biz_business_members`
- `biz_leads`
- `biz_owner_notifications`
- `biz_services`
- `biz_plans`
- `biz_subscriptions`
- `biz_payments`
- `biz_subscription_requests`

### Prompt 2A-plus target tables that do not exist

- `biz_business_users`
- `biz_invitations`
- `biz_lead_notes`
- `biz_verifications`
- `biz_metrics_daily`
- `biz_nearby`
- `biz_branches`
- `biz_invoices`
- `biz_featured_slots`
- `biz_partner_requests`
- `biz_plan_entitlements`

### Existing tables whose semantics differ

| Existing | Current semantics | Prompt 2A-plus requirement |
|---|---|---|
| `biz_leads` | Aggregated contact tracking keyed by `session_hash`; fields include `contact_count`, `primary_channel`, `last_contact_at` | Lead-form records with `name`, `contact`, `message`, `preferred_date`, `party_size`, `ip_hash`, statuses `new/contacted/closed/spam` |
| `biz_reviews` | Guest reviews with `display_name`, `email_hash`, `ip_hash`, moderation status | Authenticated tourist reviews with `user_id`, `title`, `owner_reply`, unique `(business_id, user_id)` |
| `biz_documents` | KYC document vault | `biz_verifications` with review lifecycle and reviewer fields |
| `biz_daily_stats` | Aggregated views/contact counts | `biz_metrics_daily` with the spec's metric columns |
| `biz_destination_links` | Proximity cache between business and destination | `biz_nearby` with explicit nearby relationships |
| `biz_business_members` | Membership with capability arrays | `biz_business_users` with `owner/admin/staff` roles |
| `biz_subscriptions` | `active/expired/canceled/pending`, `price_usd`, no trial lifecycle | `trialing/active/past_due/canceled/expired`, billing cycle, trial used/start/end |
| `biz_payments` | `amount_usd`, `pending/verified/rejected`, methods `khqr/cash/bank_transfer/other` | `amount_cents`, `recorded/voided`, methods `cash/bank_transfer/aba/wing/other` |

### Existing business status

`biz_businesses.status` is `draft`, `pending_review`, `approved`, or `suspended`.

Prompt 2A-plus expects `published`, `draft`, `pending`, or `suspended`, with `published_at`.

## 5. Existing Plans and Billing

Current seeder: `backend/database/seeders/PlanSeeder.php`

| Code | Display | Price | Trial | Limits |
|---|---|---:|---:|---|
| `free` | Free | $0 | 0 days | 8 photos, 5 services, 3 team |
| `verified` | Pro | $9/month | 30 days | 30 photos, 50 services, 5 team |
| `featured` | Premium | $25/month | 0 days | 100 photos, unlimited services, 20 team |

Prompt 2A-plus requires:

- Codes/labels `free`, `pro`, `premium`.
- Pro at **$10/month**, Premium at **$25/month**.
- 30-day Pro trial, once per business.
- Entitlements stored in `biz_plan_entitlements`.

Current entitlements are stored in the `biz_plans.limits` JSON column and resolved by `Business::entitlements()` / `Business::planLimits()`. The behavior exists, but not the storage model the spec requires.

Current billing also lacks:

- `biz_invoices`
- `biz_featured_slots`
- payment reversal/void workflow
- a dedicated `PaymentGateway` contract with a `ManualGateway` implementation
- overdue/past-due lifecycle and 3-day grace period
- 30/7/1-day renewal reminders
- 24-hour lead notification queue job

Existing scheduled commands in `backend/routes/console.php`:

- `biz:aggregate-stats` daily at 01:00
- `biz:expire-subscriptions` daily at 00:15
- `biz:send-subscription-reminders` daily at 09:00

## 6. Existing API Routes

All routes are in `backend/routes/business.php`.

| Area | Current prefix |
|---|---|
| Public directory | `/api/v1/business/public/...` |
| Owner portal | `/api/v1/business/owner/...` |
| Admin business | `/api/v1/admin/business/...` |

Prompt 2A-plus expects:

| Area | Required prefix |
|---|---|
| Public directory | `/api/v1/business/...` |
| Owner portal | `/api/v1/business/me/...` |
| Admin business | `/api/v1/admin/business/...` |

The admin prefix already matches. Public and owner prefixes do not.

Current owner endpoints include profile, stats, hours, closures, contacts, services, media, KYC, leads, reviews, notifications, team, plans, subscription, trial, and upgrade requests. This is useful functional coverage, but the route contract differs from the spec.

## 7. Existing Frontend State

| App | Current responsibility | Prompt 2A-plus expectation |
|---|---|---|
| `frontend-travel` | Tourist travel app | Preserve; add "Discover Local Businesses" integration only if approved |
| `frontend-business` | Public business directory only | Public directory **plus** owner dashboard |
| `admin-business` | Business staff admin and owner dashboard | Business admin only; owner dashboard moves out |
| `A-Khemra-supper-admin` | Super-admin/content admin | Keep separate; plan/billing oversight may live here or in `admin-business` |

The owner dashboard currently lives in `admin-business`. Prompt 2A-plus explicitly requires it in `frontend-business`.

## 8. Conflicts That Block Implementation

1. **Schema collision.** The spec's table names and columns do not match the existing module. New tables can be added, but some existing tables (`biz_leads`, `biz_reviews`, `biz_subscriptions`) are semantically incompatible, not merely missing columns.
2. **Plan contract.** Existing plan codes, Pro price, entitlement storage, and trial rules differ from the spec.
3. **Route contract.** Public and owner route prefixes differ; existing frontends and tests depend on the current routes.
4. **Role contract.** Required canonical roles and permission names are missing.
5. **Frontend ownership.** The owner dashboard is in the wrong app.
6. **Test isolation.** The backend suite uses a shared database and currently fails from persisted test data.
7. **Additive-only rule.** The spec forbids editing or dropping existing migrations, so correcting existing tables requires new migration files and deliberate backfills.

These conflicts cannot be resolved safely without choosing one of the strategies below. Guessing would risk breaking working Phase 1/Phase 2 behavior or creating two competing business modules.

## 9. Migration Strategy Options

### Option A — In-place additive evolution (recommended)

Keep the existing tables and endpoints, add new migrations for missing columns/tables, backfill plan and membership data, and add spec-compatible route aliases and services.

- Preserves existing data and most tests.
- Requires careful handling of `biz_leads`, `biz_reviews`, and `biz_subscriptions`.
- Can keep old endpoints working while new clients use the spec contract.
- Best balance of delivery risk and spec compliance.

### Option B — Parallel spec-compliant module

Add a fresh set of spec tables and services alongside the existing V1 module, then switch frontends and tests gradually.

- Lowest risk to existing behavior.
- Highest duplication and long-term maintenance cost.
- Risks violating the "one module" intent.

### Option C — Wait for a revised specification

Ask the founder to reconcile Prompt 2A-plus with the already-built module, then implement one agreed contract.

- Avoids rework.
- Delays delivery.

## 10. Recommended Next Steps

1. Approve one migration strategy. **Option A is recommended.**
2. Fix test isolation with a dedicated test database or reliable transactional cleanup.
3. Add additive schema migrations and backfills.
4. Add `EntitlementsService`, payment gateway contract, invoices, featured slots, partner requests, and the missing scheduled jobs.
5. Add spec-compatible routes and role/permission aliases.
6. Move the owner dashboard into `frontend-business`.
7. Update tests, OpenAPI, Postman, README, and `DECISIONS.md`.
8. Run the complete backend and frontend verification suite.

## 11. Verification Commands

```powershell
php artisan test
npm run test --prefix frontend-business
npm run test --prefix frontend-travel
npm run build --prefix frontend-travel
npm run build --prefix frontend-business
npm run build --prefix admin-business
npm run build --prefix A-Khemra-supper-admin
php artisan scramble:export
```

## 12. Constraints and Environment Notes

- `composer` is unavailable, so Laravel Boost cannot be installed.
- `rg` is unavailable; use built-in search tools.
- PowerShell mangles Khmer output; read Khmer files with the file-read tool and avoid shell redirection for Khmer content.
- The project root is not a Git repository, so there is no branch or commit safety net.
- No browser automation is available for visual QA.
- Preserve demo emails and `DB_DATABASE=khemara_morodok`.
- Preserve CamGO contact details: `contact@camgo.com`, `facebook.com/camgo`, `t.me/camgo`, `camgo.com.kh`.
