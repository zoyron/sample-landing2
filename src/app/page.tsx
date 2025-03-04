"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SectionData } from "@/types";
import ParticleModelViewer from "@/components/model-viewer";
import { Montserrat, Inter } from "next/font/google";

// Font setup
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Enhanced data for the sections with new animation properties
const SECTIONS: SectionData[] = [
  {
    id: "section-1",
    title: "Laurem ipsum",
    description:
      "Launch tokenized AI agents in three clicks. Fuses natural evolution and state-of-the-art systems for AI that feels alive.",
    modelPath: "/models/model1.glb",
    fullWidthModel: false,
    scale: 2.0,
    rotationSpeed: { x: 0, y: 0.02, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 },
    particleSize: 0.07,
    particleDensity: 0.5,
    useShaderAnimation: true,
    animationIntensity: 0.025,
    animationSpeed: 0.4,
    glowIntensity: 1.3,
  },
  {
    id: "section-2",
    title: "SEAMLESS INTEGRATION",
    description:
      "Effortlessly connect our platform with your existing tools and workflows. Our API-first approach ensures compatibility with your tech stack, minimizing disruption while maximizing value.",
    modelPath: "/models/model2.glb",
    fullWidthModel: false,
    scale: 0.00125,
    rotationSpeed: { x: 0, y: 1.0, z: 0 },
    initialRotation: { x: 0, y: 0, z: 2.0 },
    particleColor: "#880088",
    particleSize: 0.05,
    particleDensity: 0.75,
    useShaderAnimation: true,
    animationIntensity: 0.25,
    animationSpeed: 0.5,
    glowIntensity: 1.0,
  },
  {
    id: "section-3",
    title: "FUTURE-PROOF SOLUTIONS",
    description:
      "Stay ahead of the curve with technology that evolves with your needs. Our continuous updates and scalable architecture ensure your business is always equipped with the latest innovations.",
    modelPath: "/models/brain/model3.gltf",
    fullWidthModel: false,
    scale: 1.25,
    rotationSpeed: { x: 0, y: 0.0008, z: 0 },
    initialRotation: { x: 0, y: 2, z: 0 },
    particleSize: 0.075,
    particleColor: "#008380",
    particleDensity: 2.25,
    useShaderAnimation: true,
    animationIntensity: 0,
    animationSpeed: 0.0,
    glowIntensity: 2.5,
  },
];

export default function Home() {
  // Reference to the container for the global particle system
  const particleContainerRef = useRef<HTMLDivElement>(null);

  // Track active section and scroll progress
  const [activeSection, setActiveSection] = useState(0);
  const [nextSectionIndex, setNextSectionIndex] = useState(1);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Add smooth scrolling and initialization
    document.documentElement.style.scrollBehavior = "smooth";

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();

    // Track scroll position
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const scrollProgress = Math.max(0, Math.min(1, scrollTop / scrollHeight));

      // Calculate section indices and progress
      const totalSections = SECTIONS.length;
      const sectionHeight = 1 / (totalSections - 1);
      const sectionPosition = scrollProgress / sectionHeight;

      const current = Math.min(Math.floor(sectionPosition), totalSections - 1);
      const next = Math.min(current + 1, totalSections - 1);
      const progress = sectionPosition - current;

      setActiveSection(current);
      setNextSectionIndex(next);
      setSectionProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkIfMobile);

    // Set initial values
    handleScroll();

    return () => {
      document.documentElement.style.scrollBehavior = "";
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Calculate particle system position based on active section
  const getParticlePosition = () => {
    // On mobile, keep particles centered
    if (isMobile) {
      return {
        transform: `translateX(0)`,
        width: "100%",
        left: "0",
      };
    }

    const currentSection = SECTIONS[activeSection];
    const nextSection = SECTIONS[nextSectionIndex];

    // Calculate positions based on section properties

    // For current section: position based on fullWidthModel and index
    const currentPosition = currentSection.fullWidthModel
      ? 0 // Centered for full width
      : activeSection % 2 === 0
      ? 25
      : -25; // Right for even, left for odd

    // For next section: position based on fullWidthModel and index
    const nextPosition = nextSection.fullWidthModel
      ? 0 // Centered for full width
      : nextSectionIndex % 2 === 0
      ? 25
      : -25; // Right for even, left for odd

    // Interpolate between positions based on scroll progress
    const translateX =
      currentPosition + (nextPosition - currentPosition) * sectionProgress;

    // Calculate scale based on section properties, with smaller scale for mobile
    const mobileFactor = isMobile ? 0.7 : 1.0; // Reduce size by 30% on mobile
    const currentScale =
      (currentSection.fullWidthModel ? 1.1 : 0.85) * mobileFactor;
    const nextScale = (nextSection.fullWidthModel ? 1.1 : 0.85) * mobileFactor;
    const scale = currentScale + (nextScale - currentScale) * sectionProgress;

    return {
      transform: `translateX(${translateX}%) scale(${scale})`,
      width: "100%",
      left: "0",
    };
  };

  // Get container style
  const particleContainerStyle = getParticlePosition();

  return (
    <main
      className={`relative bg-gradient-to-b from-[#030014] to-[#010108] text-white ${montserrat.variable} ${inter.variable} font-sans`}
    >
      {/* Fixed background particle system that morphs based on scroll */}
      <div
        className="fixed inset-0 w-full h-full z-10 pointer-events-none transition-transform duration-500 ease-out"
        style={particleContainerStyle}
        ref={particleContainerRef}
      >
        <ParticleModelViewer sections={SECTIONS} className="w-full h-full" />
      </div>

      {/* Content sections with lighter overlays and higher z-indices */}
      {SECTIONS.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="min-h-screen w-full relative flex items-center overflow-hidden bg-transparent"
        >
          {/* Semi-transparent section background with enhanced lighting effect */}
          <div className="absolute inset-0 w-full h-full z-5">
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"></div>
            {/* Add subtle radial gradient for depth */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40 opacity-80"></div>
          </div>

          {/* Content positioned over the morphing background with higher z-index */}
          <div className="relative w-full z-20 px-6 py-16 md:py-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
              {/* Text content positioned based on section config */}
              <motion.div
                className={`w-full md:w-1/2 space-y-8 p-8 rounded-2xl
                  ${
                    isMobile
                      ? "bg-gradient-to-br from-black/30 to-black/5 backdrop-blur-sm border border-white/5"
                      : "bg-gradient-to-br from-black/40 to-black/10 backdrop-blur-md border border-white/5 shadow-xl"
                  }
                  ${
                    section.fullWidthModel
                      ? "md:mx-auto"
                      : index % 2 !== 0
                      ? "md:ml-auto"
                      : "md:mr-auto"
                  }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              >
                <div className="inline-block mb-2 px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                  <p className="text-xs tracking-widest text-cyan-300 font-medium uppercase">
                    {`Section ${index + 1}`}
                  </p>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold font-montserrat tracking-tight bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300 text-transparent bg-clip-text">
                  {section.title}
                </h2>
                <p className="text-lg text-gray-200 leading-relaxed font-inter">
                  {section.description}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-sky-500/20">
                    Learn More
                  </button>
                  <button className="bg-transparent text-white border border-white/20 hover:border-white/40 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:bg-white/5">
                    View Demo
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
