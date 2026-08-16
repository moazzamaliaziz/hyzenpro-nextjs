'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ParticleSphere() {
    const pointsRef = useRef<THREE.Points>(null);
    const outerPointsRef = useRef<THREE.Points>(null);

    const [positions, colors] = useMemo(() => {
        const count = 1800;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            const r = 2.0;
            pos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
            pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            pos[i * 3 + 2] = r * Math.cos(phi);

            color.setHSL(0, 0, Math.random() * 0.4 + 0.3); // Greys for monochrome look
            col[i * 3] = color.r;
            col[i * 3 + 1] = color.g;
            col[i * 3 + 2] = color.b;
        }
        return [pos, col];
    }, []);

    useFrame((state, delta) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += delta * 0.15;
            pointsRef.current.rotation.x += delta * 0.05;
        }
        if (outerPointsRef.current) {
            outerPointsRef.current.rotation.y -= delta * 0.1;
            outerPointsRef.current.rotation.z += delta * 0.05;
        }
    });

    return (
        <group>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} count={colors.length / 3} />
                </bufferGeometry>
                <pointsMaterial size={0.015} vertexColors transparent opacity={0.5} sizeAttenuation={true} depthWrite={false} />
            </points>
            <points ref={outerPointsRef} scale={1.2}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
                </bufferGeometry>
                <pointsMaterial size={0.005} color="#888888" transparent opacity={0.2} sizeAttenuation={true} depthWrite={false} />
            </points>
        </group>
    );
}

export default function NeuralGlobe() {
    const [isReducedMotion, setIsReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const syncMotionPreference = () => setIsReducedMotion(mediaQuery.matches);

        syncMotionPreference();
        mediaQuery.addEventListener('change', syncMotionPreference);

        return () => mediaQuery.removeEventListener('change', syncMotionPreference);
    }, []);

    if (isReducedMotion) return null;

    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-40 select-none">
            {/* Fade overlays to blend the globe into the page */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 dark:via-gray-950/50 to-white dark:to-gray-950 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 dark:via-gray-950/30 to-white dark:to-gray-950 z-10" />
            
            <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.5] }}>
                <ParticleSphere />
            </Canvas>
        </div>
    );
}
