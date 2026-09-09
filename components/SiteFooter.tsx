import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-low mt-space-4xl">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-3xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-xl">
          <div className="md:col-span-5 flex flex-col justify-between space-y-space-md">
            <div>
              <span className="font-headline-md text-headline-md text-primary-container block tracking-tight">
                {siteConfig.cafeName}
              </span>
              <p className="font-subheading text-subheading text-on-surface-variant mt-space-xs italic">
                {siteConfig.tagline}
              </p>
            </div>
            <div className="pt-space-lg">
              <p className="font-headline-sm text-headline-sm text-primary-container italic">
                &ldquo;See you in the morning.&rdquo;
              </p>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col space-y-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-space-2xs">
              Neighborhood Presence
            </span>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed">
              {siteConfig.addressLine1}
              <br />
              {siteConfig.addressLine2}
              <br />
              {siteConfig.addressLine3}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
              Monday – Friday: {siteConfig.hours.weekday}
              <br />
              Saturday – Sunday: {siteConfig.hours.weekend}
            </p>
          </div>

          <div className="md:col-span-3 flex flex-col space-y-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-space-2xs">
              Quiet Channels
            </span>
            <a
              className="font-body-md text-body-md text-on-surface hover:text-secondary transition-colors duration-150"
              href={siteConfig.instagramUrlPlaceholder}
              target="_blank"
              rel="noopener noreferrer"
            >
              {siteConfig.instagramHandle}
            </a>
            <a
              className="font-body-md text-body-md text-on-surface hover:text-secondary transition-colors duration-150"
              href={`mailto:${siteConfig.publicEmailPlaceholder}`}
            >
              {siteConfig.publicEmailPlaceholder}
            </a>
            <span className="font-body-sm text-body-sm text-on-surface-variant pt-space-md">
              © {new Date().getFullYear()} {siteConfig.cafeName} Helio Coffee.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
