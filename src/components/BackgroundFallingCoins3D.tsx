import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import bulldogCoinImage from '@/assets/bulldog-coin.png';

interface BackgroundCoin3DProps {
  position: [number, number, number];
  animationDelay: number;
  animationDuration: number;
  scale: number;
}

function BackgroundCoin3D({ position, animationDelay, animationDuration, scale }: BackgroundCoin3DProps) {
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
        const currentY = 8 - (fallProgress * 20); // From +8 to -12 (below screen)
        meshRef.current.position.y = currentY;
        
        // Slower 3D rotation for background effect
        meshRef.current.rotation.x = adjustedTime * 0.8;
        meshRef.current.rotation.y = adjustedTime * 0.6;
        meshRef.current.rotation.z = adjustedTime * 0.3;
        
        // Very subtle opacity for background effect
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        if (fallProgress < 0.1) {
          material.opacity = fallProgress * 2; // Quick fade in at start
        } else if (fallProgress > 0.9) {
          material.opacity = (1 - fallProgress) * 10; // Quick fade out at end
        } else {
          material.opacity = 0.2; // Stay very subtle throughout middle
        }
      } else {
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.opacity = 0;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <cylinderGeometry args={[1, 1, 0.08, 16]} />
      <meshStandardMaterial 
        map={texture}
        transparent
        opacity={0.2}
        metalness={0.4}
        roughness={0.3}
        emissive="#1a1408" 
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

interface BackgroundFallingCoins3DProps {
  count?: number;
}

export default function BackgroundFallingCoins3D({ count = 25 }: BackgroundFallingCoins3DProps) {
  const coins = Array.from({ length: count }, (_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 30, // x position - very wide spread
      8 + Math.random() * 6, // start from different heights
      (Math.random() - 0.5) * 25 // z position - deep spread for background
    ] as [number, number, number],
    animationDelay: Math.random() * 15, // random delay up to 15 seconds  
    animationDuration: 10 + Math.random() * 12, // 10-22 seconds fall time (slower)
    scale: 0.3 + Math.random() * 0.4 // very small coin sizes (0.3-0.7)
  }));

  return (
    <Canvas
      className="fixed inset-0 pointer-events-none z-0"
      camera={{ position: [0, 0, 12], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight 
        position={[8, 8, 8]} 
        intensity={0.4}
        color="#ffd700" 
      />
      <pointLight 
        position={[-8, -8, 8]} 
        intensity={0.2}
        color="#ff8c00" 
      />
      
      {coins.map((coin) => (
        <BackgroundCoin3D
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