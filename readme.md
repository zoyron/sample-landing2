# Particle Model Viewer for Next.js

A Next.js application that transforms 3D models into dynamic, animated particle systems. This project uses Three.js and custom GLSL shaders to create visually stunning, high-performance particle effects for web applications.

## Features

- **3D Model to Particle Conversion**: Automatically converts any 3D model (GLB/GLTF) into a dynamic particle system
- **GPU-Accelerated Animation**: Uses custom GLSL shaders for optimal performance
- **Responsive Design**: Adapts to different screen sizes with mobile-friendly layouts
- **Customizable Particle Effects**: Control particle size, color, density, and animation
- **Optimized Performance**: Efficiently handles thousands of particles with minimal impact on page performance
- **Seamless Scrolling**: Models rotate automatically without interfering with page scrolling

## Demo

The application showcases various 3D models converted to particles, displayed in alternating sections with descriptive text.

## Installation

```bash
# Clone the repository
git clone https://github.com/zoyron/sentigen.git

# Navigate to the project directory
cd sentigen

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## How It Works

The project uses Three.js to load 3D models and convert them into particle systems. Each vertex in the model is sampled (based on the density setting) and rendered as a dynamic particle. Custom GLSL shaders add subtle movements and visual effects to create a living, breathing appearance.

### Key Components

- **model-viewer.tsx**: The core component that handles loading 3D models and converting them to particles
- **section.tsx**: Displays each section with a particle model and descriptive text
- **types/index.ts**: Contains TypeScript interfaces for the particle system

## Usage

To use the particle model viewer in your own sections:

```tsx
import ModelViewer from "@/components/model-viewer";

// Basic usage
<ParticleModelViewer
  modelPath="/models/your-model.glb"
  className="w-full h-full"
/>

// With customization
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
  onModelLoaded={() => console.log("Model loaded!")}
/>
```

## Customization Options

The particle system supports several customization options:

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

## Integrating the Particle System into Other Projects

To use just the Three.js particle system in your own project:

1. Copy the following files:

   - `src/components/model-viewer.tsx`
   - Update `src/types/index.ts` to include the particle-related interfaces

2. Ensure you have the necessary dependencies:

   ```bash
   npm install three @types/three
   ```

3. If you're using the component with sections, also copy:

   - `src/components/section.tsx`
   - Ensure your project has framer-motion installed if using animations

4. Place your 3D models in the `public/models/` directory or update the paths accordingly

## Performance Considerations

- **Particle Density**: Lower the `particleDensity` value for complex models or lower-end devices
- **Shader Animation**: Set `useShaderAnimation` to `false` for simpler rendering if performance is an issue
- **Model Complexity**: Simpler models with fewer vertices will perform better as particle systems
- **Mobile Optimization**: The system automatically adjusts for mobile devices

## Requirements

- Next.js 13+
- React 18+
- Three.js
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
│       ├── model1.glb
│       ├── model2.glb
│       ├── model3.glb
│       ├── model4.glb
│       ├── model5.glb
│       ├── model6.gltf
│       └── scene.bin
├── readme.md
├── src
│   ├── app
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── model-viewer.tsx         # Model viewer with particle system
│   │   ├── section.tsx              # Section component
│   │   └── ui
│   │       └── container.tsx
│   ├── lib
│   │   └── utils.ts
│   └── types
│       └── index.ts                 # Contains SectionData interface
├── tailwind.config.js
└── tsconfig.json
```
