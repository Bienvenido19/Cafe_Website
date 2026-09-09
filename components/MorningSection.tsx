import Image from "next/image";

export function MorningSection() {
  return (
    <section className="w-full py-space-3xl bg-surface-container-low border-y border-outline-variant/30">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl">
          <div className="max-w-xl">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container block mb-space-2xs">
              Morning
            </span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container tracking-tight">
              First coffee. Something warm from the oven.
            </h2>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mt-space-sm md:mt-0">
            We start early. Coffee on, pastries out, kitchen warming up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-stretch">
          <div className="md:col-span-7 flex flex-col justify-between group">
            <div className="overflow-hidden rounded-lg bg-surface">
              <Image
                alt="Hand pouring smooth oat milk latte art in ceramic cup at Bloom and Bean"
                className="w-full h-[320px] md:h-[460px] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAF3grXX0u3lgJ4UollrL1_HS13YpcT_btloaRPguhzu-YObQs8sTr5B-0e8tabxKMFpjZbJ9i1jHRuGF7R5ZwPPV4kbHQ-i1pBxgUZPHFbHmDqebI5SvxMxcvwHKP0Iwg8AmhRXnuXtf6-_Q_thro2HM_fdR_O1zOjFj6i5rBoR7aUwkNleT2yNW0Oe-GuKxfC_-nHEQOpSg2apfEqp-627Av69duU9dyQWVK6pc56xeGyDXF5m30Xg"
                width={1100}
                height={920}
              />
            </div>
            <div className="mt-space-sm pt-space-xs border-t border-outline-variant/40 flex justify-between items-baseline">
              <span className="font-headline-sm text-headline-sm text-primary-container italic">
                Single Origin Espresso
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Dialed in every morning by 6:45 AM
              </span>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col justify-between mt-space-lg md:mt-space-2xl group">
            <div className="overflow-hidden rounded-lg bg-surface">
              <Image
                alt="Fresh crusty country sourdough bread loaf and golden croissants on ceramic dish"
                className="w-full h-[280px] md:h-[380px] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIk7ThgidHdiXERs2pPS_Ab3LFsVDAhf_C8MU10WNWvhffZakMSVIcvrmwUUASHzzh20EyqdqK3ahxog0WrPq1shc9mIfOh9B2asgiF4hLF0cFHFPRDvueveOIO8T9uE4kKtiGSFrw5FsQVkQg5LYldO1bRbX4Ja0Nd1XnV7Y4YI0dLzGvnOnBeabZNp7a0cFF82R0D9WCdyIseQ6adhL0aMoprRSM_-lT4ByajvbbnlGhzwypHe0W6A"
                width={800}
                height={640}
              />
            </div>
            <div className="mt-space-sm pt-space-xs border-t border-outline-variant/40 space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-headline-sm text-headline-sm text-primary-container italic">
                  Sourdough & Viennoiserie
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  First tray: 07:15 AM
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Baked with wild yeast starter, naturally leavened over 36
                hours. Butter laminated croissants ready before the
                neighborhood commute begins.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
