"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import ParticleModelViewer from "./model-viewer";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  description: string;
  modelPath: string;
  reverse?: boolean;
  index: number;
  fullWidthModel?: boolean; // New property to control if model fills entire background
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
  particleColor?: string; // Optional
  particleDensity?: number;
  useShaderAnimation?: boolean;
  // New animation enhancement props
  animationIntensity?: number;
  animationSpeed?: number;
  glowIntensity?: number;
}

export default function Section({
  title,
  description,
  modelPath,
  reverse = false,
  index,
  fullWidthModel = false, // Default to false to maintain current behavior
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  // Configuration constant to control whether to use original colors
  const SECTIONS_USE_ORIGINAL_COLORS = true;

  // Generate a unique color based on section index if color not specified (for backwards compatibility)
  const particleColorToUse =
    particleColor ||
    (SECTIONS_USE_ORIGINAL_COLORS ? undefined : getColorFromIndex(index));

  return (
    <section
      ref={sectionRef}
      className="min-h-screen w-full relative flex items-center overflow-hidden bg-black"
    >
      {/* Model container as background - with positioning logic for fullWidthModel */}
      <div
        className={cn(
          "absolute inset-0 w-full h-full",
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
            // Only resize if not fullWidthModel
            !isMobile && !fullWidthModel && "md:w-2/3 md:h-[600px]",
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

      {/* Content positioned over the model - adjust positioning for fullWidthModel */}
      <div className="relative w-full z-10 px-4 py-16 md:py-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          {/* Text content - adjust positioning for fullWidthModel */}
          <motion.div
            className={cn(
              "w-full md:w-1/2 space-y-6 p-6 rounded-lg",
              "bg-black/5 backdrop-blur-[1px]", // Very subtle background effect
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
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
              {title}
            </h2>
            <p className="text-lg text-gray-100 leading-relaxed">
              {description}
            </p>
            <button className="bg-blue-600/80 hover:bg-blue-700/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm">
              Learn More
            </button>
          </motion.div>
        </div>
      </div>
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
