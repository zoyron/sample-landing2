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
  // New particle-specific props
  particleSize?: number;
  particleColor?: string;
  particleDensity?: number; // Controls how many particles to sample (0-1)
  useShaderAnimation?: boolean; // Use shader-based animation for better performance
}

export default function ParticleModelViewer({
  modelPath,
  className,
  scale = 1,
  rotationSpeed = { x: 0, y: 0, z: 0 },
  initialRotation = { x: 0, y: 0, z: 0 },
  onModelLoaded,
  particleSize = 0.02,
  particleColor = "#4f9cff",
  particleDensity = 0.5,
  useShaderAnimation = true,
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

  // Vertex shader - handles particle position and animation
  const vertexShader = `
    attribute vec3 originalPosition;
    attribute vec3 randomness;
    uniform float time;
    uniform float animationSpeed;
    
    void main() {
      // Animated position with noise-based movement
      vec3 pos = originalPosition;
      
      // Apply slight noise-based movement for particle animation
      float noise = sin(time * animationSpeed + position.x * 10.0) * 0.02 +
                    cos(time * animationSpeed + position.y * 8.0) * 0.02 +
                    sin(time * animationSpeed + position.z * 6.0) * 0.02;
                    
      pos += randomness * noise;
      
      // Standard projection
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = ${particleSize} * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  // Fragment shader - handles particle appearance
  const fragmentShader = `
    uniform vec3 color;
    
    void main() {
      // Create a circular particle with soft edges
      float distance = length(gl_PointCoord - vec2(0.5, 0.5));
      float opacity = 1.0 - smoothstep(0.4, 0.5, distance);
      
      // Radial gradient for each particle
      vec3 finalColor = color * (1.0 - distance * 2.0);
      
      gl_FragColor = vec4(finalColor, opacity);
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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // Add OrbitControls but disable user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enableRotate = false; // Disable manual rotation
    controls.enablePan = false; // Disable panning
    controls.autoRotate = false; // Ensure auto-rotation is off

    // Simple lighting (still useful for non-shader particles)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Reset the clock
    clockRef.current = new THREE.Clock();
    clockRef.current.start();

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

        // Extract all vertices from all meshes in the model
        let vertices: THREE.Vector3[] = [];
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const geometry = mesh.geometry;

            // Get world matrix to transform vertices
            const worldMatrix = mesh.matrixWorld;

            // Get position attribute from geometry
            const positionAttribute = geometry.getAttribute("position");

            // Extract vertices
            for (
              let i = 0;
              i < positionAttribute.count;
              i += Math.round(1 / particleDensity)
            ) {
              const vertex = new THREE.Vector3();
              vertex.fromBufferAttribute(positionAttribute, i);

              // Apply mesh's world transform
              vertex.applyMatrix4(worldMatrix);

              // Adjust vertex position relative to model center
              vertex.sub(center);

              vertices.push(vertex);
            }
          }
        });

        // Create a new geometry for particles
        const particleGeometry = new THREE.BufferGeometry();

        // Create position array from vertices
        const positions = new Float32Array(vertices.length * 3);
        const originalPositions = new Float32Array(vertices.length * 3);
        const randomFactors = new Float32Array(vertices.length * 3);

        for (let i = 0; i < vertices.length; i++) {
          const i3 = i * 3;

          positions[i3] = vertices[i].x;
          positions[i3 + 1] = vertices[i].y;
          positions[i3 + 2] = vertices[i].z;

          // Store original positions for shader animation
          originalPositions[i3] = vertices[i].x;
          originalPositions[i3 + 1] = vertices[i].y;
          originalPositions[i3 + 2] = vertices[i].z;

          // Random values for particle animation
          randomFactors[i3] = Math.random() * 2 - 1;
          randomFactors[i3 + 1] = Math.random() * 2 - 1;
          randomFactors[i3 + 2] = Math.random() * 2 - 1;
        }

        particleGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );

        // Add attributes for shader animation
        if (useShaderAnimation) {
          particleGeometry.setAttribute(
            "originalPosition",
            new THREE.BufferAttribute(originalPositions, 3)
          );
          particleGeometry.setAttribute(
            "randomness",
            new THREE.BufferAttribute(randomFactors, 3)
          );
        }

        // Create particle material
        let particleMaterial: THREE.Material;

        if (useShaderAnimation) {
          // Use ShaderMaterial for advanced effects
          particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
              color: { value: new THREE.Color(particleColor) },
              time: { value: 0.0 },
              animationSpeed: { value: 0.5 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
        } else {
          // Use standard PointsMaterial for simpler rendering
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

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

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
    };
    animate();

    // Handle window resize
    const handleResize = () => {
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
