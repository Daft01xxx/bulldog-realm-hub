import { useRef, Suspense } from 'react';
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
  
  // Use try-catch pattern with fallback
  let texture: THREE.Texture | null = null;
  try {
    texture = useLoader(TextureLoader, bulldogCoinImage);
    // Set texture properties for better appearance
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }
  } catch (error) {
    console.warn('Failed to load coin texture:', error);
  }
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const adjustedTime = time - animationDelay;
      
      if (adjustedTime > 0) {
        // Infinite falling animation - reset when coin reaches bottom
        const fallProgress = ((adjustedTime % animationDuration) / animationDuration);
        const currentY = 12 - (fallProgress * 28); // From +12 to -16 (below screen)
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
        color={texture ? "#ffffff" : "#ffd700"} // Fallback golden color if texture fails
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

function FallingCoinsScene({ count }: { count: number }) {
  const coins = Array.from({ length: count }, (_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 20, // x position - wider spread across screen
      12 + Math.random() * 8, // start from different heights
      (Math.random() - 0.5) * 16 // z position - deeper spread
    ] as [number, number, number],
    animationDelay: Math.random() * 10, // random delay up to 10 seconds  
    animationDuration: 6 + Math.random() * 8, // 6-14 seconds fall time
    scale: 0.8 + Math.random() * 0.6 // varied coin sizes
  }));

  return (
    <>
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
    </>
  );
}

interface FallingCoins3DProps {
  count?: number;
}

export default function FallingCoins3D({ count = 15 }: FallingCoins3DProps) {
  return (
    <Canvas
      className="fixed inset-0 pointer-events-none z-5"
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <FallingCoinsScene count={count} />
      </Suspense>
    </Canvas>
  );
}