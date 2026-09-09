import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export function VisitSection() {
  return (
    <section className="w-full py-space-4xl bg-surface scroll-mt-20" id="visit">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-space-2xl border-b border-outline-variant/40 pb-space-lg">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container block mb-space-2xs">
              The Neighborhood
            </span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container tracking-tight">
              Find us in Makati.
            </h2>
          </div>
          <p className="font-subheading text-subheading italic text-on-surface-variant mt-2 md:mt-0">
            Nestled along the tree-lined pedestrian side of Salcedo Village.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
          <div className="lg:col-span-6">
            <div className="rounded-xl overflow-hidden shadow-sm border border-outline-variant/40">
              <Image
                alt="Bloom and Bean café exterior on Valero Street in Salcedo Village Makati with outdoor plants"
                className="w-full h-[400px] md:h-[480px] object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJk-4fsi3zt3gH-_zsEs6nvwkoTSxQnvwNhVx3Tb8HM7LqCyi5mplHiyglFshzU8eixAteSUglCU2Ag9waFoFr2H6pzvJfHjY8BGCv9wW9dcOBFnzxQkivkgW-BQ2I-q1NgScwTyfyNS2Mqu6pAVs6HVDPx_Zb53qbIwY50Vb1GMlvCTer7KUI8W3m1UTvBjXMJtd66dPnsPGCpK1WFYGv9jDQfba6YbVBPsGZKkIwAXlTFGUVrKh4TQ"
                width={1200}
                height={1440}
              />
            </div>
            <div className="mt-space-sm flex items-center justify-between text-on-surface-variant text-label-sm font-label-sm">
              <span>Valero St. Sidewalk View</span>
              <span>Ground Floor, Paseo Parkview</span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col space-y-space-xl">
            <div className="border-b border-outline-variant/30 pb-space-md">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container block mb-1">
                Location
              </span>
              <p className="font-headline-sm text-headline-sm text-primary-container">
                {siteConfig.addressLine1}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {siteConfig.addressLine2}, {siteConfig.addressLine3}
              </p>
            </div>

            <div className="border-b border-outline-variant/30 pb-space-md">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container block mb-1">
                Regular Hours
              </span>
              <div className="grid grid-cols-2 gap-space-sm mt-2 text-body-sm font-body-sm text-on-surface-variant">
                <div>
                  <span className="text-on-surface font-medium block">
                    Monday – Friday
                  </span>
                  <span>{siteConfig.hours.weekday}</span>
                </div>
                <div>
                  <span className="text-on-surface font-medium block">
                    Saturday – Sunday
                  </span>
                  <span>{siteConfig.hours.weekend}</span>
                </div>
              </div>
            </div>

            <div className="border-b border-outline-variant/30 pb-space-md">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container block mb-1">
                Direct Line
              </span>
              <p className="font-headline-sm text-headline-sm text-primary-container font-subheading">
                {siteConfig.publicPhonePlaceholder}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Call us for pastry reservations or immediate counter
                inquiries.
              </p>
            </div>

            <div className="space-y-space-sm pt-space-xs">
              <a
                className="inline-flex items-center gap-space-xs text-secondary font-label-md text-label-md tracking-wider uppercase group"
                href={siteConfig.mapsUrlPlaceholder}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="border-b border-secondary pb-0.5 group-hover:border-primary-container group-hover:text-primary-container transition-colors">
                  Open in Maps
                </span>
                <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                  north_east
                </span>
              </a>
              <div className="p-space-md bg-surface-container-low rounded border border-outline-variant/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-on-tertiary-container text-xl mt-0.5">
                  local_parking
                </span>
                <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                  Street parking available nearby along Valero and Sedeno.
                  Quiet walking distance from the Saturday Salcedo Community
                  Market at Jaime Velasquez Park.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
