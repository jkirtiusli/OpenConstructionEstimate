'use client';

import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Center,
  Float,
  useProgress,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

/* ============================================
   TYPE DEFINITIONS
   ============================================ */

interface BIMViewerProps {
  /** Custom class name for the container */
  className?: string;
  /** Height of the viewer - defaults to 400px */
  height?: number | string;
  /** Whether to show the floating animation on the model */
  enableFloat?: boolean;
  /** Whether to auto-rotate the camera */
  autoRotate?: boolean;
  /** Auto-rotate speed (default: 0.5) */
  autoRotateSpeed?: number;
  /** Callback when the viewer is ready */
  onReady?: () => void;
}

interface PlaceholderBuildingProps {
  enableFloat?: boolean;
}

/* ============================================
   DESIGN SYSTEM CONSTANTS
   Premium colors and materials from Calm Tech
   ============================================ */

const COLORS = {
  // Apple-inspired light background - NOT black
  background: '#F5F5F7',
  // Clay material for elegant placeholder
  clay: '#E8E8E8',
  clayAccent: '#D4D4D4',
  // Accent for interactive elements
  accent: '#0066CC',
  // Glass material
  glass: 'rgba(255, 255, 255, 0.3)',
} as const;

const MATERIAL_CONFIG = {
  // Clay render aesthetic - matte, warm white
  roughness: 0.8,
  metalness: 0.0,
} as const;

/* ============================================
   LOADING SKELETON
   Premium loading state with shimmer effect
   ============================================ */

function LoadingSkeleton({ height }: { height: number | string }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-cloud"
      style={{ height }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer" />

      {/* Centered loading indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-border-soft animate-pulse" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-3 w-24 rounded-full bg-border-soft animate-pulse" />
          <div className="h-2 w-16 rounded-full bg-border-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   3D LOADING INDICATOR
   Shown while models are loading in the Canvas
   ============================================ */

function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-paper/90 backdrop-blur-md shadow-soft-lg">
        {/* Progress ring */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            {/* Background circle */}
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="#E5E5E7"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="#0066CC"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={125.6}
              strokeDashoffset={125.6 * (1 - progress / 100)}
              className="transition-all duration-300 ease-out"
            />
          </svg>
        </div>

        {/* Progress text */}
        <div className="text-center">
          <p className="text-sm font-medium text-carbon">
            Loading Model
          </p>
          <p className="text-xs text-subtle tabular-nums">
            {progress.toFixed(0)}%
          </p>
        </div>
      </div>
    </Html>
  );
}

/* ============================================
   PLACEHOLDER BUILDING MODEL
   Elegant architectural form for demo
   ============================================ */

function PlaceholderBuilding({ enableFloat = true }: PlaceholderBuildingProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle idle animation
  useFrame((state) => {
    if (groupRef.current && !enableFloat) {
      // Very subtle breathing animation when float is disabled
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  // Clay material - premium matte finish
  const clayMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.clay,
    roughness: MATERIAL_CONFIG.roughness,
    metalness: MATERIAL_CONFIG.metalness,
  });

  // Slightly darker clay for accent elements
  const clayAccentMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.clayAccent,
    roughness: MATERIAL_CONFIG.roughness,
    metalness: MATERIAL_CONFIG.metalness,
  });

  const BuildingGeometry = () => (
    <group ref={groupRef}>
      {/* Main building body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow material={clayMaterial}>
        <boxGeometry args={[2, 3, 1.5]} />
      </mesh>

      {/* Tower section */}
      <mesh position={[0.6, 2.75, 0]} castShadow receiveShadow material={clayMaterial}>
        <boxGeometry args={[0.8, 2.5, 1]} />
      </mesh>

      {/* Lower wing */}
      <mesh position={[-1.2, 0.75, 0]} castShadow receiveShadow material={clayMaterial}>
        <boxGeometry args={[1.2, 1.5, 1.2]} />
      </mesh>

      {/* Entrance canopy */}
      <mesh position={[0, 0.15, 1]} castShadow receiveShadow material={clayAccentMaterial}>
        <boxGeometry args={[1.2, 0.1, 0.5]} />
      </mesh>

      {/* Rooftop element */}
      <mesh position={[0.6, 4.1, 0]} castShadow receiveShadow material={clayAccentMaterial}>
        <boxGeometry args={[0.4, 0.2, 0.4]} />
      </mesh>

      {/* Window grid lines (decorative) */}
      {[0.6, 1.2, 1.8, 2.4].map((y, i) => (
        <mesh
          key={`window-line-${i}`}
          position={[0, y, 0.76]}
          material={clayAccentMaterial}
        >
          <boxGeometry args={[1.8, 0.02, 0.02]} />
        </mesh>
      ))}

      {/* Vertical grid lines */}
      {[-0.6, 0, 0.6].map((x, i) => (
        <mesh
          key={`vert-line-${i}`}
          position={[x, 1.5, 0.76]}
          material={clayAccentMaterial}
        >
          <boxGeometry args={[0.02, 2.8, 0.02]} />
        </mesh>
      ))}

      {/* Base/foundation */}
      <mesh position={[0, -0.05, 0]} receiveShadow material={clayAccentMaterial}>
        <boxGeometry args={[3.5, 0.1, 2.5]} />
      </mesh>
    </group>
  );

  // Wrap in Float component if enabled
  if (enableFloat) {
    return (
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.3}
        floatingRange={[-0.05, 0.05]}
      >
        <BuildingGeometry />
      </Float>
    );
  }

  return <BuildingGeometry />;
}

/* ============================================
   STUDIO LIGHTING SETUP
   Professional three-point lighting system
   ============================================ */

function StudioLighting() {
  return (
    <>
      {/* Key Light - Primary illumination from upper-left */}
      <directionalLight
        position={[-5, 8, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      {/* Fill Light - Soften shadows */}
      <ambientLight intensity={0.4} />

      {/* Rim Light - Edge definition from back */}
      <directionalLight
        position={[5, 3, -5]}
        intensity={0.3}
        color="#ffffff"
      />

      {/* Subtle bottom fill to prevent harsh shadows */}
      <hemisphereLight
        intensity={0.2}
        groundColor="#E8E8E8"
        color="#ffffff"
      />
    </>
  );
}

/* ============================================
   SCENE COMPONENT
   Main 3D scene with all elements
   ============================================ */

interface SceneProps {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableFloat: boolean;
  onReady?: () => void;
}

function Scene({ autoRotate, autoRotateSpeed, enableFloat, onReady }: SceneProps) {
  const controlsRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Mark scene as ready after first render
  useFrame(() => {
    if (!isReady) {
      setIsReady(true);
      onReady?.();
    }
  });

  return (
    <>
      {/* Camera with architectural FOV */}
      <PerspectiveCamera
        makeDefault
        position={[6, 4, 6]}
        fov={45}
        near={0.1}
        far={1000}
      />

      {/* Studio lighting setup */}
      <StudioLighting />

      {/* Soft environment lighting */}
      <Environment preset="city" />

      {/* Model centered in scene */}
      <Center>
        <Suspense fallback={<Loader />}>
          <PlaceholderBuilding enableFloat={enableFloat} />
        </Suspense>
      </Center>

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, -0.1, 0]}
        opacity={0.3}
        scale={12}
        blur={2.5}
        far={4}
        color="#1A1A1A"
      />

      {/* Orbit controls with smooth damping */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={4}
        maxDistance={20}
        enablePan={true}
        panSpeed={0.5}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}

/* ============================================
   MAIN BIM VIEWER COMPONENT
   Premium 3D model viewer with all features
   ============================================ */

export function BIMViewer({
  className,
  height = 400,
  enableFloat = true,
  autoRotate = false,
  autoRotateSpeed = 0.5,
  onReady,
}: BIMViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle canvas ready state
  const handleCanvasReady = useCallback(() => {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setIsLoading(false);
      onReady?.();
    }, 100);
  }, [onReady]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'shadow-soft-lg',
        'transition-all duration-300 ease-out',
        className
      )}
      style={{ height }}
    >
      {/* Loading skeleton - shown while Canvas initializes */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <LoadingSkeleton height="100%" />
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        style={{
          background: COLORS.background,
        }}
        onCreated={() => {
          // Canvas created, start loading models
        }}
      >
        <color attach="background" args={[COLORS.background]} />

        <Scene
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          enableFloat={enableFloat}
          onReady={handleCanvasReady}
        />
      </Canvas>

      {/* Corner controls overlay */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
        <div className="px-3 py-1.5 rounded-lg bg-paper/80 backdrop-blur-sm shadow-soft-sm">
          <span className="text-xs text-subtle">
            Drag to rotate
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   SAMPLE USAGE & EXPORTS
   ============================================ */

// Default export for convenient imports
export default BIMViewer;

/**
 * Usage Example:
 *
 * ```tsx
 * import { BIMViewer } from '@/components/domain/bim/BIMViewer';
 *
 * function ProjectPage() {
 *   return (
 *     <div className="p-6">
 *       <h2 className="text-title mb-4">Project Model</h2>
 *       <BIMViewer
 *         height={500}
 *         enableFloat={true}
 *         autoRotate={false}
 *         onReady={() => console.log('Viewer ready!')}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Props:
 * - className: Additional CSS classes for the container
 * - height: Viewer height (number in px or string like '50vh')
 * - enableFloat: Enable subtle floating animation on the model
 * - autoRotate: Enable automatic camera rotation
 * - autoRotateSpeed: Speed of auto-rotation (default: 0.5)
 * - onReady: Callback fired when viewer is fully loaded
 */
