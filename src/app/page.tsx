"use client";

import { useEffect } from "react";
import Section from "@/components/section";
import { motion } from "framer-motion";
import { SectionData } from "@/types"; // Make sure this import path is correct

// Enhanced data for the sections with new animation properties
const SECTIONS: SectionData[] = [
  {
    id: "section-1",
    title: "CODE BECOMES CONSCIOUS",
    description:
      "Launch tokenized AI agents in three clicks. Fuses natural evolution and state-of-the-art systems for AI that feels alive.",
    modelPath: "/models/model1.glb",
    fullWidthModel: false, // This section will use the model as full background
    scale: 1.5,
    rotationSpeed: { x: 0, y: 0.002, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 },
    particleSize: 0.07,
    // No particleColor specified - will use original colors from the model
    particleDensity: 0.5,
    useShaderAnimation: true,
    // Enhanced animation parameters for more organic movement
    animationIntensity: 0.025,
    animationSpeed: 0.4,
    glowIntensity: 1.3,
  },
  {
    id: "section-2",
    title: "SEAMLESS INTEGRATION",
    description:
      "Effortlessly connect our platform with your existing tools and workflows. Our API-first approach ensures compatibility with your tech stack, minimizing disruption while maximizing value.",
    modelPath: "/models/model5.glb",
    fullWidthModel: true, // This section will use the side model layout
    scale: 2,
    rotationSpeed: { x: 0, y: 0, z: 0 },
    initialRotation: { x: 0, y: 1.5, z: 0.5 },
    particleSize: 0.125,
    // particleColor: "#ff4f9c", // Pink color specified - will override original colors
    particleDensity: 1.2,
    useShaderAnimation: true,
    // Faster but more subtle animation
    animationIntensity: 0.25,
    animationSpeed: 0.25,
    glowIntensity: 1.0,
  },
  {
    id: "section-3",
    title: "FUTURE-PROOF SOLUTIONS",
    description:
      "Stay ahead of the curve with technology that evolves with your needs. Our continuous updates and scalable architecture ensure your business is always equipped with the latest innovations.",
    modelPath: "/models/model4.glb",
    fullWidthModel: false, // This section will use the model as full background
    scale: 0.05,
    rotationSpeed: { x: 0, y: -0.002, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 },
    particleSize: 0.518,
    // No particleColor specified - will use original colors from the model
    particleDensity: 0.75,
    useShaderAnimation: true,
    // More dynamic animation with stronger glow
    animationIntensity: 0.03,
    animationSpeed: 0.05,
    glowIntensity: 1.5,
  },
];

export default function Home() {
  useEffect(() => {
    // Add smooth scrolling and initialization
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <main className="relative bg-black text-white">
      {/* Hero Section - No model in background */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-black/80"></div>
          {/* Removed ModelViewer from hero */}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 px-4 relative"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text mb-6">
            CODE BECOMES CONSCIOUS
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto mb-8">
            Launch tokenized AI agents in three clicks
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button className="bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white border border-gray-600 px-6 py-3 rounded-full text-lg font-medium transition-colors">
              Autonomous Growth
            </button>
            <button className="bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white border border-gray-600 px-6 py-3 rounded-full text-lg font-medium transition-colors">
              Always-On Cognition
            </button>
            <button className="bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm text-white px-6 py-3 rounded-full text-lg font-medium transition-colors">
              Living Intelligence
            </button>
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Alternating Sections with Enhanced Particle Models */}
      {SECTIONS.map((section, index) => (
        <Section
          key={section.id}
          title={section.title}
          description={section.description}
          modelPath={section.modelPath}
          reverse={index % 2 !== 0}
          index={index}
          fullWidthModel={section.fullWidthModel} // Pass the new property
          scale={section.scale}
          rotationSpeed={section.rotationSpeed}
          initialRotation={section.initialRotation}
          particleSize={section.particleSize}
          particleColor={section.particleColor}
          particleDensity={section.particleDensity}
          useShaderAnimation={section.useShaderAnimation}
          // Pass new animation parameters
          animationIntensity={section.animationIntensity}
          animationSpeed={section.animationSpeed}
          glowIntensity={section.glowIntensity}
        />
      ))}

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-gray-800">
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
