import React, { useRef, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three'; // Import for smooth transition

// 1. Component to render the 3D model and apply static transformations
// Accept the currentSection prop
const Card = ({ currentSection }) => { 
  const group = useRef();
  const { scene } = useGLTF('/credit_card.glb'); 
  
  // Use useSpring to animate the rotation for the tilt effect
  const { rotationX } = useSpring({
    rotationX: currentSection === 'no-fees' ? Math.PI / 4 : 0, // 45 degrees tilt for No Fees
    config: { mass: 1, tension: 280, friction: 60 },
  });

  // Use useLayoutEffect to set the initial pose immediately
  useLayoutEffect(() => {
    if (group.current) {
      // 1. Initial Card Orientation: Front-facing
      // group.current.rotation.x = 0; // Handled by useSpring
      
      // 2. CRITICAL FIX: Center the card vertically by setting a larger negative Y-offset.
      group.current.position.set(0, -1.5, 0); 
    }
  }, []);

  return (
    // Apply the animated rotation
    <animated.group 
      ref={group} 
      rotation-x={rotationX}
    >
      {/* Scale set to 4.75 to occupy space */}
      <primitive object={scene} scale={4.75} /> 
    </animated.group>
  );
};

// 2. Main wrapper component for the 3D scene
// Accept the currentSection prop
const CardModel = ({ currentSection }) => { 
  return (
    <Canvas 
      className="card-3d-canvas"
      camera={{ position: [0, 0, 10], fov: 50 }} 
    >
      <ambientLight intensity={1.0} /> 
      <hemisphereLight skyColor={0xffffff} groundColor={0x000000} intensity={0.5} />
      <directionalLight position={[0, 5, 10]} intensity={0.3} color={0xffffff} />
      <directionalLight position={[-10, 0, 5]} intensity={4} color={0xaaaaaa} />
      
      <Card currentSection={currentSection} /> 
    </Canvas>
  );
};

export default CardModel;