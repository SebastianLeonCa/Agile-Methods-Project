import type { Spot } from "@/lib/types";
import { formatDate, spotIcon, STATUS_LABEL, TYPE_LABEL, URGENCY_LABEL } from "@/lib/utils";

type Props = {
  spot: Spot;
  onClose: () => void;
};

/** Side panel on desktop, bottom sheet on mobile. */
export default function SpotDetails({ spot, onClose }: Props) {
  return (
    <aside
      aria-label="Spot details"
      className="absolute inset-x-0 bottom-0 z-[1000] max-h-[70%] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-96 sm:rounded-none dark:bg-zinc-900"
    >
      <div className="sticky top-0 flex items-start justify-between gap-2 bg-white p-4 pb-2 dark:bg-zinc-900">
        <h2 className="text-lg leading-snug font-semibold">{spot.title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="-m-1 rounded-full p-2 text-xl leading-none text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 px-4 pb-6">
        {spot.before_photo_url && (
          <div className={spot.after_photo_url ? "grid grid-cols-2 gap-2" : ""}>
            <Photo src={spot.before_photo_url} label={spot.after_photo_url ? "Before" : undefined} />
            {spot.after_photo_url && <Photo src={spot.after_photo_url} label="After" />}
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-sm">
          <Badge>{TYPE_LABEL[spot.type]}</Badge>
          <Badge>
            {spotIcon({ urgency: spot.urgency, status: "dirty" })} {URGENCY_LABEL[spot.urgency]}
          </Badge>
          <Badge>{STATUS_LABEL[spot.status]}</Badge>
        </div>

        {spot.description && <p className="text-zinc-700 dark:text-zinc-300">{spot.description}</p>}

        <dl className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          {spot.address && (
            <div>
              <dt className="sr-only">Address</dt>
              <dd>📍 {spot.address}</dd>
            </div>
          )}
          <div>
            <dt className="inline">Reported </dt>
            <dd className="inline">{formatDate(spot.created_at)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">{children}</span>;
}

function Photo({ src, label }: { src: string; label?: string }) {
  return (
    <figure className="relative">
      {/* Plain <img>: photos come from external hosts and we skip Vercel image optimization limits. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label ? `${label} photo` : "Spot photo"} className="aspect-[4/3] w-full rounded-lg object-cover" />
      {label && (
        <figcaption className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{label}</figcaption>
      )}
    </figure>
  );
}
