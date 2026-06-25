import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Evidence from "@/components/Evidence";
import Experience from "@/components/Experience";
import Research from "@/components/Research";
import Writing from "@/components/Writing";
import News from "@/components/News";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="cd-ambient" aria-hidden="true" />
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <About />
        <Projects />
        <Evidence />
        <Experience />
        <Research />
        <Writing />
        <News />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
