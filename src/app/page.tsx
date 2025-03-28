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

// Original sections - don't change anything about them
const SECTIONS: SectionData[] = [
  {
    id: "hero", // Add hero as first section
    title: "Interactive 3D Particle Experience",
    description:
      "Discover a new dimension of digital interaction with our cutting-edge 3D particle technology. Immerse yourself in a world where data comes alive.",
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
    particleColor: "#6e56cf",
    showTextSection: true,
  },
  {
    id: "section-1",
    title: "Lorem Ipsum Dolor Sit",
    description:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.",
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
    particleColor: "#004a80",
    showTextSection: true,
  },
  {
    id: "section-2",
    title: "Consectetur Adipiscing Elit",
    description:
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora.",
    modelPath: "/models/model2.glb",
    fullWidthModel: false,
    scale: 0.00125,
    rotationSpeed: { x: 0, y: 0, z: 0 },
    initialRotation: { x: 0, y: 0, z: 2.0 },
    particleColor: "#23a094", // Teal
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
    title: "Sed Do Eiusmod Tempor",
    description:
      "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?",
    modelPath: "/models/brain/model3.gltf",
    fullWidthModel: false,
    scale: 1.25,
    rotationSpeed: { x: 0, y: 0.0008, z: 0 },
    initialRotation: { x: 0, y: 2, z: 0 },
    particleSize: 0.075,
    // particleColor: "#dc3a84", // Rose pink
    particleColor: "#6e56cf", // Lavender purple
    particleDensity: 2.75,
    useShaderAnimation: true,
    animationIntensity: 0,
    animationSpeed: 0.0,
    glowIntensity: 2.5,
    showTextSection: true,
  },
  {
    id: "section-4",
    title: "Amet Consectetur Ipsum",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
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
    particleColor: "#008080",
    showTextSection: true,
  },
];

// Simple navbar component
const Navbar = ({ isScrolled }: { isScrolled: boolean }) => (
  <header
    className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? "bg-black/80 backdrop-blur-lg" : "bg-transparent"
    }`}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6e56cf] to-[#a78bfa] flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-[#05010d] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#6e56cf] to-[#a78bfa] opacity-70"></div>
          </div>
        </div>
        <span className="ml-3 text-xl font-bold text-white">PARTICLE</span>
      </div>

      {/* Navigation links */}
      <div className="hidden md:flex space-x-6">
        {SECTIONS.slice(1).map((section, idx) => (
          <a
            key={idx}
            href={`#${section.id}`}
            className="text-white/80 hover:text-white transition-colors"
          >
            {section.title.split(" ")[0]}
          </a>
        ))}
        <a
          href="#hero"
          className="px-4 py-1 bg-gradient-to-r from-[#6e56cf] to-[#a78bfa] rounded-full text-white font-medium"
        >
          Get Started
        </a>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button className="text-white">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
);

export default function Home() {
  // Reference to the container for the global particle system
  const particleContainerRef = useRef<HTMLDivElement>(null);

  // Track active section and scroll progress
  const [activeSection, setActiveSection] = useState(0);
  const [nextSectionIndex, setNextSectionIndex] = useState(1);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  // Track loading progress
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(0);

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
      setIsScrolled(window.scrollY > 50);

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

    // Simulate model loading with a timeout for demo purposes
    // In a real scenario, you would track actual 3D model loading
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      // Enable scrolling after loading
      document.body.style.overflow = "auto";
    }, 3500);

    // Update loading progress periodically
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    // Disable scrolling during loading
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.scrollBehavior = "";
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkIfMobile);
      clearTimeout(loadingTimer);
      clearInterval(progressInterval);
    };
  }, []);

  // Handle model load events
  const handleModelLoaded = () => {
    setModelsLoaded((prev) => {
      const newCount = prev + 1;
      // If all models are loaded, we can finish loading
      if (newCount >= SECTIONS.length) {
        setIsLoading(false);
        document.body.style.overflow = "auto";
      }
      return newCount;
    });
  };

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
      ? 30
      : -30; // Right for even, left for odd

    // For next section: position based on fullWidthModel and index
    const nextPosition = nextSection.fullWidthModel
      ? 0 // Centered for full width
      : nextSectionIndex % 2 === 0
      ? 30
      : -30; // Right for even, left for odd

    // Interpolate between positions based on scroll progress
    const translateX =
      currentPosition + (nextPosition - currentPosition) * sectionProgress;

    // Calculate scale based on section properties, with smaller scale for mobile
    const mobileFactor = isMobile ? 0.7 : 1.0; // Reduce size by 30% on mobile
    const currentScale =
      (currentSection.fullWidthModel ? 1.1 : 0.9) * mobileFactor;
    const nextScale = (nextSection.fullWidthModel ? 1.1 : 0.9) * mobileFactor;
    const scale = currentScale + (nextScale - currentScale) * sectionProgress;

    return {
      transform: `translateX(${translateX}%) scale(${scale})`,
      width: "100%",
      left: "0",
    };
  };

  // Get container style
  const particleContainerStyle = getParticlePosition();

  // Get color scheme for loader based on active section
  const getColorScheme = (index: number) => {
    const schemes = [
      {
        main: "#6e56cf", // Lavender purple
        accent: "#a78bfa",
      },
      {
        main: "#23a094", // Teal
        accent: "#5eead4",
      },
      {
        main: "#dc3a84", // Rose pink
        accent: "#fb7185",
      },
    ];

    return schemes[index % schemes.length];
  };

  const currentColorScheme = getColorScheme(activeSection);

  return (
    <main
      className={`relative bg-gradient-to-b from-[#090419] to-[#05010d] text-white ${montserrat.variable} ${inter.variable} font-sans`}
    >
      {/* Navbar */}
      <Navbar isScrolled={isScrolled} />

      {/* Fullscreen Loader */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#05010d] flex flex-col items-center justify-center">
          <div className="w-full max-w-xs flex flex-col items-center">
            {/* Pulsating logo or brand icon */}
            <motion.div
              initial={{ opacity: 0.6, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6e56cf] to-[#a78bfa] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#05010d] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6e56cf] to-[#a78bfa] opacity-70"></div>
                </div>
              </div>
            </motion.div>

            {/* Loading text */}
            <h2 className="text-2xl font-montserrat font-medium mb-6 text-white/90">
              Loading Experience
            </h2>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6e56cf] to-[#a78bfa]"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Loading status */}
            <p className="text-white/60 text-sm">
              Loading 3D models... ({Math.min(loadingProgress, 100)}%)
            </p>
          </div>
        </div>
      )}

      {/* Fixed background particle system that morphs based on scroll */}
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

      {/* Content sections with solid backgrounds instead of glass/blur */}
      {SECTIONS.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="min-h-screen w-full relative flex items-center overflow-hidden bg-transparent"
        >
          {/* Solid section background */}
          <div className="absolute inset-0 w-full h-full z-5">
            <div className="absolute inset-0 bg-black/40"></div>
            {/* Add subtle radial gradient for depth */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40 opacity-80"></div>
          </div>

          {/* Hero section treatment */}
          {index === 0 ? (
            <div className="relative w-full z-20 px-6 py-16 pt-32 md:pt-40">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  className="w-full max-w-3xl space-y-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                >
                  <motion.div
                    className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white/90 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    ✨ Experience the Future
                  </motion.div>

                  <motion.h1
                    className="text-5xl md:text-7xl font-bold font-montserrat tracking-tight leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    style={{
                      background: "linear-gradient(to right, #ffffff, #a78bfa)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {section.title}
                  </motion.h1>

                  <motion.p
                    className="text-xl md:text-2xl leading-relaxed font-inter text-gray-300"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    {section.description}
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-4 pt-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <a
                      href="#section-1"
                      className="px-8 py-4 rounded-full bg-gradient-to-r from-[#6e56cf] to-[#a78bfa] text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-1"
                    >
                      Get Started
                    </a>
                    <a
                      href="#section-3"
                      className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
                    >
                      Learn More
                    </a>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          ) : (
            /* Regular sections with original behavior */
            section.showTextSection && (
              <div className="relative w-full z-20 px-6 py-16 md:py-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
                  {/* Text content with solid background instead of glass effect */}
                  <motion.div
                    className={`w-full max-w-xl space-y-8 p-8 rounded-3xl
                      ${
                        isMobile
                          ? "bg-black/50 border border-white/10"
                          : "bg-black/60 border border-white/10 shadow-xl"
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
                    {/* Subtle section indicator */}
                    <div className="mb-2 opacity-60">
                      <div className="h-px w-16 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                    </div>

                    {/* Title with custom gradient based on section */}
                    <h2
                      className="text-4xl md:text-5xl font-bold font-montserrat tracking-tight"
                      style={{
                        background:
                          index === 1
                            ? "linear-gradient(to right, #a78bfa, #6e56cf)"
                            : index === 2
                            ? "linear-gradient(to right, #5eead4, #23a094)"
                            : "linear-gradient(to right, #fb7185, #dc3a84)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {section.title}
                    </h2>

                    {/* Description with slightly increased spacing */}
                    <p className="text-lg leading-relaxed font-inter text-gray-300 tracking-wide">
                      {section.description}
                    </p>

                    {/* Add simple CTA button */}
                    <div className="pt-2">
                      <a
                        href={`#${
                          SECTIONS[Math.min(index + 1, SECTIONS.length - 1)].id
                        }`}
                        className="inline-block px-6 py-3 rounded-full text-white text-sm font-medium transition-all hover:-translate-y-1"
                        style={{
                          background:
                            index === 1
                              ? "linear-gradient(to right, #a78bfa, #6e56cf)"
                              : index === 2
                              ? "linear-gradient(to right, #5eead4, #23a094)"
                              : "linear-gradient(to right, #fb7185, #dc3a84)",
                        }}
                      >
                        {index === SECTIONS.length - 1
                          ? "Get Started"
                          : "Learn More"}
                      </a>
                    </div>

                    {/* Subtle separator line */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    {/* Section indicator in minimal form */}
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            index === 1
                              ? "#6e56cf"
                              : index === 2
                              ? "#23a094"
                              : "#dc3a84",
                        }}
                      ></div>
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-light">
                        {`${index} / ${SECTIONS.length - 1}`}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            )
          )}
        </section>
      ))}
    </main>
  );
}
