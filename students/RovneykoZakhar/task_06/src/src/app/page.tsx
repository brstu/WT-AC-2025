"use client";

import Appbar from "@/components/Appbar/Appbar";
import { Footer } from "@/components/Landingpage/Footer";
import { HeroSection } from "@/components/Landingpage/HeroSection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Appbar />
      <div className="mt-24">
      <HeroSection />
      <Footer />
      </div>
    </div>
  );
}
