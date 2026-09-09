import Image from "next/image";

export function HeroSection() {
  return (
    <section
      id="about"
      className="relative w-full overflow-hidden bg-surface pb-space-3xl pt-space-xl scroll-mt-20"
    >
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-end">
          <div className="lg:col-span-7 flex flex-col space-y-space-md">
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="font-label-sm text-label-sm tracking-widest uppercase">
                Salcedo Village, Makati
              </span>
              <span className="w-8 h-[1px] bg-outline-variant" />
              <span className="font-subheading text-subheading italic text-on-tertiary-container">
                Quiet Morning Hours
              </span>
            </div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary-container tracking-tight leading-[1.08]">
              Coffee, and somewhere to sit.
            </h1>
            <p className="font-subheading text-subheading text-on-surface-variant max-w-xl leading-relaxed">
              Doors open early. Come in for a quick cup, breakfast, or an
              afternoon that runs longer than planned.
            </p>
            <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
              <a
                href="#reservation"
                className="px-space-lg py-space-sm bg-primary-container text-surface rounded hover:bg-on-surface-variant transition-colors duration-200 font-label-md text-label-md tracking-wider uppercase inline-flex items-center gap-2 shadow-sm"
              >
                <span>Reserve a Table</span>
                <span className="material-symbols-outlined text-sm">east</span>
              </a>
              <a
                href="#menu"
                className="px-space-md py-space-sm text-on-surface hover:text-secondary font-body-md text-body-md transition-colors duration-150 inline-flex items-center gap-1 group"
              >
                <span className="underline decoration-outline-variant group-hover:decoration-secondary underline-offset-4">
                  See the Menu
                </span>
                <span className="material-symbols-outlined text-base transition-transform group-hover:translate-y-0.5">
                  arrow_downward
                </span>
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col justify-end">
            <div className="p-space-md bg-surface-container-low rounded-lg border border-outline-variant/40 space-y-space-xs">
              <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
                <span>Makati Roastery Log</span>
                <span>Batch 08:15 AM</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                Morning sourdough freshly sliced. Filter urn filled with
                washed heirloom lot from Atok, Benguet. Soft sunlight through
                the linen blinds.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-space-xl relative w-full rounded-xl overflow-hidden shadow-sm">
          <Image
            alt="Morning sunlight streaming through the windows at Bloom and Bean Helio Coffee Salcedo Makati"
            className="w-full h-[380px] md:h-[540px] object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKEYsqmo-ZhJoc4mBZe0mVyX2v-zaDd8S_4CdPRxNguZiOc4OR4eATI1nlcqURRzsevnZxp4IdbKk_D6byelpkf4gKg_wNAVxfJooa6NJYSbssStZOqNxbyUfaiU5QIraSiwvtWp_96F2K4B1uHKFPtqauzS4CJl9UYfAY3ViyEz9SRMv0c3F2fNtVtg18Kl2MeBCUOBTlJDezIGCgKa-zHzB406zH4Em4bh7cZSdiU-LQBJz4iUhxgQ"
            width={1600}
            height={1080}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-space-md md:p-space-lg flex flex-wrap items-end justify-between gap-space-md text-on-primary">
            <div>
              <span className="font-label-sm text-label-sm tracking-widest uppercase text-primary-fixed block mb-1">
                Morning Atmosphere
              </span>
              <p className="font-headline-sm text-headline-sm italic">
                &ldquo;The corner bench warms first.&rdquo;
              </p>
            </div>
            <div className="text-right text-body-sm font-body-sm text-surface-container-low hidden sm:block">
              <span>Paseo Parkview • Salcedo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
