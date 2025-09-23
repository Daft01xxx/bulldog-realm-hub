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
        // Infinite falling animation - reset when coin reaches bottom
        const fallProgress = ((adjustedTime % animationDuration) / animationDuration);
        const currentY = 18 - (fallProgress * 36); // From +18 to -18 (below screen)
        meshRef.current.position.y = currentY;
        
        // 3D rotation around all axes
        meshRef.current.rotation.x = adjustedTime * 1.5;
        meshRef.current.rotation.y = adjustedTime * 1.125;
        meshRef.current.rotation.z = adjustedTime * 0.6;
        
        // Opacity management - visible throughout most of fall
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        if (fallProgress < 0.05) {
          material.opacity = fallProgress * 14; // Quick fade in at start
        } else if (fallProgress > 0.92) {
          material.opacity = (1 - fallProgress) * 12.5; // Quick fade out at end
        } else {
          material.opacity = 0.7; // Stay visible throughout middle
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

export default function FallingCoins3D({ count = 25 }: FallingCoins3DProps) {
  const coins = Array.from({ length: count }, (_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 30, // x position - wider spread across screen
      15 + Math.random() * 10, // start from different heights
      (Math.random() - 0.5) * 20 // z position - deeper spread
    ] as [number, number, number],
    animationDelay: Math.random() * 15, // random delay up to 15 seconds  
    animationDuration: 8 + Math.random() * 12, // 8-20 seconds fall time
    scale: 0.6 + Math.random() * 0.8 // varied coin sizes
  }));

  return (
    <Canvas
      className="fixed inset-0 pointer-events-none z-5"
      camera={{ position: [0, 0, 12], fov: 60 }}
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