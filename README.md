# 🇰🇭 CamGO Monorepo
> **CamGO Travel (B2C) + CamGO Business (B2B): Unified Cambodian Tourism Ecosystem**
> Shared Laravel 12 Backend REST API & Modern React 18 + Vite SPAs

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-101%20Passed%20%28554%20assertions%29-brightgreen)](#testing)
[![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

---

## 🌐 Applications & Port Map

| Application | Role | Port | URL |
| :--- | :--- | :--- | :--- |
| **Backend API** | Shared Laravel API for Travel & Business | `8000` | [http://localhost:8000](http://localhost:8000) (Docs: `/docs/api`) |
| **Frontend Travel** | Phase 1 Public Tourist Portal | `5173` | [http://localhost:5173](http://localhost:5173) |
| **Admin Travel** | Phase 1 Staff Portal (Destinations & Content) | `5174` | [http://localhost:5174](http://localhost:5174) |
| **Frontend Business** | Public Directory + Business Owner Portal (`/owner`) | `5175` | [http://localhost:5175](http://localhost:5175) |
| **Admin Business** | Staff Portal only (`/admin`) | `5176` | [http://localhost:5176](http://localhost:5176) |

---

## ⚡ First-Run Quickstart (Under 10 Commands)

To run the entire ecosystem locally from scratch:

```bash
# 1. Start MySQL on port 3306 (via Laragon or service)
# 2. Setup backend environment and database
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link

# 3. Launch all 5 servers simultaneously with one click
cd ..
start.bat
```

All 5 servers will open in individual terminals and be immediately accessible at their respective ports.

---

## 🔒 Locked Decisions & Non-Goals ("Not Built on Purpose")

In accordance with Phase 2 (Step 2A) specifications, the following architectural decisions are strictly enforced:

1. **Contact-First Tourism Flow**: Tourists contact businesses directly via phone, Telegram, WhatsApp, Messenger, email, website, and directions. There is still no booking engine, commission, or online payment for tourism transactions. Subscription billing is handled separately via manual KHQR/offline settlement during the pilot.
2. **Admin-Provisioned Accounts**: Super Admin creates businesses and their owner accounts. Business owners can manage only their own business through the scoped owner portal. There is no public self-registration, and owners cannot verify or publish themselves. Owner details (`owner_name`, `owner_phone`, `internal_notes`) remain internal admin-only fields.
3. **Strict Privacy**: Public responses **never** expose owner details, KYC documents, internal notes, `email_hash`, or `ip_hash`.
4. **Hashed Analytics**: Contact events use non-blocking `navigator.sendBeacon` and store daily-rotating session hashes instead of raw IPs or full user agents.
5. **Private KYC Storage**: Identity and business licenses are stored on an isolated private disk and served only through authenticated, permission-checked endpoints (`business.kyc.view`).
6. **Billing Core (Phase 1 Complete)**: Plan catalog, subscription records, manual KHQR/offline payments, owner upgrade requests, Super Admin billing APIs/UI, audit logging, and scheduled expiry/downgrade are implemented. The verified badge remains a KYC trust decision and is not granted solely by a paid plan. Still out of scope: automated payment gateways, payouts, commissions, booking slots, QR check-in, and Telegram bots.
7. **Phase 2 Entitlements Complete**: Effective tiers respect subscription expiry even before the nightly downgrade job runs. Category and province sponsorships only apply with an active paid subscription, are capped to the subscription end date, and boost public ranking only inside the matching category/province context. The verified badge remains KYC-only.
8. **Phase 3 Portal Separation Complete**: Staff use `/admin/*` in `admin-business` (port 5176) with the staff-only `AdminRoute` guard. Owners use `/owner/*` in `frontend-business` (port 5175) with the `OwnerRoute` guard and owner-only navigation. Backend owner endpoints require the `owner` middleware (`auth:sanctum` + linked active business). Cross-portal access is rejected on both the frontend and API.
9. **Phase 4 Partner Success Complete**: Owners now have lead tracking, review replies, in-app/Telegram notification preferences, business team roles, category-specific profile fields, profile scoring, a 14-day Featured trial, and renewal guidance. Access is capability-based (`business.can`) for `owner`, `manager`, `editor`, and `viewer` memberships. Trials require an 80% profile score, KYC verification, and no prior trial. Payments remain manual KHQR/cash/bank settlement; there is still no automated gateway, commission, payout, or booking engine.



## 📂 Monorepo Architecture

```
CamGO/
├── backend/                             # ONE Shared Laravel 12 Backend
│   ├── app/Modules/Business/            # Clean Modular Business Architecture
│   │   ├── Models/                      # Business, Contact, Hour, Media, Document, Review, etc.
│   │   ├── Http/Controllers/Admin/      # Staff controllers (Businesses, KYC, Stats, Reviews...)
│   │   ├── Http/Controllers/Owner/      # Owner-scoped controllers (My Business, Subscription, Leads)
│   │   ├── Http/Controllers/Public/     # Public controllers (Directory, Profile, Reviews, Events)
│   │   ├── Policies/                    # BusinessPolicy with granular Spatie permissions
│   │   ├── Observers/                   # BusinessObserver (cache invalidation) & ReviewObserver
│   │   ├── Actions/                     # GD WebP conversion & nightly stats aggregator
│   │   └── Console/Commands/            # php artisan biz:aggregate-stats
│   ├── database/migrations/             # Additive migrations prefixed with biz_*
│   ├── routes/business.php              # Versioned Business routes (/api/v1/business/...)
│   └── tests/Feature/                   # Feature tests (Travel + Business)
│
├── frontend-travel/                     # Phase 1 Public Tourist Portal (Port 5173 - Unmodified)
├── admin/                               # Phase 1 Admin Portal (Port 5174 - Unmodified)
│
├── frontend-business/                   # Phase 2 Public Directory + Owner Portal (Port 5175)
│   ├── src/pages/                       # Home, Directory, Profile (/b/:slug), auth, owner pages (/owner)
│   ├── src/components/common/           # BusinessCard, LazyMap, OwnerRoute, toasts
│   ├── src/lib/ownerApi.js              # Auth + response-unwrapping client for owner APIs
│   └── src/lib/trackEvent.js            # Non-blocking beacon event logger
│
├── admin-business/                      # Phase 4 Staff Portal only (Port 5176)
│   ├── src/pages/admin/                 # Staff: Dashboard, Businesses (7-tab editor), Reviews, Stats, Audit
│   ├── src/layouts/                     # PortalLayout shell, AdminLayout (/admin)
│   └── src/components/common/           # AdminRoute (staff), KYC viewer, toasts
│
├── docs/                                # Technical Documentation & Contracts
│   ├── inspection.md                    # Initial codebase analysis & conventions
│   ├── api.md                           # Public & Admin Business API specification
│   └── travel-nearby-snippet.md         # Ready-to-paste Travel snippet for nearby businesses
│
├── DECISIONS.md                         # Architecture assumptions and design rationale
├── start.bat                            # 1-Click launcher for all 5 services
└── README.md
```

---

## 🧪 Automated Testing

### Backend Test Suite (Pest / PHPUnit)
```bash
cd backend
php artisan test
```
**Results**: **75 tests passed, 0 failed, 384 assertions** covering:
- Permission boundaries per admin endpoint (Super Admin vs Business Manager vs Unauthorized)
- Status state transitions and publishing validation requirements
- Review moderation, spam honeypot filtering, and rating calculations
- Non-blocking contact event rate limits and session hashing
- Open/closed computation in `Asia/Phnom_Penh` across midnight and closures
- Bilingual Khmer and English search
- Proximity calculations and nearest destination relationships
- Privacy leak prevention: asserting KYC, owner info, and IP hashes are never exposed
- Subscription expiry gating so expired or unset paid plans cannot keep featured placement
- Plan management, subscription activation, manual payment recording, KYC badge separation, owner upgrade requests, and scheduled expiry/downgrade
- Effective-tier fallback, context-aware category/province sponsor ranking, sponsor expiry gating, and sponsor-date caps
- Staff-vs-owner portal boundaries: staff blocked from owner endpoints, owners blocked from staff endpoints, and owner accounts require an active linked business
- Phase 4 partner success: lead capture/stages, owner review replies, notification preferences, team invitations and role capabilities, profile scoring, category profile fields, and trial eligibility
- Bounded query counts preventing N+1 queries on public listing

### Frontend Test Suite (Vitest)
```bash
cd frontend-business
npx vitest run
```
**Results**: **5 tests passed**; backend suite **101 tests / 557 assertions passing**. Frontend coverage:
- URL filter synchronization (serialization & deserialization)
- Contact button non-blocking event tracking with `navigator.sendBeacon` and `fetch` fallback

---

## 📄 License
This project is licensed under the MIT License for the promotion and preservation of Cambodian Tourism & Cultural Heritage.
