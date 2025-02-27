export interface SectionData {
  id: string;
  title: string;
  description: string;
  modelPath: string;
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
  // New particle-specific properties
  particleSize?: number; // Size of each particle
  particleColor?: string; // Color of particles (hex color)
  particleDensity?: number; // How dense the particles should be (0-1)
  useShaderAnimation?: boolean; // Whether to use shader-based animation
}
