import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Stars, Icosahedron, Torus, Octahedron } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

const Phone = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.4; });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1.4, 2.8, 0.18]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.095]}>
        <boxGeometry args={[1.25, 2.6, 0.01]} />
        <meshBasicMaterial color="#8B5CF6" />
      </mesh>
    </group>
  );
};

const Shape = ({ Component, position, color }: any) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.3;
      ref.current.rotation.y = clock.getElapsedTime() * 0.4;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <Component ref={ref} args={[0.4, 0]} position={position}>
        <meshStandardMaterial color={color} wireframe />
      </Component>
    </Float>
  );
};

const HeroScene = () => (
  <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
    <Suspense fallback={null}>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={2} color="#8B5CF6" />
      <pointLight position={[-3, -3, 2]} intensity={1.5} color="#06B6D4" />
      <Stars radius={50} depth={50} count={1500} factor={3} fade speed={0.5} />
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <Phone />
      </Float>
      <Shape Component={Torus} position={[2.2, 1.3, 0]} color="#8B5CF6" />
      <Shape Component={Icosahedron} position={[-2.2, 1.2, 0]} color="#06B6D4" />
      <Shape Component={Octahedron} position={[2.0, -1.4, 0.5]} color="#10B981" />
      <Shape Component={Torus} position={[-2.0, -1.3, 0.5]} color="#8B5CF6" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Suspense>
  </Canvas>
);

export default HeroScene;
