# Sample Landing - Particle Model Viewer for Next.js

A sample landing page built with Next.js that transforms 3D models into dynamic, animated particle systems. This project uses Three.js and custom GLSL shaders to create visually stunning, high-performance particle effects for modern web applications.

## Features

- **3D Model to Particle Conversion**: Automatically converts any 3D model (GLB/GLTF) into a dynamic particle system
- **GPU-Accelerated Animation**: Uses custom GLSL shaders for optimal performance
- **Advanced FBM Noise Functions**: Implements Fractional Brownian Motion for natural, organic particle movement
- **Responsive Design**: Adapts to different screen sizes with mobile-friendly layouts
- **Morphing Capabilities**: Seamlessly transition between different 3D models with particle morphing
- **Scroll-Based Transitions**: Models transform based on page scroll position
- **Customizable Particle Effects**: Control particle size, color, density, and animation parameters
- **Optimized Performance**: Efficiently handles thousands of particles with minimal impact on page performance
- **Enhanced Lighting & Glow**: Custom shader implementations for realistic lighting and glow effects

## Demo

The sample landing page showcases various 3D models converted to particles, displayed in alternating sections with descriptive text that highlight different features and capabilities.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/particle-model-viewer.git

# Navigate to the project directory
cd particle-model-viewer

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## How It Works

The project uses Three.js to load 3D models and convert them into particle systems. Each vertex in the model is sampled (based on the density setting) and rendered as a dynamic particle. Custom GLSL shaders add sophisticated movements and visual effects to create a living, breathing appearance.

### Key Components

- **model-viewer.tsx**: The core component that handles loading 3D models and converting them to particles, with support for both single-model and multi-model (morphing) modes
- **section.tsx**: Displays each section with a particle model and descriptive text
- **page.tsx**: Main application page that handles scroll-based transitions between sections
- **types/index.ts**: Contains TypeScript interfaces for the particle system

## Usage

### Basic Usage

To use the particle model viewer in your own sections:

```tsx
import ParticleModelViewer from "@/components/model-viewer";

// Basic usage with a single model
<ParticleModelViewer
  modelPath="/models/your-model.glb"
  className="w-full h-full"
/>
```

### Advanced Customization

```tsx
// With full customization
<ParticleModelViewer
  modelPath="/models/your-model.glb"
  className="w-full h-full"
  scale={2.5}
  rotationSpeed={{ x: 0, y: 0.002, z: 0 }}
  initialRotation={{ x: 0, y: 0, z: 0 }}
  particleSize={0.02}
  particleColor="#4f9cff"
  particleDensity={0.3}
  useShaderAnimation={true}
  animationIntensity={0.02}
  animationSpeed={0.5}
  glowIntensity={1.2}
  onModelLoaded={() => console.log("Model loaded!")}
/>
```

### Multi-Model Mode with Morphing

```tsx
// Define your sections data
const SECTIONS = [
  {
    id: "section-1",
    title: "Section One",
    description: "Description for section one",
    modelPath: "/models/model1.glb",
    scale: 1.0,
    particleColor: "#6e56cf",
    // ...other properties
  },
  {
    id: "section-2",
    title: "Section Two",
    description: "Description for section two",
    modelPath: "/models/model2.glb",
    scale: 2.0,
    particleColor: "#23a094",
    // ...other properties
  },
  // More sections...
];

// Use multi-model mode
<ParticleModelViewer
  sections={SECTIONS}
  className="w-full h-full"
  onModelLoaded={handleModelLoaded}
/>
```

## Customization Options

The particle system supports numerous customization options:

### Basic Options

| Option               | Type     | Default              | Description                                    |
| -------------------- | -------- | -------------------- | ---------------------------------------------- |
| `modelPath`          | string   | (required)           | Path to the 3D model file (GLB/GLTF)           |
| `className`          | string   | ""                   | CSS classes to apply to the container          |
| `scale`              | number   | 1                    | Scale of the model                             |
| `rotationSpeed`      | object   | `{x: 0, y: 0, z: 0}` | Rotation speed on each axis                    |
| `initialRotation`    | object   | `{x: 0, y: 0, z: 0}` | Initial rotation on each axis                  |
| `particleSize`       | number   | 0.02                 | Size of each particle                          |
| `particleColor`      | string   | "#4f9cff"            | Color of particles (hex code)                  |
| `particleDensity`    | number   | 0.5                  | How many vertices to sample (0-1)              |
| `useShaderAnimation` | boolean  | true                 | Whether to use advanced shader-based animation |
| `onModelLoaded`      | function | undefined            | Callback when model is loaded                  |

### Enhanced Animation Options

| Option               | Type     | Default | Description                                       |
| -------------------- | -------- | ------- | ------------------------------------------------- |
| `animationIntensity` | number   | 0.02    | Intensity of the noise-based particle animation   |
| `animationSpeed`     | number   | 0.5     | Speed of the animation effects                    |
| `glowIntensity`      | number   | 1.2     | Intensity of the particle glow effect             |

### Multi-Model Mode Options

| Option      | Type          | Default   | Description                                    |
| ----------- | ------------- | --------- | ---------------------------------------------- |
| `sections`  | SectionData[] | undefined | Array of section data for multi-model morphing |

## Advanced Shader Features

The particle system uses sophisticated GLSL shaders that include:

- Perlin noise-based animation with FBM (Fractional Brownian Motion)
- Distance-based attenuation for realistic particle sizing
- Dynamic glow effects with pulse animation
- Smooth color interpolation during morphing transitions
- Custom lighting calculations for depth and realism

## Section Component

The `Section` component provides a complete UI wrapper for displaying 3D models with text content:

```tsx
import Section from "@/components/section";

<Section
  title="Your Section Title"
  description="Your section description text goes here."
  modelPath="/models/your-model.glb"
  reverse={false}
  index={0}
  fullWidthModel={true}
  scale={1.5}
  particleColor="#6e56cf"
  // ...other particle options
/>
```

## Performance Considerations

- **Particle Density**: Lower the `particleDensity` value for complex models or lower-end devices
- **Animation Intensity**: Reduce `animationIntensity` for smoother performance on mobile
- **Model Complexity**: Simpler models with fewer vertices will perform better as particle systems
- **Glow Effects**: The `glowIntensity` parameter can be reduced to improve performance
- **Mobile Optimization**: The system automatically adjusts for mobile devices

## Requirements

- Next.js 13+
- React 18+
- Three.js
- Framer Motion
- TypeScript
- Tailwind CSS

## Browser Support

The particle system works in all modern browsers that support WebGL:

- Chrome 9+
- Firefox 4+
- Safari 5.1+
- Edge 12+

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgments

- Three.js for the 3D rendering capabilities
- Next.js for the React framework
- The shader code is inspired by various particle system techniques from the Three.js community

---

## Project Structure

```
.
├── next-env.d.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   └── models
│       ├── blob
│       │   ├── license.txt
│       │   ├── model3.gltf
│       │   └── scene.bin
│       ├── brain
│       │   ├── license.txt
│       │   ├── model3.gltf
│       │   ├── scene.bin
│       │   └── textures
│       │       ├── Hj__rna3_1_baseColor.jpeg
│       │       ├── Hj__rna3_1_metallicRoughness.png
│       │       └── Hj__rna3_1_normal.png
│       ├── model1.glb
│       ├── model2.glb
│       ├── model3.glb
│       ├── model4.glb
│       ├── model5.glb
│       └── model7.glb
├── readme.md
├── src
│   ├── app
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx       # Main application with sections and multi-model setup
│   ├── components
│   │   ├── model-viewer.tsx  # Core particle system component
│   │   ├── section.tsx       # Section UI component
│   │   └── ui
│   │       └── container.tsx
│   ├── lib
│   │   └── utils.ts
│   └── types
│       └── index.ts         # Contains SectionData interface
├── tailwind.config.js
└── tsconfig.json
```
