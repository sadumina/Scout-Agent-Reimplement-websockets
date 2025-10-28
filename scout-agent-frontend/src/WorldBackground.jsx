// WorldBackground.jsx
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { motion } from "framer-motion";   // <-- ✅ FIX

function RotatingGlobe() {
  return (
    <mesh rotation={[0.4, 0.5, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#2E7D32"
        wireframe
        emissive="#3aff74"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function WorldBackground() {
  return (
    <motion.div
      className="world-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <RotatingGlobe />
          <Stars radius={50} depth={40} count={5000} factor={4} saturation={0} />
        </Suspense>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </motion.div>
  );
}
