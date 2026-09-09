import { SiteHeader } from "@/components/SiteHeader";
import { AmbientBar } from "@/components/AmbientBar";
import { HeroSection } from "@/components/HeroSection";
import { MorningSection } from "@/components/MorningSection";
import { RoomSection } from "@/components/RoomSection";
import { MenuSection } from "@/components/MenuSection";
import { AfternoonSection } from "@/components/AfternoonSection";
import { ReservationSection } from "@/components/ReservationSection";
import { VisitSection } from "@/components/VisitSection";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full pt-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <AmbientBar />
          <HeroSection />
          <MorningSection />
          <RoomSection />
          <MenuSection />
          <AfternoonSection />
          <ReservationSection />
          <VisitSection />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
