import { ArrowRight, CalendarDays, Images, Map as MapIcon, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import ImpactStats, { ImpactStatsSkeleton } from "@/components/ImpactStats";
import Logo from "@/components/Logo";
import MapPreview from "@/components/MapPreview";
import { buttonClass, secondaryButtonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: MapPin, title: "Report a dirty spot", text: "Drop a pin, add a photo and say how urgent it is." },
  { icon: CalendarDays, title: "Organize a cleanup", text: "Pick a date and a meeting point. Neighbors join in one tap." },
  { icon: Sparkles, title: "Show the before & after", text: "Upload the after photo and watch the pin turn clean." },
];

const FEATURES = [
  { icon: MapIcon, title: "Litter Map", text: "See every reported spot around you, colored by urgency.", live: true },
  { icon: CalendarDays, title: "Cleanup Events", text: "Create events, set a meeting point and see who is coming." },
  { icon: Images, title: "Before & After", text: "Compare photos side by side and share the result." },
  { icon: Users, title: "Community", text: "Groups, friends and a live chat for every cleanup." },
  { icon: ShieldCheck, title: "Safety", text: "Flag dangerous waste and get safety tips before you go." },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft/60 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-2 lg:pt-20 lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-semibold text-brand-dark shadow-sm">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden /> Community cleanups, made simple
            </p>
            <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">CleanUp Map</h1>
            <p className="mt-3 font-display text-xl font-semibold text-brand-dark sm:text-2xl">
              See it. Map it. Clean it. Together.
            </p>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
              Report dirty places in your neighborhood, organize cleanups with your community, and show the before & after.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/map" className={cn(buttonClass, "px-6 py-3 text-base")}>
                Explore the map <ArrowRight className="size-4.5" aria-hidden />
              </Link>
              <Link href="/signup" className={cn(secondaryButtonClass, "px-6 py-3 text-base")}>
                Sign up
              </Link>
            </div>
          </div>
          <MapPreview />
        </div>
      </section>

      {/* How it works */}
      <Section eyebrow="How it works" title="From dirty spot to clean spot in three steps">
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-line bg-white p-6 shadow-sm">
              <span className="absolute top-6 right-6 font-display text-sm font-bold text-slate-400">0{i + 1}</span>
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <step.icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Features */}
      <Section eyebrow="Features" title="Everything a cleanup needs" className="bg-surface">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-2xl border border-line bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <f.icon className="size-5" aria-hidden />
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    f.live ? "bg-brand-soft text-green-800" : "bg-slate-100 text-slate-600",
                  )}
                >
                  {f.live ? "Live" : "Coming soon"}
                </span>
              </div>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Live impact */}
      <Section eyebrow="Live impact" title="Our community so far">
        <Suspense fallback={<ImpactStatsSkeleton />}>
          <ImpactStats />
        </Suspense>
      </Section>

      {/* Vision */}
      <section className="bg-brand-dark px-4 py-20 text-center text-white sm:px-6">
        <p className="text-sm font-semibold tracking-widest text-green-100 uppercase">Our vision</p>
        <blockquote className="mx-auto mt-4 max-w-3xl font-display text-2xl leading-snug font-bold sm:text-3xl">
          “A world where every community can see its dirty places, come together, and make them clean, one cleanup at a
          time.”
        </blockquote>
      </section>

      {/* Final call to action */}
      <Section>
        <div className="rounded-3xl border border-line bg-gradient-to-br from-brand-soft to-white p-8 text-center shadow-sm sm:p-12">
          <h2 className="text-3xl font-bold tracking-tight">Join your community</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Every cleanup starts with one pin on the map. Create a free account and make your neighborhood shine.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className={cn(buttonClass, "px-6 py-3 text-base")}>
              Create a free account
            </Link>
            <Link href="/map" className={cn(secondaryButtonClass, "px-6 py-3 text-base")}>
              Explore the map
            </Link>
          </div>
        </div>
      </Section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Logo />
            <p className="mt-2">See it. Map it. Clean it. Together.</p>
          </div>
          <p>
            Map data ©{" "}
            <a href="https://www.openstreetmap.org/copyright" className="underline hover:text-ink">
              OpenStreetMap
            </a>{" "}
            contributors
          </p>
        </div>
      </footer>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  className,
  children,
}: {
  eyebrow?: string;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {eyebrow && <p className="text-sm font-semibold tracking-widest text-brand-dark uppercase">{eyebrow}</p>}
        {title && <h2 className="mt-2 mb-10 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
        {children}
      </div>
    </section>
  );
}
