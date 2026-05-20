import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Research from "@/components/Research";
import Writing from "@/components/Writing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="cd-ambient" aria-hidden="true" />
      <Header />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Research />
        <Writing />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
