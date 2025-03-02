"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SectionData } from "@/types";

// Support both single model and multi-model approaches
interface ParticleModelViewerProps {
  // Original single model props
  modelPath?: string;
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
  particleSize?: number;
  particleColor?: string;
  particleDensity?: number;
  useShaderAnimation?: boolean;
  animationIntensity?: number;
  animationSpeed?: number;
  glowIntensity?: number;
  onModelLoaded?: () => void;

  // New multi-model props
  sections?: SectionData[];

  // Common props
  className?: string;
}

export default function ParticleModelViewer({
  // Original single model props
  modelPath,
  scale = 1,
  rotationSpeed = { x: 0, y: 0.002, z: 0 },
  initialRotation = { x: 0, y: 0, z: 0 },
  particleSize = 0.02,
  particleColor,
  particleDensity = 0.5,
  useShaderAnimation = true,
  animationIntensity = 0.02,
  animationSpeed = 0.5,
  glowIntensity = 1.2,
  onModelLoaded,

  // New multi-model props
  sections,

  // Common props
  className,
}: ParticleModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Determine if we're in multi-model mode or single-model mode
  const isMultiModelMode = !!sections && sections.length > 0;

  // If we're in single-model mode, create a fake "sections" array with just this model
  const effectiveSections: SectionData[] = isMultiModelMode
    ? sections!
    : [
        {
          id: "single-model",
          title: "",
          description: "",
          modelPath: modelPath!,
          scale,
          rotationSpeed,
          initialRotation,
          particleSize,
          particleColor,
          particleDensity,
          useShaderAnimation,
          animationIntensity,
          animationSpeed,
          glowIntensity,
        },
      ];

  // For multi-model mode only
  const [scrollProgress, setScrollProgress] = useState(0);
  const [modelData, setModelData] = useState<{
    vertices: THREE.Vector3[][];
    colors: THREE.Color[][];
    loaded: boolean[];
  }>({
    vertices: effectiveSections.map(() => []),
    colors: effectiveSections.map(() => []),
    loaded: effectiveSections.map(() => false),
  });
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [nextSectionIndex, setNextSectionIndex] = useState(
    effectiveSections.length > 1 ? 1 : 0
  );
  const [morphProgress, setMorphProgress] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [allModelsLoaded, setAllModelsLoaded] = useState(false);

  // Enhanced noise functions for vertex shader
  const noiseFunctions = `
    // Classic Perlin 3D Noise 
    // by Stefan Gustavson
    vec4 permute(vec4 x) {
      return mod(((x*34.0)+1.0)*x, 289.0);
    }
    
    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    float snoise(vec3 v) { 
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      // First corner
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      // Permutations
      i = mod(i, 289.0); 
      vec4 p = permute(permute(permute( 
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
      // Gradients
      float n_ = 1.0/7.0;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      // Normalise gradients
      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      // Mix final noise value
      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }
    
    // FBM (Fractional Brownian Motion) for smoother noise
    float fbm(vec3 x, int octaves) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      
      // Rotate to reduce axial bias
      mat3 rot = mat3(
        cos(0.5), sin(0.5), 0.0,
        -sin(0.5), cos(0.5), 0.0,
        0.0, 0.0, 1.0
      );
      
      for (int i = 0; i < octaves; ++i) {
        v += a * snoise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
      }
      
      return v;
    }
  `;

  // Choose the appropriate vertex shader based on mode
  const getSingleModelVertexShader = () => `
    ${noiseFunctions}
    
    attribute vec3 originalPosition;
    attribute vec3 randomness;
    attribute vec3 vertexColor;
    
    uniform float time;
    uniform float animationSpeed;
    uniform float animationIntensity;
    uniform bool useVertexColors;
    
    varying vec3 vColor;
    varying float vDistance;
    varying float vNoise;
    
    void main() {
      // Use original position as a base
      vec3 pos = originalPosition;
      
      // Generate more natural noise-based movement using FBM
      float noiseTime = time * animationSpeed;
      
      // Different noise frequencies for each axis
      float noiseX = fbm(vec3(originalPosition.xyz * 0.4 + noiseTime * 0.3), 3);
      float noiseY = fbm(vec3(originalPosition.yzx * 0.4 + noiseTime * 0.2), 3);
      float noiseZ = fbm(vec3(originalPosition.zxy * 0.4 + noiseTime * 0.1), 3);
      
      // Combine different noise patterns for more interesting movement
      vec3 noiseVec = vec3(noiseX, noiseY, noiseZ);
      
      // Apply movement with randomness to make it more varied between particles
      pos += (noiseVec * randomness * animationIntensity);
      
      // Additional wave effect based on distance from center
      float dist = length(originalPosition);
      float waveEffect = sin(dist * 3.0 - noiseTime) * 0.02 * dist;
      pos += originalPosition * waveEffect * randomness;
      
      // Calculate camera-space position for size attenuation
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Pass varying values to fragment shader
      vColor = vertexColor;
      vDistance = -mvPosition.z;
      vNoise = (noiseX + noiseY + noiseZ) * 0.33; // Average noise for glow effect
      
      // Calculate point size with better distance attenuation
      gl_PointSize = ${particleSize} * (300.0 / vDistance) * (1.0 + vNoise * 0.2);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const getMorphingVertexShader = () => `
    ${noiseFunctions}
    
    attribute vec3 currentPosition;
    attribute vec3 targetPosition;
    attribute vec3 randomness;
    attribute vec3 currentColor;
    attribute vec3 targetColor;
    
    uniform float time;
    uniform float morphProgress;
    uniform float animationSpeed;
    uniform float animationIntensity;
    uniform float particleSize;
    uniform float glowIntensity;
    
    varying vec3 vColor;
    varying float vDistance;
    varying float vNoise;
    
    void main() {
      // Interpolate between original and target positions based on morphProgress
      vec3 morphedPosition = mix(currentPosition, targetPosition, morphProgress);
      
      // Generate more natural noise-based movement using FBM
      float noiseTime = time * animationSpeed;
      
      // Different noise frequencies for each axis
      float noiseX = fbm(vec3(morphedPosition.xyz * 0.4 + noiseTime * 0.3), 3);
      float noiseY = fbm(vec3(morphedPosition.yzx * 0.4 + noiseTime * 0.2), 3);
      float noiseZ = fbm(vec3(morphedPosition.zxy * 0.4 + noiseTime * 0.1), 3);
      
      // Combine different noise patterns for more interesting movement
      vec3 noiseVec = vec3(noiseX, noiseY, noiseZ);
      
      // Apply movement with randomness to make it more varied between particles
      vec3 pos = morphedPosition + (noiseVec * randomness * animationIntensity);
      
      // Additional wave effect based on distance from center
      float dist = length(morphedPosition);
      float waveEffect = sin(dist * 3.0 - noiseTime) * 0.02 * dist;
      pos += morphedPosition * waveEffect * randomness;
      
      // Calculate camera-space position for size attenuation
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Interpolate color based on morphProgress
      vColor = mix(currentColor, targetColor, morphProgress);
      
      vDistance = -mvPosition.z;
      vNoise = (noiseX + noiseY + noiseZ) * 0.33; // Average noise for glow effect
      
      // Calculate point size with distance attenuation
      gl_PointSize = particleSize * (300.0 / vDistance) * (1.0 + vNoise * 0.2);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  // Choose the appropriate fragment shader
  const getSingleModelFragmentShader = () => `
    uniform vec3 uniformColor;
    uniform bool useVertexColors;
    uniform float glowIntensity;
    uniform float time;
    
    varying vec3 vColor;
    varying float vDistance;
    varying float vNoise;
    
    void main() {
      // Calculate distance from center of point (0.5, 0.5)
      vec2 uv = gl_PointCoord - 0.5;
      float distance = length(uv);
      
      // Create circular particle with smoother edges
      float circle = smoothstep(0.5, 0.35, distance);
      
      // Apply subtle pulse based on time and noise
      float pulse = 1.0 + 0.1 * sin(time * 2.0 + vNoise * 6.28);
      
      // Apply glow effect based on distance
      float glow = exp(-distance * 4.0) * glowIntensity * pulse;
      
      // Combine base circle with glow
      float alpha = circle + glow * (1.0 - circle) * 0.6;
      
      // Determine color based on mode
      vec3 baseColor = useVertexColors ? vColor : uniformColor;
      
      // Enhance colors based on noise for subtle variation
      baseColor *= (1.0 + vNoise * 0.2);
      
      // Add subtle color shift towards blue at edges for depth
      vec3 finalColor = mix(baseColor, baseColor * vec3(0.8, 0.9, 1.2), distance);
      
      // Apply brightness falloff from center for more realistic particles
      finalColor *= (1.0 - distance * 0.7) * (1.0 + glow * 0.3);
      
      // Ensure alpha is capped at 1.0
      gl_FragColor = vec4(finalColor, min(alpha, 1.0));
    }
  `;

  const getMorphingFragmentShader = () => `
    uniform float glowIntensity;
    uniform float time;
    
    varying vec3 vColor;
    varying float vDistance;
    varying float vNoise;
    
    void main() {
      // Calculate distance from center of point
      vec2 uv = gl_PointCoord - 0.5;
      float distance = length(uv);
      
      // Create circular particle with smoother edges
      float circle = smoothstep(0.5, 0.35, distance);
      
      // Apply subtle pulse based on time and noise
      float pulse = 1.0 + 0.1 * sin(time * 2.0 + vNoise * 6.28);
      
      // Apply glow effect based on distance
      float glow = exp(-distance * 4.0) * glowIntensity * pulse;
      
      // Combine base circle with glow
      float alpha = circle + glow * (1.0 - circle) * 0.6;
      
      // Use varying color from vertex shader
      vec3 baseColor = vColor;
      
      // Enhance colors based on noise for subtle variation
      baseColor *= (1.0 + vNoise * 0.2);
      
      // Add subtle color shift towards blue at edges for depth
      vec3 finalColor = mix(baseColor, baseColor * vec3(0.8, 0.9, 1.2), distance);
      
      // Apply brightness falloff from center for more realistic particles
      finalColor *= (1.0 - distance * 0.7) * (1.0 + glow * 0.3);
      
      // Ensure alpha is capped at 1.0
      gl_FragColor = vec4(finalColor, min(alpha, 1.0));
    }
  `;

  // Use the appropriate shaders based on mode
  const vertexShader = isMultiModelMode
    ? getMorphingVertexShader()
    : getSingleModelVertexShader();
  const fragmentShader = isMultiModelMode
    ? getMorphingFragmentShader()
    : getSingleModelFragmentShader();

  // Load a model and extract its vertices and colors
  const loadModel = async (index: number) => {
    const section = effectiveSections[index];
    const loader = new GLTFLoader();

    return new Promise<void>((resolve, reject) => {
      loader.load(
        section.modelPath,
        (gltf) => {
          const model = gltf.scene;

          // Calculate bounding box for centering
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());

          // Extract vertices and colors
          let vertices: THREE.Vector3[] = [];
          let colors: THREE.Color[] = [];

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const geometry = mesh.geometry;
              const worldMatrix = mesh.matrixWorld;
              const positionAttribute = geometry.getAttribute("position");

              // Get color from mesh
              let meshColor: THREE.Color | null = null;
              if (mesh.material) {
                const material = mesh.material as THREE.Material;
                if ((material as any).color) {
                  meshColor = (material as any).color;
                }
              }

              // Override with section color if specified
              const useCustomColor = !!section.particleColor;
              const customColor = useCustomColor
                ? new THREE.Color(section.particleColor)
                : null;

              // Sample rate based on particle density
              const density = section.particleDensity || 0.5;
              const skip = Math.max(1, Math.round(1 / density));

              // Extract vertices and assign colors
              for (let i = 0; i < positionAttribute.count; i += skip) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(positionAttribute, i);
                vertex.applyMatrix4(worldMatrix);
                vertex.sub(center);

                // Apply section scale
                const scale = section.scale || 1;
                vertex.multiplyScalar(scale);

                vertices.push(vertex);

                // Add color
                if (useCustomColor && customColor) {
                  colors.push(customColor.clone());
                } else if (meshColor) {
                  colors.push(meshColor.clone());
                } else {
                  colors.push(new THREE.Color(1, 1, 1));
                }
              }
            }
          });

          if (isMultiModelMode) {
            // In multi-model mode, update model data array
            setModelData((prev) => {
              const newVertices = [...prev.vertices];
              const newColors = [...prev.colors];
              const newLoaded = [...prev.loaded];

              newVertices[index] = vertices;
              newColors[index] = colors;
              newLoaded[index] = true;

              return {
                vertices: newVertices,
                colors: newColors,
                loaded: newLoaded,
              };
            });

            // Update loading progress
            setLoadingProgress((index + 1) / effectiveSections.length);
          } else {
            // In single-model mode, directly create the particle system
            createSingleModelParticleSystem(vertices, colors);
          }

          if (onModelLoaded && index === 0) {
            onModelLoaded();
          }

          resolve();
        },
        undefined,
        (error) => {
          console.error(`Error loading model ${section.modelPath}:`, error);
          reject(error);
        }
      );
    });
  };

  // Create a single-model particle system (original behavior)
  const createSingleModelParticleSystem = (
    vertices: THREE.Vector3[],
    colors: THREE.Color[]
  ) => {
    if (!sceneRef.current) return;

    const geometry = new THREE.BufferGeometry();

    // Create arrays for attributes
    const positions = new Float32Array(vertices.length * 3);
    const originalPositions = new Float32Array(vertices.length * 3);
    const randomFactors = new Float32Array(vertices.length * 3);
    const vertexColors = new Float32Array(vertices.length * 3);

    for (let i = 0; i < vertices.length; i++) {
      const i3 = i * 3;

      // Positions
      positions[i3] = vertices[i].x;
      positions[i3 + 1] = vertices[i].y;
      positions[i3 + 2] = vertices[i].z;

      // Original positions for animation
      originalPositions[i3] = vertices[i].x;
      originalPositions[i3 + 1] = vertices[i].y;
      originalPositions[i3 + 2] = vertices[i].z;

      // Enhanced randomness for more varied animation
      randomFactors[i3] = (Math.random() * 2 - 1) * 1.5;
      randomFactors[i3 + 1] = (Math.random() * 2 - 1) * 1.5;
      randomFactors[i3 + 2] = (Math.random() * 2 - 1) * 1.5;

      // Colors
      if (i < colors.length) {
        vertexColors[i3] = colors[i].r;
        vertexColors[i3 + 1] = colors[i].g;
        vertexColors[i3 + 2] = colors[i].b;
      } else {
        // Default white
        vertexColors[i3] = 1.0;
        vertexColors[i3 + 1] = 1.0;
        vertexColors[i3 + 2] = 1.0;
      }
    }

    // Set geometry attributes
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute(
      "originalPosition",
      new THREE.BufferAttribute(originalPositions, 3)
    );
    geometry.setAttribute(
      "randomness",
      new THREE.BufferAttribute(randomFactors, 3)
    );
    geometry.setAttribute(
      "vertexColor",
      new THREE.BufferAttribute(vertexColors, 3)
    );

    // Create material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uniformColor: {
          value: particleColor
            ? new THREE.Color(particleColor)
            : new THREE.Color(1, 1, 1),
        },
        time: { value: 0.0 },
        animationSpeed: { value: animationSpeed },
        animationIntensity: { value: animationIntensity },
        useVertexColors: { value: !particleColor },
        glowIntensity: { value: glowIntensity },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // Create particles
    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.rotation.set(
      initialRotation.x || 0,
      initialRotation.y || 0,
      initialRotation.z || 0
    );

    // Add to scene
    sceneRef.current.add(particleSystem);
    particleSystemRef.current = particleSystem;
  };

  // Function to create the multi-model particle system with morphing capability
  const createMultiModelParticleSystem = () => {
    if (!sceneRef.current || !isMultiModelMode) return;

    // Find the model with the most vertices to normalize all models
    let maxVertices = 0;
    modelData.vertices.forEach((vertices) => {
      maxVertices = Math.max(maxVertices, vertices.length);
    });

    if (maxVertices === 0) return;

    // Prepare normalized model data with same vertex count
    const normalizedModels = modelData.vertices.map((vertices, modelIndex) => {
      const colors = modelData.colors[modelIndex];

      // If we need to expand the model to match the max vertex count
      if (vertices.length < maxVertices) {
        const expandedVertices = [...vertices];
        const expandedColors = [...colors];

        // Add duplicated vertices with slight offsets
        while (expandedVertices.length < maxVertices) {
          const sourceIdx = Math.floor(Math.random() * vertices.length);
          const v = vertices[sourceIdx].clone();
          const c = colors[sourceIdx].clone();

          // Add small random offset
          v.add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 0.05,
              (Math.random() - 0.5) * 0.05,
              (Math.random() - 0.5) * 0.05
            )
          );

          expandedVertices.push(v);
          expandedColors.push(c);
        }

        return {
          vertices: expandedVertices,
          colors: expandedColors,
        };
      }

      // Otherwise use the original data (trimmed if needed)
      return {
        vertices: vertices.slice(0, maxVertices),
        colors: colors.slice(0, maxVertices),
      };
    });

    // Create geometry
    const geometry = new THREE.BufferGeometry();

    // Create attributes for current and target positions/colors
    const positions = new Float32Array(maxVertices * 3);
    const currentPositions = new Float32Array(maxVertices * 3);
    const targetPositions = new Float32Array(maxVertices * 3);
    const currentColors = new Float32Array(maxVertices * 3);
    const targetColors = new Float32Array(maxVertices * 3);
    const randomFactors = new Float32Array(maxVertices * 3);

    // Start with the first model as current
    const currentModel = normalizedModels[0];
    const targetModel = normalizedModels[1] || normalizedModels[0];

    for (let i = 0; i < maxVertices; i++) {
      const i3 = i * 3;

      // Current positions (start position)
      currentPositions[i3] = currentModel.vertices[i].x;
      currentPositions[i3 + 1] = currentModel.vertices[i].y;
      currentPositions[i3 + 2] = currentModel.vertices[i].z;

      // Initial positions (used for rendering)
      positions[i3] = currentModel.vertices[i].x;
      positions[i3 + 1] = currentModel.vertices[i].y;
      positions[i3 + 2] = currentModel.vertices[i].z;

      // Target positions (next model)
      targetPositions[i3] = targetModel.vertices[i].x;
      targetPositions[i3 + 1] = targetModel.vertices[i].y;
      targetPositions[i3 + 2] = targetModel.vertices[i].z;

      // Current colors
      currentColors[i3] = currentModel.colors[i].r;
      currentColors[i3 + 1] = currentModel.colors[i].g;
      currentColors[i3 + 2] = currentModel.colors[i].b;

      // Target colors
      targetColors[i3] = targetModel.colors[i].r;
      targetColors[i3 + 1] = targetModel.colors[i].g;
      targetColors[i3 + 2] = targetModel.colors[i].b;

      // Random factors for animation variation
      randomFactors[i3] = (Math.random() * 2 - 1) * 1.5;
      randomFactors[i3 + 1] = (Math.random() * 2 - 1) * 1.5;
      randomFactors[i3 + 2] = (Math.random() * 2 - 1) * 1.5;
    }

    // Set geometry attributes
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute(
      "currentPosition",
      new THREE.BufferAttribute(currentPositions, 3)
    );
    geometry.setAttribute(
      "targetPosition",
      new THREE.BufferAttribute(targetPositions, 3)
    );
    geometry.setAttribute(
      "currentColor",
      new THREE.BufferAttribute(currentColors, 3)
    );
    geometry.setAttribute(
      "targetColor",
      new THREE.BufferAttribute(targetColors, 3)
    );
    geometry.setAttribute(
      "randomness",
      new THREE.BufferAttribute(randomFactors, 3)
    );

    // Create material with shader
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        morphProgress: { value: 0.0 },
        animationSpeed: { value: effectiveSections[0].animationSpeed || 0.5 },
        animationIntensity: {
          value: effectiveSections[0].animationIntensity || 0.02,
        },
        particleSize: { value: effectiveSections[0].particleSize || 0.05 },
        glowIntensity: { value: effectiveSections[0].glowIntensity || 1.2 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // Create particle system
    const particleSystem = new THREE.Points(geometry, material);

    // Apply initial rotation
    const initialRotation = effectiveSections[0].initialRotation || {
      x: 0,
      y: 0,
      z: 0,
    };
    particleSystem.rotation.set(
      initialRotation.x || 0,
      initialRotation.y || 0,
      initialRotation.z || 0
    );

    // Add to scene
    sceneRef.current.add(particleSystem);
    particleSystemRef.current = particleSystem;
  };

  // Update particle attributes for multi-model morphing
  const updateParticleAttributes = (
    currentIndex: number,
    nextIndex: number
  ) => {
    if (!particleSystemRef.current || !isMultiModelMode) return;

    const geometry = particleSystemRef.current.geometry;
    const vertexCount = geometry.getAttribute("position").count;

    // Prepare normalized data for the two models
    const normalizeModelData = (modelIndex: number) => {
      const vertices = modelData.vertices[modelIndex];
      const colors = modelData.colors[modelIndex];

      if (vertices.length >= vertexCount) {
        return {
          vertices: vertices.slice(0, vertexCount),
          colors: colors.slice(0, vertexCount),
        };
      }

      // Expand data if needed
      const expandedVertices = [...vertices];
      const expandedColors = [...colors];

      while (expandedVertices.length < vertexCount) {
        const idx = Math.floor(Math.random() * vertices.length);
        expandedVertices.push(
          vertices[idx]
            .clone()
            .add(
              new THREE.Vector3(
                Math.random() * 0.1,
                Math.random() * 0.1,
                Math.random() * 0.1
              )
            )
        );
        expandedColors.push(colors[idx].clone());
      }

      return {
        vertices: expandedVertices,
        colors: expandedColors,
      };
    };

    const currentModelData = normalizeModelData(currentIndex);
    const nextModelData = normalizeModelData(nextIndex);

    // Update attributes
    const currentPositions = geometry.getAttribute("currentPosition")
      .array as Float32Array;
    const targetPositions = geometry.getAttribute("targetPosition")
      .array as Float32Array;
    const currentColors = geometry.getAttribute("currentColor")
      .array as Float32Array;
    const targetColors = geometry.getAttribute("targetColor")
      .array as Float32Array;

    for (let i = 0; i < vertexCount; i++) {
      const i3 = i * 3;

      // Update positions
      currentPositions[i3] = currentModelData.vertices[i].x;
      currentPositions[i3 + 1] = currentModelData.vertices[i].y;
      currentPositions[i3 + 2] = currentModelData.vertices[i].z;

      targetPositions[i3] = nextModelData.vertices[i].x;
      targetPositions[i3 + 1] = nextModelData.vertices[i].y;
      targetPositions[i3 + 2] = nextModelData.vertices[i].z;

      // Update colors
      currentColors[i3] = currentModelData.colors[i].r;
      currentColors[i3 + 1] = currentModelData.colors[i].g;
      currentColors[i3 + 2] = currentModelData.colors[i].b;

      targetColors[i3] = nextModelData.colors[i].r;
      targetColors[i3 + 1] = nextModelData.colors[i].g;
      targetColors[i3 + 2] = nextModelData.colors[i].b;
    }

    // Mark attributes as needing update
    geometry.getAttribute("currentPosition").needsUpdate = true;
    geometry.getAttribute("targetPosition").needsUpdate = true;
    geometry.getAttribute("currentColor").needsUpdate = true;
    geometry.getAttribute("targetColor").needsUpdate = true;
  };

  // Update morphing for multi-model mode
  const updateMorphing = (scrollProgress: number) => {
    if (
      !particleSystemRef.current ||
      !isMultiModelMode ||
      effectiveSections.length <= 1
    )
      return;

    // Calculate which sections we're between
    const totalSections = effectiveSections.length;
    const sectionHeight = 1 / (totalSections - 1);

    // Calculate current and next section indices
    const sectionProgress = scrollProgress / sectionHeight;
    const currentSectionIndex = Math.min(
      Math.floor(sectionProgress),
      totalSections - 1
    );
    const nextSectionIndex = Math.min(
      currentSectionIndex + 1,
      totalSections - 1
    );

    // Calculate progress within current section transition (0 to 1)
    const currentMorphProgress = sectionProgress - currentSectionIndex;
    setMorphProgress(currentMorphProgress);

    // Update current active indices
    if (
      currentSectionIndex !== activeSectionIndex ||
      nextSectionIndex !== nextSectionIndex
    ) {
      setActiveSectionIndex(currentSectionIndex);
      setNextSectionIndex(nextSectionIndex);

      // Only proceed if both models are loaded
      if (
        !modelData.loaded[currentSectionIndex] ||
        !modelData.loaded[nextSectionIndex]
      ) {
        return;
      }

      // Update attributes for the new current/target models
      updateParticleAttributes(currentSectionIndex, nextSectionIndex);
    }

    // Update uniforms for the transition
    if (particleSystemRef.current) {
      const material = particleSystemRef.current
        .material as THREE.ShaderMaterial;

      // Get current and next sections
      const currentSection = effectiveSections[currentSectionIndex];
      const nextSection = effectiveSections[nextSectionIndex];

      // Update morph progress
      material.uniforms.morphProgress.value = currentMorphProgress;

      // Interpolate animation parameters
      material.uniforms.animationSpeed.value = THREE.MathUtils.lerp(
        currentSection.animationSpeed || 0.5,
        nextSection.animationSpeed || 0.5,
        currentMorphProgress
      );

      material.uniforms.animationIntensity.value = THREE.MathUtils.lerp(
        currentSection.animationIntensity || 0.02,
        nextSection.animationIntensity || 0.02,
        currentMorphProgress
      );

      material.uniforms.particleSize.value = THREE.MathUtils.lerp(
        currentSection.particleSize || 0.05,
        nextSection.particleSize || 0.05,
        currentMorphProgress
      );

      material.uniforms.glowIntensity.value = THREE.MathUtils.lerp(
        currentSection.glowIntensity || 1.2,
        nextSection.glowIntensity || 1.2,
        currentMorphProgress
      );

      // Interpolate rotation
      const currentRotation = currentSection.initialRotation || {
        x: 0,
        y: 0,
        z: 0,
      };
      const nextRotation = nextSection.initialRotation || { x: 0, y: 0, z: 0 };

      particleSystemRef.current.rotation.x = THREE.MathUtils.lerp(
        currentRotation.x || 0,
        nextRotation.x || 0,
        currentMorphProgress
      );

      particleSystemRef.current.rotation.y = THREE.MathUtils.lerp(
        currentRotation.y || 0,
        nextRotation.y || 0,
        currentMorphProgress
      );

      particleSystemRef.current.rotation.z = THREE.MathUtils.lerp(
        currentRotation.z || 0,
        nextRotation.z || 0,
        currentMorphProgress
      );
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 5;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Add OrbitControls but disable user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enablePan = false;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Start clock
    clockRef.current = new THREE.Clock();

    // Start animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Update shader time
      if (particleSystemRef.current) {
        const material = particleSystemRef.current
          .material as THREE.ShaderMaterial;
        material.uniforms.time.value = clockRef.current.getElapsedTime();

        // Apply auto-rotation for single model mode
        if (!isMultiModelMode && rotationSpeed) {
          if (rotationSpeed.x)
            particleSystemRef.current.rotation.x += rotationSpeed.x;
          if (rotationSpeed.y)
            particleSystemRef.current.rotation.y += rotationSpeed.y;
          if (rotationSpeed.z)
            particleSystemRef.current.rotation.z += rotationSpeed.z;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      // Dispose of resources
      if (particleSystemRef.current) {
        particleSystemRef.current.geometry.dispose();
        (particleSystemRef.current.material as THREE.Material).dispose();
      }
    };
  }, []);

  // Load models
  useEffect(() => {
    if (isMultiModelMode) {
      // In multi-model mode, load all models
      const loadAllModels = async () => {
        try {
          for (let i = 0; i < effectiveSections.length; i++) {
            await loadModel(i);
          }
          setAllModelsLoaded(true);
        } catch (error) {
          console.error("Failed to load models:", error);
        }
      };

      loadAllModels();
    } else {
      // In single-model mode, load just one model
      loadModel(0);
    }
  }, [isMultiModelMode]);

  // Create multi-model particle system once all models are loaded
  useEffect(() => {
    if (isMultiModelMode && allModelsLoaded && !particleSystemRef.current) {
      createMultiModelParticleSystem();
    }
  }, [allModelsLoaded, isMultiModelMode]);

  // Track scroll position for morphing (only in multi-model mode)
  useEffect(() => {
    if (!isMultiModelMode) return;

    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Set initial position

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMultiModelMode]);

  // Update morphing when scroll changes (only in multi-model mode)
  useEffect(() => {
    if (isMultiModelMode) {
      updateMorphing(scrollProgress);
    }
  }, [scrollProgress, modelData.loaded, isMultiModelMode]);

  return (
    <div ref={containerRef} className={className || "w-full h-full"}>
      {isMultiModelMode && !allModelsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center bg-black/30 p-4 rounded-lg backdrop-blur-sm">
            <div className="mb-2">
              Loading Models ({Math.round(loadingProgress * 100)}%)
            </div>
            <div className="w-48 h-2 bg-gray-800 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${loadingProgress * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
