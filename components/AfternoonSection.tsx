import Image from "next/image";

export function AfternoonSection() {
  return (
    <section className="w-full py-space-3xl bg-surface">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-space-xl">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container block mb-space-2xs">
              Afternoon
            </span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container tracking-tight">
              Lunch, coffee, then maybe one more.
            </h2>
          </div>
          <p className="font-subheading text-subheading italic text-on-surface-variant max-w-md mt-2 md:mt-0">
            &ldquo;The kitchen stays open, the coffee keeps coming, and
            nobody is watching the clock.&rdquo;
          </p>
        </div>

        <div className="w-full rounded-xl overflow-hidden shadow-sm relative">
          <Image
            alt="Afternoon table with glasses, savory lunch plates, and notebooks at Bloom & Bean"
            className="w-full h-[380px] md:h-[480px] object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-1IK4U_jqt3u4KJ0dBLE2VeyIdjysP2M-W_rPthigNp8p0GlVlyjxjldAyGpfhgJiVjYePdeCBRXFskLA-phnypmEpYuTsqvmZLagb1uTgd5xO2haaX8IoC4MRLP7Kd-Q7woWJ5TzY4waBL7Rmgn33-WMAh6He9k0Wbcu4BdNDW2_mtZP9XkFbMHKENzKBSVxSsV-zEEkw7Qk8QxAdBJSIKRPsN0CFrzBYBO0_ulLqWaBjHpKCHd0KA"
            width={1600}
            height={960}
          />
          <div className="absolute bottom-0 inset-x-0 p-space-md md:p-space-lg bg-gradient-to-t from-primary/70 via-primary/20 to-transparent flex flex-col md:flex-row justify-between md:items-end text-on-primary">
            <div className="max-w-md">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">
                The Salcedo Afternoon
              </span>
              <p className="font-headline-sm text-headline-sm mt-1">
                From espresso to cold infusion, wine, and warm bread.
              </p>
            </div>
            <span className="font-body-sm text-body-sm text-surface-variant/80 mt-2 md:mt-0">
              Natural sunlight filtering through Paseo Parkview glass
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
