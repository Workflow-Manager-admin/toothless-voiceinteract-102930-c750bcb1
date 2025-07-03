import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

/**
 * Lighting setup for Toothless 3D model viewer
 * Designed for clarity in both light/dark context, adds balanced soft ambient, fill, rim, and key lighting.
 */
function ToothlessLighting() {
  // PUBLIC_INTERFACE
  /**
   * Adds multiple light sources (ambient + several directionals) for rich, clear visual effect.
   */
  return (
    <>
      {/* Soft overall global illumination */}
      <ambientLight intensity={0.7} color="#fbfbfa" />
      {/* Key light from upper right/front */}
      <directionalLight
        position={[2, 9, 7]}
        intensity={1.52}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
      />
      {/* Rim light for silhouette/highlights from behind */}
      <directionalLight
        position={[-3, 5, -4]}
        intensity={0.52}
        color="#e0e5fb"
      />
      {/* Fill light from left for softer shadows */}
      <directionalLight
        position={[-6, 2, 5]}
        intensity={0.33}
        color="#cfe0ff"
      />
      {/* Soft warm fill from below/back for depth */}
      <directionalLight
        position={[0, -4, 3]}
        intensity={0.20}
        color="#fbe7d0"
      />
    </>
  );
}

// PUBLIC_INTERFACE
export default function ToothlessModel({ modelUrl, ...props }) {
  /**
   * 3D viewer for Toothless .glb model using react-three-fiber and drei.
   * @param {string} modelUrl - Path or URL to toothless's .glb model.
   */
  return (
    <div className="toothless-viewer" {...props}>
      <Canvas
        camera={{ position: [0, 0.6, 2.5], fov: 50 }}
        style={{ width: "100%", height: "370px", background: "var(--bg-secondary)" }}
        shadows
      >
        <ToothlessLighting />
        <Suspense fallback={null}>
          <ToothlessGLTF modelUrl={modelUrl} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          target={[0, 0.35, 0]}
          minDistance={2.2}
          maxDistance={5}
        />
      </Canvas>
    </div>
  );
}

// PUBLIC_INTERFACE
function ToothlessGLTF({ modelUrl }) {
  /**
   * Loads the Toothless .glb model asset.
   * @param {string} modelUrl - URL to .glb file
   */
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} scale={1.7} position={[0, -0.3, 0]} />;
}
