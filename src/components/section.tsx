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
  // Optional text section display flag
  showTextSection?: boolean;
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
  // Show text section by default
  showTextSection = true,
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

  // Get color scheme based on section index
  const getColorScheme = (index: number) => {
    const schemes = [
      {
        main: "#6e56cf", // Lavender purple
        accent: "#a78bfa",
        shadow: "rgba(110, 86, 207, 0.3)",
      },
      {
        main: "#23a094", // Teal
        accent: "#5eead4",
        shadow: "rgba(35, 160, 148, 0.3)",
      },
      {
        main: "#dc3a84", // Rose pink
        accent: "#fb7185",
        shadow: "rgba(220, 58, 132, 0.3)",
      },
    ];

    return schemes[index % schemes.length];
  };

  const colorScheme = getColorScheme(index);

  // Override particleColor if not provided
  const particleColorToUse = particleColor || colorScheme.main;

  return (
    <section
      ref={sectionRef}
      className={`min-h-screen w-full relative flex items-center overflow-hidden bg-gradient-to-b from-[#090419] to-[#05010d] ${montserrat.variable} ${inter.variable}`}
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Dark gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/90 to-black/60 z-0"></div>

        {/* Very subtle dot pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5 z-0"></div>

        {/* Glow effect in corner opposite to content */}
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-10 z-0"
          style={{
            background: `radial-gradient(circle, ${colorScheme.accent}20 0%, transparent 70%)`,
            top: !reverse ? "10%" : "auto",
            bottom: reverse ? "10%" : "auto",
            left: !reverse ? "10%" : "auto",
            right: reverse ? "10%" : "auto",
          }}
        ></div>
      </div>

      {/* Model container with improved positioning */}
      <div
        className={cn(
          "absolute inset-0 w-full h-full z-1",
          !isMobile && !fullWidthModel && "md:flex md:items-center",
          !isMobile &&
            !fullWidthModel &&
            (reverse ? "md:justify-start" : "md:justify-end")
        )}
      >
        <div
          className={cn(
            "w-full h-full",
            isMobile ? "scale-75" : !fullWidthModel && "md:w-2/3 md:h-[600px]",
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
            animationIntensity={animationParams.animationIntensity}
            animationSpeed={animationParams.animationSpeed}
            glowIntensity={animationParams.glowIntensity}
            onModelLoaded={() => setIsModelLoaded(true)}
          />
        </div>
      </div>

      {/* Content with solid background instead of glass/blur effect - only rendered if showTextSection is true */}
      {showTextSection && (
        <div className="relative w-full z-10 px-6 py-16 md:py-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
            <motion.div
              className={cn(
                "w-full max-w-xl space-y-8 p-8 rounded-3xl",
                isMobile
                  ? "bg-black/50 border border-white/10"
                  : "bg-black/60 border border-white/10",
                fullWidthModel && "md:mx-auto",
                !fullWidthModel && !isMobile && reverse
                  ? "md:ml-auto"
                  : "md:mr-auto"
              )}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={textVariants}
            >
              {/* Minimalist section indicator */}
              <motion.div
                className="mb-2 opacity-60"
                custom={0}
                variants={childVariants}
              >
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-white to-transparent"></div>
              </motion.div>

              {/* Title with custom gradient */}
              <motion.h2
                className="text-4xl md:text-5xl font-bold font-montserrat tracking-tight"
                custom={1}
                variants={childVariants}
                style={{
                  background: `linear-gradient(to right, ${colorScheme.accent}, ${colorScheme.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {title}
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-lg text-gray-300 leading-relaxed font-inter tracking-wide"
                custom={2}
                variants={childVariants}
              >
                {description}
              </motion.p>

              {/* Subtle separator line */}
              <motion.div
                className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                custom={3}
                variants={childVariants}
              ></motion.div>

              {/* Section indicator in minimal form */}
              <motion.div
                className="flex items-center space-x-2"
                custom={4}
                variants={childVariants}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colorScheme.main }}
                ></div>
                <span className="text-xs uppercase tracking-widest text-gray-400 font-light">
                  {`${index + 1} / 3`}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!isModelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-5">
          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-full border-2 border-b-transparent border-l-transparent animate-spin mb-4"
              style={{
                borderTopColor: colorScheme.main,
                borderRightColor: colorScheme.main,
              }}
            ></div>
            <p className="text-gray-400">Loading 3D model...</p>
          </div>
        </div>
      )}
    </section>
  );
}
