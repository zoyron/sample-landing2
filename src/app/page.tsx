"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SectionData } from "@/types";
import ParticleModelViewer from "@/components/model-viewer";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

// Font setup - editorial serif + clean geometric sans
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

// Sections with amber-gold particle tones and editorial chapter names
const SECTIONS: SectionData[] = [
  {
    id: "hero",
    title: "Where Form Meets Dimension",
    description:
      "An exploration of digital matter — particles that breathe, morph, and respond. Witness geometry in motion.",
    modelPath: "/models/model0.glb",
    fullWidthModel: false,
    scale: 0.1,
    rotationSpeed: { x: 0, y: 1, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 },
    particleSize: 0.07,
    particleDensity: 2.05,
    useShaderAnimation: true,
    animationIntensity: 0.5,
    animationSpeed: 0.5,
    glowIntensity: 1.5,
    particleColor: "#c8956c",
    showTextSection: true,
  },
  {
    id: "section-1",
    title: "The Architecture of Light",
    description:
      "Every point of light carries intention. We sculpt with photons, building structures that exist between the tangible and the imagined.",
    modelPath: "/models/model1.glb",
    fullWidthModel: false,
    scale: 3.0,
    rotationSpeed: { x: 0, y: 2, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 },
    particleSize: 0.07,
    particleDensity: 2.05,
    useShaderAnimation: true,
    animationIntensity: 0,
    animationSpeed: 0,
    glowIntensity: 0,
    particleColor: "#b8845e",
    showTextSection: true,
  },
  {
    id: "section-2",
    title: "Matter in Suspension",
    description:
      "Between stillness and motion lies a threshold — a state where particles hold their breath before transformation begins.",
    modelPath: "/models/model2.glb",
    fullWidthModel: false,
    scale: 0.00125,
    rotationSpeed: { x: 0, y: 0, z: 0 },
    initialRotation: { x: 0, y: 0, z: 2.0 },
    particleColor: "#d4a57c",
    particleSize: 0.05,
    particleDensity: 2.5,
    useShaderAnimation: true,
    animationIntensity: 0,
    animationSpeed: 0,
    glowIntensity: 1.0,
    showTextSection: true,
  },
  {
    id: "section-3",
    title: "Neural Cartography",
    description:
      "Mapping the unseen — tracing pathways through complexity, revealing the hidden geometry that connects all things.",
    modelPath: "/models/brain/model3.gltf",
    fullWidthModel: false,
    scale: 1.25,
    rotationSpeed: { x: 0, y: 0.0008, z: 0 },
    initialRotation: { x: 0, y: 2, z: 0 },
    particleSize: 0.075,
    particleColor: "#c8956c",
    particleDensity: 2.75,
    useShaderAnimation: true,
    animationIntensity: 0,
    animationSpeed: 0.0,
    glowIntensity: 2.5,
    showTextSection: true,
  },
  {
    id: "section-4",
    title: "The Infinite Detail",
    description:
      "Resolution without limit. Every zoom reveals another layer, another world nested within the structure of the last.",
    modelPath: "/models/model3.glb",
    fullWidthModel: false,
    scale: 0.0225,
    rotationSpeed: { x: 0, y: 2, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 },
    particleSize: 0.07,
    particleDensity: 0.5,
    useShaderAnimation: true,
    animationIntensity: 0.05,
    animationSpeed: 0.2,
    glowIntensity: 1.3,
    particleColor: "#b08050",
    showTextSection: true,
  },
];

// Refined editorial navbar
const Navbar = ({ isScrolled }: { isScrolled: boolean }) => (
  <header
    className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? "bg-obsidian/80 backdrop-blur-md border-b border-cream/5" 
        : "bg-transparent"
    }`}
  >
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
      {/* Brand mark with refined typography */}
      <a 
        href="#hero" 
        className="font-serif text-xl tracking-[0.15em] uppercase text-cream hover:text-amber-gold transition-colors duration-300"
      >
        Particle
      </a>

      {/* Navigation links with improved spacing */}
      <nav className="hidden md:flex items-center space-x-10">
        {SECTIONS.slice(1).map((section, idx) => (
          <a
            key={idx}
            href={`#${section.id}`}
            className="nav-link text-sm"
          >
            {section.title.split(" ").slice(0, 2).join(" ")}
          </a>
        ))}
      </nav>

      {/* Mobile menu button with refined styling */}
      <div className="md:hidden">
        <button className="text-cream-muted hover:text-cream transition-colors p-2">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
);

export default function Home() {
  const particleContainerRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState(0);
  const [nextSectionIndex, setNextSectionIndex] = useState(1);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(0);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
      setScrollProgress(progress);

      const totalSections = SECTIONS.length;
      const sectionHeight = 1 / (totalSections - 1);
      const sectionPosition = progress / sectionHeight;

      const current = Math.min(Math.floor(sectionPosition), totalSections - 1);
      const next = Math.min(current + 1, totalSections - 1);
      const prog = sectionPosition - current;

      setActiveSection(current);
      setNextSectionIndex(next);
      setSectionProgress(prog);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkIfMobile);

    handleScroll();

    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "auto";
    }, 3500);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.scrollBehavior = "";
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkIfMobile);
      clearTimeout(loadingTimer);
      clearInterval(progressInterval);
    };
  }, []);

  const handleModelLoaded = () => {
    setModelsLoaded((prev) => {
      const newCount = prev + 1;
      if (newCount >= SECTIONS.length) {
        setIsLoading(false);
        document.body.style.overflow = "auto";
      }
      return newCount;
    });
  };

  // Particles pinned to right ~55% — no zig-zag
  const getParticlePosition = () => {
    if (isMobile) {
      return {
        transform: "translateX(0)",
        width: "100%",
        left: "0",
      };
    }

    return {
      transform: "translateX(22%)",
      width: "100%",
      left: "0",
    };
  };

  const particleContainerStyle = getParticlePosition();

  return (
    <main
      className={`relative bg-obsidian text-cream ${cormorant.variable} ${dmSans.variable} font-sans`}
    >
      {/* Navbar */}
      <Navbar isScrolled={isScrolled} />

      {/* Refined typographic loading screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-obsidian flex flex-col items-center justify-center">
          <div className="w-full max-w-xs flex flex-col items-center">
            <motion.h1
              className="font-serif text-4xl tracking-[0.12em] uppercase text-cream mb-16 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
              Particle
            </motion.h1>

            {/* Elegant progress bar with gradient */}
            <div className="w-full h-[2px] bg-cream/10 mb-6 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-gold to-amber-gold-light"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <motion.p 
              className="text-cream-muted/60 text-xs tracking-[0.25em] uppercase font-sans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {Math.min(loadingProgress, 100)}%
            </motion.p>
          </div>
        </div>
      )}

      {/* Enhanced scroll progress indicator */}
      {!isLoading && (
        <div className="fixed left-6 lg:left-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3">
          {/* Current chapter with refined typography */}
          <motion.span 
            className="font-serif text-lg font-medium text-amber-gold tabular-nums"
            key={activeSection}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {String(activeSection + 1).padStart(2, "0")}
          </motion.span>

          {/* Elegant vertical progress track */}
          <div className="w-[2px] h-40 bg-cream/5 relative overflow-hidden rounded-full">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-amber-gold to-amber-gold-light origin-top"
              style={{ height: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            />
          </div>

          {/* Total sections */}
          <span className="text-xs text-cream-muted/60 tracking-[0.15em] tabular-nums">
            {String(SECTIONS.length).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Fixed background particle system */}
      <div
        className="fixed inset-0 w-full h-full z-10 pointer-events-none transition-transform duration-500 ease-out"
        style={particleContainerStyle}
        ref={particleContainerRef}
      >
        <ParticleModelViewer
          sections={SECTIONS}
          className="w-full h-full"
          onModelLoaded={handleModelLoaded}
        />
      </div>

      {/* Content sections */}
      {SECTIONS.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="min-h-screen w-full relative flex items-center overflow-hidden"
        >
          {/* Hero section */}
          {index === 0 ? (
            <div className="relative w-full z-20 px-6 lg:px-12 py-16 pt-32 md:pt-40 min-h-screen flex items-center">
              <div className="max-w-7xl mx-auto w-full">
                <motion.div
                  className="w-full max-w-2xl space-y-10"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                >
                  {/* Refined chapter label */}
                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="w-12 h-px bg-amber-gold/50" />
                    <p className="text-amber-gold text-xs tracking-[0.25em] uppercase font-sans font-medium">
                      Chapter 01
                    </p>
                  </motion.div>

                  {/* Editorial headline with improved typography */}
                  <motion.h1
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-medium leading-[0.95] text-cream tracking-tight"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.4 }}
                  >
                    {section.title}
                  </motion.h1>

                  <motion.p
                    className="text-lg md:text-xl leading-relaxed text-cream-muted/80 max-w-xl font-sans font-normal"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
                  >
                    {section.description}
                  </motion.p>

                  {/* Enhanced CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="pt-4"
                  >
                    <a
                      href="#section-1"
                      className="cta-amber group"
                    >
                      <span>Begin the Journey</span>
                      <svg
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </a>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          ) : (
            /* Content sections — asymmetric layout with refined typography */
            section.showTextSection && (
              <div className="relative w-full z-20 px-6 lg:px-12 py-20 md:py-0 min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto w-full">
                  <motion.div
                    className="w-full max-w-xl space-y-8"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
                  >
                    {/* Artistic chapter number with gradient */}
                    <div className="relative">
                      <span 
                        className="block font-serif text-[10rem] md:text-[12rem] leading-none font-light select-none -mb-20 -ml-2"
                        style={{
                          background: 'linear-gradient(180deg, rgba(201, 168, 124, 0.08) 0%, rgba(201, 168, 124, 0.02) 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Editorial title with proper hierarchy */}
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.05] text-cream tracking-tight">
                      {section.title}
                    </h2>

                    {/* Animated accent line */}
                    <div className="accent-line" />

                    {/* Refined description with optimal line length */}
                    <p className="text-lg md:text-xl leading-relaxed text-cream-muted/80 font-sans">
                      {section.description}
                    </p>

                    {/* Elegant section indicator */}
                    <div className="flex items-center gap-4 pt-6">
                      <div className="w-8 h-px bg-amber-gold/40" />
                      <span className="text-xs uppercase tracking-[0.2em] text-cream-muted/60 font-sans">
                        {`${String(index).padStart(2, "0")} / ${String(SECTIONS.length - 1).padStart(2, "0")}`}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            )
          )}

          {/* Mobile: subtle dark overlay for text readability */}
          {isMobile && (
            <div className="absolute inset-0 bg-obsidian/40 z-[15]" />
          )}
        </section>
      ))}
    </main>
  );
}
