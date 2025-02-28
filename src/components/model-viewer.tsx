"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ModelViewerProps {
  modelPath: string;
  className?: string;
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
  onModelLoaded?: () => void;
  // Particle-specific props
  particleSize?: number;
  particleColor?: string; // Optional - if not provided, use original colors
  particleDensity?: number;
  useShaderAnimation?: boolean;
  animationIntensity?: number; // Controls how much particles move
  animationSpeed?: number; // Controls animation speed
  glowIntensity?: number; // Controls particle glow effect
}

export default function ParticleModelViewer({
  modelPath,
  className,
  scale = 1,
  rotationSpeed = { x: 0, y: 0, z: 0 },
  initialRotation = { x: 0, y: 0, z: 0 },
  onModelLoaded,
  particleSize = 0.02,
  particleColor,
  particleDensity = 0.5,
  useShaderAnimation = true,
  animationIntensity = 0.02,
  animationSpeed = 0.5,
  glowIntensity = 1.2,
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const [loadingStatus, setLoadingStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

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

  // Improved vertex shader with more natural movement and better noise
  const vertexShader = `
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

  // Improved fragment shader with better glow and anti-aliasing
  const fragmentShader = `
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

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null; // Transparent background

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 5;

    // Setup renderer with better quality settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // Add OrbitControls but disable user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.autoRotate = false;

    // Simple lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Reset the clock
    clockRef.current = new THREE.Clock();
    clockRef.current.start();

    // Flag to determine if we should use original colors
    const useOriginalColors = !particleColor;

    // Load model and convert to particles
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        setLoadingStatus("success");
        const model = gltf.scene;

        // Calculate bounding box for centering
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Extract all vertices and colors from all meshes in the model
        let vertices: THREE.Vector3[] = [];
        let colors: THREE.Color[] = [];

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const geometry = mesh.geometry;
            const worldMatrix = mesh.matrixWorld;
            const positionAttribute = geometry.getAttribute("position");

            // Try to get vertex colors if they exist
            const colorAttribute = geometry.getAttribute("color");

            // Try to get material color if vertex colors don't exist
            let materialColor: THREE.Color | null = null;
            if (mesh.material) {
              const material = mesh.material as THREE.Material;
              if ((material as any).color) {
                materialColor = (material as any).color;
              }
            }

            // Extract vertices and colors
            for (
              let i = 0;
              i < positionAttribute.count;
              i += Math.round(1 / particleDensity)
            ) {
              const vertex = new THREE.Vector3();
              vertex.fromBufferAttribute(positionAttribute, i);
              vertex.applyMatrix4(worldMatrix);
              vertex.sub(center);
              vertices.push(vertex);

              // Try to get color from vertex colors attribute
              if (colorAttribute) {
                const color = new THREE.Color();
                color.fromBufferAttribute(colorAttribute, i);
                colors.push(color);
              }
              // Try to get color from material
              else if (materialColor) {
                colors.push(materialColor.clone());
              }
              // Default to white if no color info is available
              else {
                colors.push(new THREE.Color(1, 1, 1));
              }
            }
          }
        });

        // Create a new geometry for particles
        const particleGeometry = new THREE.BufferGeometry();

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
        particleGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );

        if (useShaderAnimation) {
          particleGeometry.setAttribute(
            "originalPosition",
            new THREE.BufferAttribute(originalPositions, 3)
          );
          particleGeometry.setAttribute(
            "randomness",
            new THREE.BufferAttribute(randomFactors, 3)
          );
          particleGeometry.setAttribute(
            "vertexColor",
            new THREE.BufferAttribute(vertexColors, 3)
          );
        }

        // Create particle material
        let particleMaterial: THREE.Material;

        if (useShaderAnimation) {
          // Use enhanced ShaderMaterial
          particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
              uniformColor: {
                value: particleColor
                  ? new THREE.Color(particleColor)
                  : new THREE.Color(1, 1, 1),
              },
              time: { value: 0.0 },
              animationSpeed: { value: animationSpeed },
              animationIntensity: { value: animationIntensity },
              useVertexColors: { value: useOriginalColors },
              glowIntensity: { value: glowIntensity },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
        } else {
          // Use standard PointsMaterial
          if (useOriginalColors) {
            // For non-shader animation with original colors
            particleMaterial = new THREE.PointsMaterial({
              size: particleSize,
              sizeAttenuation: true,
              vertexColors: true, // Use vertex colors
              transparent: true,
              alphaTest: 0.01,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            });
          } else {
            // For non-shader animation with uniform color
            particleMaterial = new THREE.PointsMaterial({
              color: particleColor,
              size: particleSize,
              sizeAttenuation: true,
              transparent: true,
              alphaTest: 0.01,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            });
          }
        }

        // Create particle system
        const particleSystem = new THREE.Points(
          particleGeometry,
          particleMaterial
        );

        // Scale the particles
        particleSystem.scale.set(scale, scale, scale);

        // Set initial rotation
        particleSystem.rotation.x = initialRotation.x || 0;
        particleSystem.rotation.y = initialRotation.y || 0;
        particleSystem.rotation.z = initialRotation.z || 0;

        // Add to scene
        scene.add(particleSystem);
        particleSystemRef.current = particleSystem;

        // Notify parent that model is loaded
        if (onModelLoaded) onModelLoaded();
      },
      (xhr) => {
        // Loading progress
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("Error loading model:", error);
        setLoadingStatus("error");
      }
    );

    // Animation loop with optimization and throttling
    let lastRender = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const delta = timestamp - lastRender;

      if (delta > frameInterval || !lastRender) {
        lastRender = timestamp - (delta % frameInterval);

        // Update controls
        if (controlsRef.current) {
          controlsRef.current.update();
        }

        // Get elapsed time
        const elapsedTime = clockRef.current.getElapsedTime();

        // Update shader uniforms if using shader animation
        if (particleSystemRef.current && useShaderAnimation) {
          const material = particleSystemRef.current
            .material as THREE.ShaderMaterial;
          if (material.uniforms) {
            material.uniforms.time.value = elapsedTime;
          }
        }

        // Rotate particle system
        if (particleSystemRef.current) {
          if (rotationSpeed.x)
            particleSystemRef.current.rotation.x += rotationSpeed.x;
          if (rotationSpeed.y)
            particleSystemRef.current.rotation.y += rotationSpeed.y;
          if (rotationSpeed.z)
            particleSystemRef.current.rotation.z += rotationSpeed.z;
        }

        // Render
        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    // Handle window resize with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current)
          return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // Update camera
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();

        // Update renderer
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      // Dispose geometries and materials
      if (particleSystemRef.current) {
        if (particleSystemRef.current.geometry) {
          particleSystemRef.current.geometry.dispose();
        }

        if (particleSystemRef.current.material) {
          if (Array.isArray(particleSystemRef.current.material)) {
            particleSystemRef.current.material.forEach((material) =>
              material.dispose()
            );
          } else {
            particleSystemRef.current.material.dispose();
          }
        }
      }
    };
  }, [
    modelPath,
    scale,
    particleSize,
    particleColor,
    particleDensity,
    useShaderAnimation,
    animationIntensity,
    animationSpeed,
    glowIntensity,
    onModelLoaded,
  ]);

  return (
    <div ref={containerRef} className={className}>
      {loadingStatus === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-white opacity-50">
          Loading model...
        </div>
      )}
      {loadingStatus === "error" && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500">
          Error loading model
        </div>
      )}
    </div>
  );
}
