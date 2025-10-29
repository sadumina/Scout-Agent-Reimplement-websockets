import React, { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Stars, OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";

import globeTexture from "./assets/haycarb.png";  // ✅ <-- correct path

function RotatingGlobe() {
  const texture = useLoader(THREE.TextureLoader, globeTexture);

  return (
    <mesh rotation={[0.2, 0.6, 0]}>
      <sphereGeometry args={[1.6, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function WorldBackground() {
  return (
    <motion.div className="world-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <RotatingGlobe />
          <Stars radius={100} depth={70} count={2500} factor={3} fade speed={0.8} />
        </Suspense>
        <OrbitControls
  enableZoom={false}
  enablePan={false}
  autoRotate
  autoRotateSpeed={-1.5}   // ⬅️ negative value = opposite direction
/>
      </Canvas>
    </motion.div>
  );
}
