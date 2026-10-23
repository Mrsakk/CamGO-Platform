import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  MapPin,
  Star,
} from "lucide-react";

const colors = [
  ["Background", "bg-paper", "border-line"],
  ["Surface", "bg-cream", "border-line"],
  ["Surface 2", "bg-sage", "border-line"],
  ["Text", "bg-ink", "border-ink"],
  ["Muted", "bg-muted", "border-muted"],
  ["Line", "bg-line", "border-line"],
  ["Gold", "bg-brand-500", "border-brand-500"],
  ["Teal", "bg-teal-600", "border-teal-600"],
  ["Lotus", "bg-lotus-500", "border-lotus-500"],
  ["Danger", "bg-danger-600", "border-danger-600"],
];

const Section = ({ title, note, children }) => (
  <section className="space-y-5 border-t border-line py-10 first:border-t-0 dark:border-white/10">
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <h2 className="text-xl font-bold text-ink dark:text-cream">{title}</h2>
      {note ? <p className="max-w-md text-sm text-muted dark:text-white/55">{note}</p> : null}
    </div>
    {children}
  </section>
);

const Swatch = ({ name, bg, border }) => (
  <div className="rounded-card border border-line bg-cream p-3 dark:border-white/10 dark:bg-stone-850">
    <div className={`h-16 rounded-control border ${bg} ${border}`} />
    <p className="mt-3 text-sm font-semibold text-ink dark:text-cream">{name}</p>
  </div>
);

export const DesignSystemPage = () => (
  <div className="min-h-screen bg-paper px-4 py-8 text-ink dark:bg-stone-900 dark:text-cream sm:px-6">
    <Helmet>
      <title>CamGO design system</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>

    <div className="mx-auto max-w-content">
      <header className="flex flex-col justify-between gap-5 rounded-card border border-line bg-cream p-6 shadow-premium dark:border-white/10 dark:bg-stone-850 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Internal preview</p>
          <h1 className="mt-2 text-2xl font-bold">CamGO design system</h1>
          <p className="mt-2 max-w-xl text-sm text-muted dark:text-white/55">
            Shared tokens, type and components for the public directory and owner
            portal. This route is hidden from navigation and indexed pages.
          </p>
        </div>
        <Link to="/" className="btn-secondary">
          Back to site
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <Section title="Colour" note="Light and dark values are defined once as CSS variables.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {colors.map(([name, bg, border]) => (
            <Swatch key={name} name={name} bg={bg} border={border} />
          ))}
        </div>
      </Section>

      <Section title="Typography" note="Kantumruy Pro and Inter only. Khmer keeps full line-height and no letter-spacing.">
        <div className="space-y-4 rounded-card border border-line bg-cream p-6 dark:border-white/10 dark:bg-stone-850">
          <h1 className="text-hero">Direct contact. No commission.</h1>
          <h2 className="text-2xl font-bold">A calmer way to discover Cambodia</h2>
          <h3 className="text-lg font-semibold">Local stays, food and guides</h3>
          <p className="max-w-2xl text-base leading-relaxed text-muted dark:text-white/60">
            Body copy stays at 16px with generous line-height. Supporting text is
            14px and never smaller.
          </p>
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Small label · 14px · weight 600
          </p>
        </div>
      </Section>

      <Section title="Buttons and controls" note="One gold primary action per screen. Controls are 48px tall with a 12px radius.">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-primary">
            <Check className="h-4 w-4" />
            Primary action
          </button>
          <button type="button" className="btn-secondary">
            Secondary
          </button>
          <button type="button" className="btn-accent">
            Dark action
          </button>
          <button type="button" className="btn-primary" disabled>
            Disabled
          </button>
        </div>
        <div className="grid gap-3 rounded-card border border-line bg-cream p-5 dark:border-white/10 dark:bg-stone-850 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold">
            <span>Business name</span>
            <input className="field" placeholder="Angkor Kitchen" />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            <span>Province</span>
            <select className="field">
              <option>Siem Reap</option>
              <option>Phnom Penh</option>
            </select>
          </label>
        </div>
      </Section>

      <Section title="Chips, ratings and states" note="Badges describe facts. Featured and sponsored labels stay visible.">
        <div className="flex flex-wrap gap-2">
          <span className="premium-chip">
            <BadgeCheck className="h-4 w-4" />
            Verified
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 text-sm font-semibold dark:border-white/10 dark:bg-white/5">
            <Star className="h-4 w-4 fill-brand-500 text-brand-500" />
            4.8 · 126 reviews
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-sm font-bold text-forest-dark">
            Featured
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-sm font-semibold text-cream">
            Open now
          </span>
        </div>
      </Section>

      <Section title="Business card" note="4:3 imagery, 16px radius and a single soft shadow.">
        <article className="max-w-sm overflow-hidden rounded-card border border-line bg-cream shadow-premium dark:border-white/10 dark:bg-stone-850">
          <div className="flex aspect-[4/3] items-center justify-center bg-sage text-brand-700 dark:bg-white/5 dark:text-brand-300">
            <Building2 className="h-10 w-10" />
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="rounded-full bg-sage px-2.5 py-1 text-brand-700 dark:bg-white/5 dark:text-brand-300">
                Guesthouse
              </span>
              <span className="flex items-center gap-1 text-muted dark:text-white/50">
                <MapPin className="h-4 w-4" />
                Siem Reap
              </span>
            </div>
            <h3 className="text-lg font-semibold">Angkor Garden Stay</h3>
            <p className="text-sm text-muted dark:text-white/55">
              Family-run rooms five minutes from the old market.
            </p>
            <div className="flex items-center justify-between border-t border-line pt-3 text-sm dark:border-white/10">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-brand-500 text-brand-500" />
                4.9
              </span>
              <span className="text-muted dark:text-white/50">$$</span>
            </div>
            <button type="button" className="btn-primary w-full !min-h-0 !py-2.5">
              Call directly
            </button>
          </div>
        </article>
      </Section>

      <Section title="Plan cards and usage" note="Plan differences stay honest and readable.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Free", "$0", "Basic listing and direct contact"],
            ["Pro", "$10/mo", "More photos, services and leads"],
            ["Premium", "$25/mo", "Featured placement and partner tools"],
          ].map(([name, price, copy], index) => (
            <div
              key={name}
              className={`rounded-card border bg-cream p-5 shadow-premium dark:bg-stone-850 ${
                index === 1
                  ? "border-brand-500 ring-1 ring-brand-500"
                  : "border-line dark:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{name}</h3>
                {index === 1 ? (
                  <span className="rounded-full bg-brand-500 px-2.5 py-1 text-xs font-bold text-forest-dark">
                    Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-2xl font-bold">{price}</p>
              <p className="mt-2 text-sm text-muted dark:text-white/55">{copy}</p>
              <button
                type="button"
                className={index === 1 ? "btn-primary mt-5 w-full" : "btn-secondary mt-5 w-full"}
              >
                Choose plan
              </button>
            </div>
          ))}
        </div>
        <div className="rounded-card border border-line bg-cream p-5 dark:border-white/10 dark:bg-stone-850">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Photos</span>
            <span className="text-muted dark:text-white/55">9 / 12</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sage dark:bg-white/10">
            <div className="h-full w-3/4 rounded-full bg-brand-500" />
          </div>
        </div>
      </Section>

      <Section title="Empty state" note="Plain explanation plus one next action.">
        <div className="empty-state">
          <h3 className="text-lg font-semibold">No reviews yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted dark:text-white/55">
            Reviews appear here after staff moderation. There is nothing else to do
            right now.
          </p>
          <button type="button" className="btn-secondary mt-5">
            Refresh
          </button>
        </div>
      </Section>

      <footer className="border-t border-line py-8 text-sm text-muted dark:border-white/10 dark:text-white/45">
        CamGO design system · internal preview
      </footer>
    </div>
  </div>
);
