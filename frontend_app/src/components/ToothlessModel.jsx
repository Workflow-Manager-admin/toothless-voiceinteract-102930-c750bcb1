import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
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

/**
 * PUBLIC_INTERFACE
 * ToothlessModel React component
 * Adds optional subtle talking animation synced to ElevenLabs audio playback.
 * Accepts prop isSpeaking (boolean) to indicate if Toothless should animate mouth.
 */
export default function ToothlessModel({ modelUrl, isSpeaking = false, ...props }) {
  /**
   * 3D viewer for Toothless .glb model using react-three-fiber and drei.
   * @param {string} modelUrl - Path or URL to toothless's .glb model.
   * @param {boolean} isSpeaking - Whether Toothless should animate talking
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
          <ToothlessGLTF modelUrl={modelUrl} isSpeaking={isSpeaking} />
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
/**
 * Loads the Toothless .glb model asset and applies "talking" animation if isSpeaking is true.
 * If the inner mesh is not found, applies fallback head bob instead.
 */
function ToothlessGLTF({ modelUrl, isSpeaking }) {
  /**
   * Loads the Toothless .glb model asset.
   * @param {string} modelUrl - URL to .glb file
   * @param {boolean} isSpeaking - Whether Toothless should animate talking
   */
  const { scene } = useGLTF(modelUrl);
  const [mouthNode, setMouthNode] = useState(null);
  const [modelRoot, setModelRoot] = useState(null);
  const mouthAnimProgress = useRef(0);
  const speed = 3.5 + Math.random(); // randomizes talking speed a little

  // Try to find mouth or jaw node once model is loaded
  useEffect(() => {
    if (!scene) return;

    // Try to find nodes likely to be the jaw/mouth by common names, fallback to null
    let foundMouth = null;
    scene.traverse((node) => {
      if (!foundMouth && node.name) {
        const lowerName = node.name.toLowerCase();
        if (
          lowerName.includes("mouth") ||
          lowerName.includes("jaw") ||
          lowerName.includes("open") ||
          lowerName.includes("lip")
        ) {
          foundMouth = node;
        }
      }
    });
    setMouthNode(foundMouth || null);
    setModelRoot(scene);
  }, [scene]);

  // Animate mouth or, if not found, bob the head root
  useFrame((state, delta) => {
    // Animation only runs when isSpeaking is true
    if (!modelRoot) return;

    // Subtle smooth animation: open/close at approx syllabic talking speed
    if (isSpeaking) {
      mouthAnimProgress.current += delta * (2.2 + Math.sin(state.clock.getElapsedTime() * 0.7));

      // Animate mouth node if present (vertical rotation)
      if (mouthNode) {
        // Range: clamp between closed (0) to open (~0.4 radians)
        const openAmount =
          0.15 + 0.11 * Math.abs(Math.sin(mouthAnimProgress.current * speed));
        mouthNode.rotation.x = -openAmount; // negative so mouth/jaw opens downward
      } else if (modelRoot) {
        // Fallback: bob the whole model's head up/down slightly
        modelRoot.position.y = -0.3 + 0.04 * Math.sin(mouthAnimProgress.current * (speed * 0.8));
        modelRoot.rotation.x = 0.03 * Math.sin(mouthAnimProgress.current * (speed * 0.5));
      }
    } else {
      // Reset to default pose when not speaking
      if (mouthNode) mouthNode.rotation.x = 0;
      if (modelRoot) {
        modelRoot.position.y = -0.3;
        modelRoot.rotation.x = 0;
      }
    }
  });

  // Model is always scaled and positioned the same on load
  return <primitive object={scene} scale={1.7} position={[0, -0.3, 0]} />;
}
