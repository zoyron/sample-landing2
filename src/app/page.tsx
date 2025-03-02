"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SectionData } from "@/types";
import ParticleModelViewer from "@/components/model-viewer";

// Enhanced data for the sections with new animation properties
const SECTIONS: SectionData[] = [
  {
    id: "section-1",
    title: "CODE BECOMES CONSCIOUS",
    description:
      "Launch tokenized AI agents in three clicks. Fuses natural evolution and state-of-the-art systems for AI that feels alive.",
    modelPath: "/models/model1.glb",
    fullWidthModel: false,
    scale: 2.5,
    rotationSpeed: { x: 0, y: 0.002, z: 0 },
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
    title: "FUTURE-PROOF SOLUTIONS",
    description:
      "Stay ahead of the curve with technology that evolves with your needs. Our continuous updates and scalable architecture ensure your business is always equipped with the latest innovations.",
    modelPath: "/models/blob/model3.gltf",
    fullWidthModel: false,
    scale: 0.7,
    rotationSpeed: { x: 0, y: 0.0008, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 },
    particleSize: 0.035,
    particleColor: "#800080",
    particleDensity: 0.25,
    useShaderAnimation: true,
    animationIntensity: 0,
    animationSpeed: 0.0,
    glowIntensity: 2.5,
  },
  {
    id: "section-3",
    title: "SEAMLESS INTEGRATION",
    description:
      "Effortlessly connect our platform with your existing tools and workflows. Our API-first approach ensures compatibility with your tech stack, minimizing disruption while maximizing value.",
    modelPath: "/models/model5.glb",
    fullWidthModel: false,
    scale: 0.25,
    rotationSpeed: { x: 0, y: 0, z: 0 },
    initialRotation: { x: 0.75, y: 0, z: 0 },
    particleSize: 0.05,
    particleDensity: 0.25,
    useShaderAnimation: true,
    animationIntensity: 0.5,
    animationSpeed: 0.125,
    glowIntensity: 1.0,
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

    // Calculate scale based on section properties
    const currentScale = currentSection.fullWidthModel ? 1.1 : 0.85;
    const nextScale = nextSection.fullWidthModel ? 1.1 : 0.85;
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
    <main className="relative bg-black/90 text-white">
      {/* Fixed background particle system that morphs based on scroll */}
      <div
        className="fixed inset-0 w-full h-full z-10 pointer-events-none transition-transform duration-300 ease-out"
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
          {/* Semi-transparent section background */}
          <div className="absolute inset-0 w-full h-full z-5">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
          </div>

          {/* Content positioned over the morphing background with higher z-index */}
          <div className="relative w-full z-20 px-4 py-16 md:py-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
              {/* Text content positioned based on section config */}
              <motion.div
                className={`w-full md:w-1/2 space-y-6 p-6 rounded-lg
                  bg-black/20 backdrop-blur-[2px]
                  ${
                    section.fullWidthModel
                      ? "md:mx-auto"
                      : index % 2 !== 0
                      ? "md:ml-auto"
                      : "md:mr-auto"
                  }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
                  {section.title}
                </h2>
                <p className="text-lg text-gray-100 leading-relaxed">
                  {section.description}
                </p>
                <button className="bg-blue-600/80 hover:bg-blue-700/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm">
                  Learn More
                </button>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Footer with proper z-index */}
      <footer className="bg-black/90 text-white py-12 border-t border-gray-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
                Company
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
                Product
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>Features</li>
                <li>Pricing</li>
                <li>Testimonials</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
                Resources
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>Blog</li>
                <li>Documentation</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
                Legal
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Your Company. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
