// src/pages/landingpage/LandingPage.tsx
import { useSearch } from "@tanstack/react-router";

import { HeroSection } from "./components/organisms/HeroSection";
import { Section2 } from "./components/organisms/Section2";
import { Section3 } from "./components/organisms/Section3";
import { Section4 } from "./components/organisms/Section4";
import { Section5 } from "./components/organisms/Section5";
import { Section6 } from "./components/organisms/Section6";
import { Section7 } from "./components/organisms/Section7";
import { Section8 } from "./components/organisms/Section8";

import Features from "./Features";
import Pricing from "./Pricing";
import AboutUs from "./AboutUs";
import Contact from "./Contact";


export default function LandingPage() {
  const search = useSearch({ strict: false }) as { page?: string };
  const page = search.page;

  const renderPageContent = () => {
    switch (page) {
      case "features":
        return <Features />;
      case "pricing":
        return <Pricing />;
      case "about-us":
        return <AboutUs />;
      case "contact":
        return <Contact />;
      default:
        return (
          <>
            <HeroSection />
            <Section2 />
            <Section3 />
            <Section4 />
            <Section5 />
            <Section6 />
            <Section7 />
            <Section8 />
          </>
        );
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-screen-2xl flex-col items-center bg-white">
      <div className="flex w-full flex-col items-center">
        {renderPageContent()}
      </div>
    </main>
  );
}
