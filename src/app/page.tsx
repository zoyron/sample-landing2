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

const SECTIONS: SectionData[] = [
  {
    id: "section-1",
    title: "Lorem Ipsum Dolor Sit",
    description:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.",
    modelPath: "/models/model1.glb",
    fullWidthModel: false,
    scale: 2.5,
    rotationSpeed: { x: 0, y: 2, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 },
    particleSize: 0.07,
    particleDensity: 0.5,
    useShaderAnimation: true,
    animationIntensity: 0.25,
    animationSpeed: 0.05,
    glowIntensity: 1.3,
    particleColor: "#6e56cf", // Lavender purple
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
    particleDensity: 1.75,
    useShaderAnimation: true,
    animationIntensity: 0.125,
    animationSpeed: 0.15,
    glowIntensity: 1.0,
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
    particleColor: "#dc3a84", // Rose pink
    particleDensity: 2.25,
    useShaderAnimation: true,
    animationIntensity: 0,
    animationSpeed: 0.0,
    glowIntensity: 2.5,
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

  // Navigation dots component
  const NavigationDots = () => (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 hidden md:flex flex-col gap-4">
      {SECTIONS.map((section, idx) => (
        <a
          key={idx}
          href={`#${section.id}`}
          className={`w-3 h-3 rounded-full transition-all duration-300 ease-in-out ${
            activeSection === idx
              ? "bg-white scale-125"
              : "bg-white/30 hover:bg-white/70"
          }`}
          aria-label={`Navigate to ${section.title}`}
        />
      ))}
    </div>
  );

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

      {/* Navigation dots */}
      <NavigationDots />

      {/* Content sections with lighter overlays and higher z-indices */}
      {SECTIONS.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="min-h-screen w-full relative flex items-center overflow-hidden bg-transparent"
        >
          {/* Semi-transparent section background with enhanced lighting effect */}
          <div className="absolute inset-0 w-full h-full z-5">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
            {/* Add subtle radial gradient for depth */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40 opacity-80"></div>
          </div>

          {/* Content positioned over the morphing background with higher z-index */}
          <div className="relative w-full z-20 px-6 py-16 md:py-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
              {/* Text content positioned based on section config */}
              <motion.div
                className={`w-full max-w-xl space-y-8 p-8 rounded-3xl
                  ${
                    isMobile
                      ? "bg-gradient-to-br from-black/20 to-black/5 backdrop-blur-sm border border-white/10"
                      : "bg-gradient-to-br from-black/30 via-black/20 to-transparent backdrop-blur-md border border-white/10 shadow-xl"
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
                      index === 0
                        ? "linear-gradient(to right, #a78bfa, #6e56cf)"
                        : index === 1
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

                {/* Subtle separator line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                {/* Section indicator in minimal form */}
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        index === 0
                          ? "#6e56cf"
                          : index === 1
                          ? "#23a094"
                          : "#dc3a84",
                    }}
                  ></div>
                  <span className="text-xs uppercase tracking-widest text-gray-400 font-light">
                    {`${index + 1} / ${SECTIONS.length}`}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
