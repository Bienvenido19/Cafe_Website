import { siteConfig } from "@/lib/site-config";
import { ReservationForm } from "./ReservationForm";

export function ReservationSection() {
  return (
    <section
      className="w-full py-space-4xl bg-surface-container scroll-mt-20 border-y border-outline-variant/40"
      id="reservation"
    >
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-space-md">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container block">
                Reservations
              </span>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container tracking-tight">
                Save a table.
              </h2>
              <p className="font-subheading text-subheading text-on-surface-variant leading-relaxed">
                Tell us when you are coming. We will take care of the rest.
              </p>
              <div className="pt-space-md space-y-space-sm font-body-sm text-body-sm text-on-surface">
                <div className="flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-secondary shrink-0 mt-0.5 text-base">
                    check
                  </span>
                  <p>
                    We welcome walk-ins at our counter and patio bar anytime
                    throughout the morning.
                  </p>
                </div>
                <div className="flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-secondary shrink-0 mt-0.5 text-base">
                    check
                  </span>
                  <p>
                    Table reservations help us prepare our kitchen and ensure
                    comfortable seating for groups.
                  </p>
                </div>
                <div className="flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-secondary shrink-0 mt-0.5 text-base">
                    info
                  </span>
                  <p className="text-on-surface-variant">
                    Notice: This is a request for staff review and does not
                    imply immediate confirmation. A {siteConfig.currencySymbol}
                    {siteConfig.depositAmountPhp} deposit secures your table
                    once staff confirms.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-space-xl p-space-md bg-surface rounded border border-outline-variant/40">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block mb-1">
                Large Parties & Private Roasts
              </span>
              <p className="font-body-sm text-body-sm text-on-surface">
                For coffee tastings, team morning meetings, or celebrations
                exceeding 6 guests, write directly to{" "}
                <span className="text-secondary font-medium">
                  {siteConfig.publicEmailPlaceholder}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-surface p-space-lg md:p-space-xl rounded-lg shadow-sm border border-outline-variant/50">
              <ReservationForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
