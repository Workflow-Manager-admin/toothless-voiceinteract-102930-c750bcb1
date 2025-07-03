import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

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
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 12, 6]} intensity={1} />
        <Suspense fallback={null}>
          <ToothlessGLTF modelUrl={modelUrl} />
        </Suspense>
        <OrbitControls enablePan={false} target={[0, 0.35, 0]} minDistance={2.2} maxDistance={5} />
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
