import type { Metadata } from "next";
import Header from "@/components/Header";
import HomePortfolio from "@/components/HomePortfolio";
import Footer from "@/components/Footer";
import {
  ProjectsSchema,
  ResearchSchema,
  WebPageSchema,
} from "@/components/JsonLd";
import { ogImage } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "https://ahmed-3m.github.io/" },
  openGraph: {
    title: "Ahmed Mohammed | AI/ML Engineer",
    description:
      "AI/ML Engineer in Linz, Austria — computer vision, industrial ML, diffusion models, LLM products (Sihem), and deterministic agent tooling (mergeproof).",
    type: "website",
    url: "https://ahmed-3m.github.io/",
    images: ogImage("Ahmed Mohammed - AI/ML Engineer"),
  },
};

export default function Home() {
  return (
    <>
      <ProjectsSchema />
      <ResearchSchema />
      <WebPageSchema />
      <Header />
      <HomePortfolio />
      <Footer />
    </>
  );
}
