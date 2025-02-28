// src/types.ts (or wherever your types file is located)

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
  // Make sure to include all particle-specific properties
  particleSize?: number;
  particleColor?: string; // This was missing
  particleDensity?: number;
  useShaderAnimation?: boolean;
  // Animation enhancement properties
  animationIntensity?: number;
  animationSpeed?: number;
  glowIntensity?: number;
}
