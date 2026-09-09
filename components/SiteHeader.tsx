import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#menu", label: "Menu" },
  { href: "#visit", label: "Visit" },
];

export function SiteHeader() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(44,27,20,0.03)]">
      <div className="h-20 max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop flex items-center justify-between">
        <Link href="#about" className="flex items-center gap-space-sm focus:outline-none">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuApjeVs9h8PJZNyjd11-U3K4rQRV7EpMcTMApAyduR26kWzbgbBMEwvGZhJELbkjKKzj2-5ezt3L4z0o4FS_LzNdPoQNuYaV8BuEC1EBEfwFGsCr3GgeT16QQYC4YPZ9zga-SuC7ZsIzdo65ACVJn21yRNTXWg-mWvDoBaumG79O1nTOlFG-C-E6FXtS0pxzvHWIg27ErC5r9-nCrFYDJ90VZZlMTaf-B0ut2NMQ9Xo_zOhYyRv0RL8qQ"
            alt="Bloom & Bean emblem"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
            unoptimized
          />
          <span className="flex flex-col">
            <span className="font-headline-sm text-headline-sm tracking-tight text-primary-container leading-none">
              {siteConfig.cafeName}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">
              {siteConfig.neighborhood.replace(", ", " • ")}
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-space-xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-space-md">
          <a
            href="#reservation"
            className="px-space-md py-space-xs rounded bg-primary-container text-on-primary font-body-md text-body-sm hover:bg-on-surface-variant hover:text-on-surface transition-all duration-150 shadow-[0_2px_8px_rgba(44,27,20,0.06)]"
          >
            Reserve a Table
          </a>
        </div>
      </div>
    </header>
  );
}
