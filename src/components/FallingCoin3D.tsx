import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import bulldogCoinImage from '@/assets/bulldog-coin.png';

interface Coin3DProps {
  position: [number, number, number];
  animationDelay: number;
  animationDuration: number;
  scale: number;
}

function Coin3D({ position, animationDelay, animationDuration, scale }: Coin3DProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useLoader(TextureLoader, bulldogCoinImage);
  
  // Set texture properties for better appearance
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const adjustedTime = time - animationDelay;
      
      if (adjustedTime > 0) {
        // Falling animation from top to bottom of page (to "пиши нам")
        const fallProgress = ((adjustedTime % animationDuration) / animationDuration);
        meshRef.current.position.y = 12 - (fallProgress * 24); // From +12 to -12 (full page)
        
        // 3D rotation around all axes - 1.5x faster than before
        meshRef.current.rotation.x = adjustedTime * 1.5;
        meshRef.current.rotation.y = adjustedTime * 1.125;
        meshRef.current.rotation.z = adjustedTime * 0.6;
        
        // Opacity fade in/out
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        if (fallProgress < 0.1) {
          material.opacity = fallProgress * 7; // Fade in
        } else if (fallProgress > 0.9) {
          material.opacity = (1 - fallProgress) * 7; // Fade out
        } else {
          material.opacity = 0.7; // Darker opacity
        }
      } else {
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.opacity = 0;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <cylinderGeometry args={[1, 1, 0.1, 32]} />
      <meshStandardMaterial 
        map={texture}
        transparent
        opacity={0.7}
        metalness={0.3}
        roughness={0.4}
        emissive="#2a1810" // Darker brown emissive color
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

interface FallingCoins3DProps {
  count?: number;
}

export default function FallingCoins3D({ count = 5 }: FallingCoins3DProps) {
  const coins = Array.from({ length: count }, (_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 14, // x position - wider spread
      12, // start from top
      (Math.random() - 0.5) * 10 // z position - deeper spread
    ] as [number, number, number],
    animationDelay: i * 0.6, // 2x smaller delay between coins (was 1.2, now 0.6)
    animationDuration: 8 + Math.random() * 4, // 1.5x faster than previous (was 12+6, now 8+4)
    scale: 2.5 + Math.random() * 1 // Much larger coins
  }));

  return (
    <Canvas
      className="fixed inset-0 pointer-events-none z-0"
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8}
        color="#ffd700" // Golden light
      />
      <pointLight 
        position={[-5, -5, 5]} 
        intensity={0.4}
        color="#ff8c00" // Orange accent light
      />
      
      {coins.map((coin) => (
        <Coin3D
          key={coin.id}
          position={coin.position}
          animationDelay={coin.animationDelay}
          animationDuration={coin.animationDuration}
          scale={coin.scale}
        />
      ))}
    </Canvas>
  );
}