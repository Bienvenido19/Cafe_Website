import { siteConfig } from "@/lib/site-config";

export function AmbientBar() {
  return (
    <div className="w-full bg-surface-container-high text-on-surface-variant py-2.5 px-gutter-mobile lg:px-gutter-desktop border-b border-outline-variant/30">
      <div className="max-w-container-max mx-auto flex flex-wrap items-center justify-between gap-3 text-body-sm font-body-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="tracking-wide uppercase text-label-sm font-label-sm text-on-surface">
            Now Pouring
          </span>
          <span className="text-outline">/</span>
          <span className="italic font-subheading text-subheading">
            Sitio Belis Anaerobic Natural, Benguet
          </span>
        </div>
        <div className="flex items-center gap-space-md text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
          <span>
            Mon – Fri {siteConfig.hours.weekday} · Sat – Sun{" "}
            {siteConfig.hours.weekend}
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{siteConfig.neighborhood}</span>
        </div>
      </div>
    </div>
  );
}
