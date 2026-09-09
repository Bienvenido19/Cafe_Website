import Image from "next/image";

const roomFeatures = [
  {
    icon: "wifi",
    title: "Quiet Connectivity",
    description:
      "Dedicated fiber connection and discreet floor outlets beside low oak counters.",
  },
  {
    icon: "auto_stories",
    title: "Lending Shelves",
    description:
      "Curated literature on botany, slow food, Southeast Asian architecture, and essays.",
  },
  {
    icon: "pets",
    title: "Dog Friendly Patio",
    description:
      "Fresh water bowls and shaded terrazzo seating under the morning calachuchi trees.",
  },
  {
    icon: "chair",
    title: "Communal Table",
    description:
      "A solid 10-seater mango wood table designed for solo readers or quiet gatherings.",
  },
];

export function RoomSection() {
  return (
    <section className="w-full py-space-3xl bg-surface">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center mb-space-xl">
          <div className="lg:col-span-6">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container block mb-space-2xs">
              The Space
            </span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container tracking-tight">
              Stay awhile.
            </h2>
            <p className="font-subheading text-subheading text-on-surface-variant mt-space-sm leading-relaxed">
              Some people stay ten minutes. Some stay until lunch. There is
              room for both.
            </p>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-space-md text-on-surface">
            {roomFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-space-md bg-surface-container-low rounded border border-outline-variant/40"
              >
                <div className="flex items-center gap-2 mb-1 text-primary-container">
                  <span className="material-symbols-outlined text-lg">
                    {feature.icon}
                  </span>
                  <span className="font-label-md text-label-md uppercase tracking-wider">
                    {feature.title}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full rounded-xl overflow-hidden shadow-sm">
          <Image
            alt="Sunlit café room with wooden chairs and readers in Salcedo"
            className="w-full h-[360px] md:h-[500px] object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLQJngWottoyqu3yhvYRnb6XsSpMb1hC46DwEzE1ixNw9unSL8yO509Xa9nQFGPQVcTwluXiTIoATpqnMPWKrOUVC7bY6I1fP99Va7mqyn1rdSQMlCe7oRskGki6GThGQClVgMW0qb2jtZaolVDq1sWs0s7rjNrKbE3RWSIeXgh_gBvlk6TnNfj6wHBImeD6fzRvOwuTklEXD0OPNopje_Z5u7nqgg1uaexKto_o1ChLm4R5-4dH20pQ"
            width={1600}
            height={1000}
          />
          <div className="p-space-md bg-surface-container-lowest/90 backdrop-blur-sm md:absolute md:bottom-6 md:right-6 md:max-w-xs rounded border border-outline-variant/40">
            <p className="font-subheading text-subheading italic text-primary-container">
              &ldquo;Natural light changes every hour here. By two
              o&rsquo;clock, the golden beams hit the far bookshelf.&rdquo;
            </p>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mt-2">
              Salcedo Village Midday
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
