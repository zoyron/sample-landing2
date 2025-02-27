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
  // New particle-specific props
  particleSize?: number;
  particleColor?: string;
  particleDensity?: number;
  useShaderAnimation?: boolean;
}

export default function Section({
  title,
  description,
  modelPath,
  reverse = false,
  index,
  scale = 1,
  rotationSpeed = { x: 0, y: 0.002, z: 0 },
  initialRotation = { x: 0, y: 0, z: 0 },
  // Default values for new particle props
  particleSize = 0.02,
  particleColor = "#4f9cff",
  particleDensity = 0.5,
  useShaderAnimation = true,
}: SectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Generate a unique color based on section index if color not specified
  const particleColorToUse = particleColor || getColorFromIndex(index);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen w-full relative flex items-center overflow-hidden bg-black"
    >
      {/* Model container as background - with positioning for desktop */}
      <div
        className={cn(
          "absolute inset-0 w-full h-full",
          // On desktop, position the model to left or right side
          !isMobile && "md:flex md:items-center",
          !isMobile && reverse ? "md:justify-start" : "md:justify-end"
        )}
      >
        <div
          className={cn(
            "w-full h-full",
            // On desktop, size the model container to take half the screen
            !isMobile && "md:w-2/3 md:h-[600px]",
            // On desktop, shift the model slightly for better visual alignment
            !isMobile && reverse ? "md:ml-12" : "md:mr-12"
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
            onModelLoaded={() => setIsModelLoaded(true)}
          />
        </div>
      </div>

      {/* Content positioned over the model */}
      <div className="relative w-full z-10 px-4 py-16 md:py-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          {/* Text content - positioned to the opposite side of the model on desktop */}
          <motion.div
            className={cn(
              "w-full md:w-1/2 space-y-6 p-6 rounded-lg",
              "bg-black/5 backdrop-blur-[1px]", // Very subtle background effect
              // On desktop, position the text to the opposite side of the model
              !isMobile && reverse ? "md:ml-auto" : "md:mr-auto"
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

// Helper function to generate colors based on section index
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
