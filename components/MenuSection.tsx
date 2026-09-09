import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

function formatPrice(price: number): string {
  return `${siteConfig.currencySymbol}${price}`;
}

function MenuColumn({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: readonly { name: string; description: string; price: number }[];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-outline-variant pb-space-xs mb-space-md">
        <span className="font-headline-md text-headline-md text-primary-container">
          {title}
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
          {subtitle}
        </span>
      </div>
      <div className="space-y-space-md">
        {items.map((item, index) => (
          <div
            key={item.name}
            className={
              index === 0
                ? "group"
                : "border-t border-outline-variant/30 pt-space-sm group"
            }
          >
            <div className="flex justify-between items-baseline gap-space-sm">
              <span className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors">
                {item.name}
              </span>
              <span className="font-body-md text-body-md text-primary-container font-medium whitespace-nowrap">
                {formatPrice(item.price)}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MenuSection() {
  const { coffeeAndBar, breakfast, kitchenAndBakery } = siteConfig.menu;

  return (
    <section className="w-full py-space-3xl bg-surface-container-low scroll-mt-20" id="menu">
      <div className="max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop">
        <div className="border-b border-outline-variant/50 pb-space-lg mb-space-2xl flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container block mb-space-2xs">
              Daily Kitchen & Bar
            </span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container tracking-tight">
              A few things we make.
            </h2>
          </div>
          <p className="font-subheading text-subheading italic text-on-surface-variant mt-2 md:mt-0">
            A thoughtful seasonal selection prepared fresh each day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl">
          <div className="lg:col-span-5 flex flex-col space-y-space-xl">
            <MenuColumn
              title={coffeeAndBar.title}
              subtitle={coffeeAndBar.subtitle}
              items={coffeeAndBar.items}
            />
            <div className="p-space-md bg-surface rounded border border-outline-variant/40 space-y-2">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container block">
                Roaster&rsquo;s Note
              </span>
              <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                We roast exclusively in micro-batches on an electric infrared
                roaster. Sourced through direct relationships with farmer
                cooperatives across Benguet, Sagada, and Bukidnon.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 hidden lg:flex flex-col justify-center items-center">
            <div className="w-full h-full max-h-[520px] rounded-lg overflow-hidden border border-outline-variant/30">
              <Image
                alt="Artisanal table spread with coffee, sandwiches, and pastry at Helio Coffee"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-1IK4U_jqt3u4KJ0dBLE2VeyIdjysP2M-W_rPthigNp8p0GlVlyjxjldAyGpfhgJiVjYePdeCBRXFskLA-phnypmEpYuTsqvmZLagb1uTgd5xO2haaX8IoC4MRLP7Kd-Q7woWJ5TzY4waBL7Rmgn33-WMAh6He9k0Wbcu4BdNDW2_mtZP9XkFbMHKENzKBSVxSsV-zEEkw7Qk8QxAdBJSIKRPsN0CFrzBYBO0_ulLqWaBjHpKCHd0KA"
                width={520}
                height={1040}
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col space-y-space-xl">
            <MenuColumn
              title={breakfast.title}
              subtitle={breakfast.subtitle}
              items={breakfast.items}
            />
            <MenuColumn
              title={kitchenAndBakery.title}
              subtitle={kitchenAndBakery.subtitle}
              items={kitchenAndBakery.items}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
