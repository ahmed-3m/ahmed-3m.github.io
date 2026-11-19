import type { Metadata } from "next";
import Header from "@/components/Header";
import PortfolioAbstract from "@/components/PortfolioAbstract";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import {
  SocialProfileSchema,
  ProjectsSchema,
  ResearchSchema,
  WebPageSchema,
} from "@/components/JsonLd";

export const metadata: Metadata = {
  alternates: { canonical: 'https://ahmed-3m.github.io/' },
};

export default function Home() {
  return (
    <>
      <SocialProfileSchema />
      <ProjectsSchema />
      <ResearchSchema />
      <WebPageSchema />
      <Header />
      <main id="main" tabIndex={-1} className="portfolio-page">
        <PortfolioAbstract />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
