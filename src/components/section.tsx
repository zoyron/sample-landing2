"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import ParticleModelViewer from "./model-viewer";
import { cn } from "@/lib/utils";
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

interface SectionProps {
  title: string;
  description: string;
  modelPath: string;
  reverse?: boolean;
  index: number;
  fullWidthModel?: boolean;
  scale?: number;
  rotationSpeed?: {
    x?: number;
    y?: number;
    z?: number;
  };
  initialRotation?: {
    x?: number;
    y?: number;
    z?: number;
  };
  // Particle-specific props
  particleSize?: number;
  particleColor?: string;
  particleDensity?: number;
  useShaderAnimation?: boolean;
  // Animation enhancement props
  animationIntensity?: number;
  animationSpeed?: number;
  glowIntensity?: number;
  // New props for design enhancement
  accentColor?: string;
  secondaryColor?: string;
  ctaText?: string;
  secondaryCtaText?: string;
}

export default function Section({
  title,
  description,
  modelPath,
  reverse = false,
  index,
  fullWidthModel = false,
  scale = 1,
  rotationSpeed = { x: 0, y: 0.002, z: 0 },
  initialRotation = { x: 0, y: 0, z: 0 },
  // Particle props
  particleSize = 0.02,
  particleColor,
  particleDensity = 0.5,
  useShaderAnimation = true,
  // Enhanced animation props with sensible defaults
  animationIntensity = 0.02,
  animationSpeed = 0.5,
  glowIntensity = 1.2,
  // Design enhancement props
  accentColor = "sky", // Default accent color
  secondaryColor = "emerald", // Default secondary color
  ctaText = "Learn More",
  secondaryCtaText = "View Demo",
}: SectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Adjust animation parameters based on section index for variety
  const getAnimationParams = (index: number) => {
    const params = {
      animationIntensity: animationIntensity,
      animationSpeed: animationSpeed,
      glowIntensity: glowIntensity,
    };

    // Each section gets slightly different animation parameters
    switch (index % 3) {
      case 0: // First type of section
        return {
          ...params,
          animationIntensity: animationIntensity * 1.2,
          animationSpeed: animationSpeed * 0.8,
          glowIntensity: glowIntensity * 1.1,
        };
      case 1: // Second type of section
        return {
          ...params,
          animationIntensity: animationIntensity * 0.8,
          animationSpeed: animationSpeed * 1.2,
          glowIntensity: glowIntensity * 0.9,
        };
      case 2: // Third type of section
        return {
          ...params,
          animationIntensity: animationIntensity,
          animationSpeed: animationSpeed * 1.5,
          glowIntensity: glowIntensity * 1.3,
        };
      default:
        return params;
    }
  };

  // Get animation parameters for this section
  const animationParams = getAnimationParams(index);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1], // Custom easing
        delay: 0.2,
      },
    },
  };

  // Staggered child animation variants
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.1 + custom * 0.1,
      },
    }),
  };

  // Configuration constant to control whether to use original colors
  const SECTIONS_USE_ORIGINAL_COLORS = true;

  // Generate a unique color based on section index if color not specified (for backwards compatibility)
  const particleColorToUse =
    particleColor ||
    (SECTIONS_USE_ORIGINAL_COLORS ? undefined : getColorFromIndex(index));

  // Get colors for gradients based on section props or index
  const getGradientColors = () => {
    // Predefined color pairs for variety
    const colorPairs = [
      { from: "violet", via: "sky", to: "emerald" },
      { from: "rose", via: "fuchsia", to: "indigo" },
      { from: "amber", via: "orange", to: "rose" },
      { from: "emerald", via: "teal", to: "blue" },
      { from: "blue", via: "indigo", to: "purple" },
    ];

    return colorPairs[index % colorPairs.length];
  };

  const gradientColors = getGradientColors();

  return (
    <section
      ref={sectionRef}
      className={`min-h-screen w-full relative flex items-center overflow-hidden bg-gradient-to-b from-[#030014] to-[#010108] ${montserrat.variable} ${inter.variable}`}
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/90 to-black/60 z-0"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-10 z-0"></div>

        {/* Glow effect in corner opposite to content */}
        <div
          className={`absolute w-96 h-96 rounded-full blur-3xl opacity-10 z-0
          ${!reverse ? "top-0 left-0" : "bottom-0 right-0"}
          bg-gradient-to-r from-${gradientColors.from}-500/20 to-${
            gradientColors.to
          }-500/10`}
        ></div>
      </div>

      {/* Model container as background - with positioning logic for fullWidthModel */}
      <div
        className={cn(
          "absolute inset-0 w-full h-full z-1",
          // Only position to left/right if not fullWidthModel
          !isMobile && !fullWidthModel && "md:flex md:items-center",
          !isMobile &&
            !fullWidthModel &&
            (reverse ? "md:justify-start" : "md:justify-end")
        )}
      >
        <div
          className={cn(
            "w-full h-full",
            // Apply sizing based on mobile and fullWidthModel status
            isMobile
              ? "scale-75" // Make model 75% of original size on mobile
              : !fullWidthModel && "md:w-2/3 md:h-[600px]",
            !isMobile && !fullWidthModel && (reverse ? "md:ml-12" : "md:mr-12")
          )}
        >
          <ParticleModelViewer
            modelPath={modelPath}
            className="w-full h-full"
            scale={scale}
            rotationSpeed={rotationSpeed}
            initialRotation={initialRotation}
            particleSize={particleSize}
            particleColor={particleColorToUse}
            particleDensity={particleDensity}
            useShaderAnimation={useShaderAnimation}
            // Pass enhanced animation parameters
            animationIntensity={animationParams.animationIntensity}
            animationSpeed={animationParams.animationSpeed}
            glowIntensity={animationParams.glowIntensity}
            onModelLoaded={() => setIsModelLoaded(true)}
          />
        </div>
      </div>

      {/* Content positioned over the model with improved design */}
      <div className="relative w-full z-10 px-6 py-16 md:py-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          {/* Text content with enhanced design */}
          <motion.div
            className={cn(
              "w-full md:w-1/2 space-y-8 p-8 rounded-2xl",
              isMobile
                ? "bg-gradient-to-br from-black/30 to-black/5 backdrop-blur-sm border border-white/5"
                : "bg-gradient-to-br from-black/40 to-black/10 backdrop-blur-md border border-white/5 shadow-2xl",
              // If fullWidthModel, center the text
              fullWidthModel && "md:mx-auto",
              // Otherwise, position the text to the opposite side of the model
              !fullWidthModel && !isMobile && reverse
                ? "md:ml-auto"
                : "md:mr-auto"
            )}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={textVariants}
          >
            {/* Section indicator label */}
            <motion.div
              className="inline-block mb-2 px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full border border-white/10"
              custom={0}
              variants={childVariants}
            >
              <p
                className={`text-xs tracking-widest text-${gradientColors.from}-300 font-medium uppercase`}
              >
                {`Section ${index + 1}`}
              </p>
            </motion.div>

            {/* Title with gradient */}
            <motion.h2
              className={`text-4xl md:text-5xl font-bold font-montserrat tracking-tight 
                bg-gradient-to-r from-${gradientColors.from}-300 via-${gradientColors.via}-300 to-${gradientColors.to}-300 
                text-transparent bg-clip-text`}
              custom={1}
              variants={childVariants}
            >
              {title}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-lg text-gray-200 leading-relaxed font-inter"
              custom={2}
              variants={childVariants}
            >
              {description}
            </motion.p>

            {/* Call-to-action buttons */}
            <motion.div
              className="flex flex-wrap gap-4 pt-2"
              custom={3}
              variants={childVariants}
            >
              <button
                className={`bg-gradient-to-r from-${gradientColors.from}-500 to-${gradientColors.to}-500 
                  text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 
                  hover:scale-105 hover:shadow-lg hover:shadow-${gradientColors.from}-500/20`}
              >
                {ctaText}
              </button>
              <button
                className="bg-transparent text-white border border-white/20 hover:border-white/40 
                  px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:bg-white/5"
              >
                {secondaryCtaText}
              </button>
            </motion.div>

            {/* Optional feature list */}
            <motion.div className="pt-4" custom={4} variants={childVariants}>
              <ul className="space-y-3">
                {[1, 2, 3].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-${gradientColors.from}-500/20 text-${gradientColors.from}-400`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span className="text-sm text-gray-300">
                      Feature point {item} related to this section
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Loading indicator for model */}
      {!isModelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-5">
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full border-2 border-t-${gradientColors.from}-500 border-r-${gradientColors.from}-500 border-b-transparent border-l-transparent animate-spin mb-4`}
            ></div>
            <p className="text-gray-400">Loading 3D model...</p>
          </div>
        </div>
      )}
    </section>
  );
}

// Helper function to generate colors based on section index (for backwards compatibility)
function getColorFromIndex(index: number): string {
  const colors = [
    "#4f9cff", // blue
    "#4fffaf", // teal
    "#ff4f9c", // pink
    "#ffaf4f", // orange
    "#af4fff", // purple
  ];

  return colors[index % colors.length];
}
