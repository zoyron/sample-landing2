// src/types.ts
export interface SectionData {
  id: string;
  title: string;
  description: string;
  modelPath: string;
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
  // Particle-specific properties
  particleSize?: number;
  particleColor?: string;
  particleDensity?: number;
  useShaderAnimation?: boolean;
  // Animation enhancement properties
  animationIntensity?: number;
  animationSpeed?: number;
  glowIntensity?: number;
  // Optional text section display flag
  showTextSection?: boolean;
}
