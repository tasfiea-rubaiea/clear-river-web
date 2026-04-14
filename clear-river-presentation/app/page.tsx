"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, Scroll, useScroll, Environment, Float, Sphere, useProgress, Html } from "@react-three/drei";
import { useRef, useMemo, useState, Suspense } from "react";
import * as THREE from "three";

// --- 1. THE CUSTOM LOADER ---
function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center pointer-events-none">
        <div className="text-5xl font-light text-white mb-2 font-mono">
          {progress.toFixed(0)}%
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-sky-500">
          Initializing Environment
        </div>
      </div>
    </Html>
  );
}

// --- 2. THE 3D PARTICLES ---
function ReactiveParticles() {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 10 - 5,
      scale: 0.05 + Math.random() * 0.1,
    }));
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const offset = scroll.offset;
    groupRef.current.rotation.y += delta * 0.05;

    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      const targetX = Math.sin(i) * 1.5; 
      const targetY = (i / 50) * 8 - 4; 
      const targetZ = Math.cos(i) * 1.5;

      const compressionFactor = Math.max(0, (offset - 0.25) * 4); 
      const clampedCompression = Math.min(1, compressionFactor);

      const fadeFactor = Math.max(0, (offset - 0.75) * 5);
      const clampedFade = Math.min(1, fadeFactor);

      child.position.x = THREE.MathUtils.lerp(p.x, targetX, clampedCompression);
      child.position.y = THREE.MathUtils.lerp(p.y, targetY, clampedCompression) - (clampedFade * 5);
      child.position.z = THREE.MathUtils.lerp(p.z, targetZ, clampedCompression);
      
      child.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material) {
            const startColor = new THREE.Color("#0ea5e9"); 
            const endColor = new THREE.Color("#27272a");   
            material.color.lerpColors(startColor, endColor, clampedCompression);
            material.emissiveIntensity = THREE.MathUtils.lerp(0.8, 0, clampedCompression);
            material.transparent = true;
            material.opacity = 1 - clampedFade;
          }
        }
      });
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <Float key={i} speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
          <Sphere args={[p.scale, 16, 16]} position={[p.x, p.y, p.z]}>
            <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.8} roughness={0.2} />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

// --- 3. MAIN PAGE COMPONENT ---
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="w-full h-screen bg-zinc-950 overflow-hidden relative select-none">
      
      {/* 3D CANVAS */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        <Suspense fallback={<CanvasLoader />}>
          <ScrollControls pages={5} damping={0.2}>
            <Scroll>
              <ReactiveParticles />
            </Scroll>

            <Scroll html style={{ width: "100%", height: "100%" }}>
              
              {/* PAGE 1: HERO */}
              <section className="h-screen flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-5xl md:text-7xl font-light tracking-widest text-white uppercase mb-6">
                  Clear<span className="font-bold text-sky-500">River</span>
                </h1>
                <p className="text-zinc-400 tracking-wide text-lg max-w-2xl">
                  Decentralized Wastewater Intelligence. 
                </p>
                <div className="absolute bottom-10 animate-bounce text-zinc-500 text-sm tracking-widest">
                  SCROLL TO EXPLORE ↓
                </div>
              </section>

              {/* PAGE 2: THE PROBLEM */}
              <section className="h-screen flex items-center justify-start px-10 md:px-32 pointer-events-none">
                <div className="max-w-lg pointer-events-auto">
                  <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-white tracking-wide">The Dual Crisis</h2>
                  <div className="h-px w-12 bg-sky-500 mb-6"></div>
                  <p className="text-zinc-400 leading-relaxed mb-4 text-lg">
                    Unregulated synthetic textile dyes frequently produce hypoxic conditions in vital waterways. 
                  </p>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    Simultaneously, millions of tonnes of rice husks are routinely incinerated, compounding air-quality degradation.
                  </p>
                </div>
              </section>

              {/* PAGE 3: THE CHEMISTRY */}
              <section className="h-screen flex items-center justify-end px-10 md:px-32 text-right pointer-events-none">
                <div className="max-w-lg pointer-events-auto">
                  <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-white tracking-wide">Bio-char Activation</h2>
                  <div className="h-px w-12 bg-sky-500 mb-6 ml-auto"></div>
                  <p className="text-zinc-400 leading-relaxed text-lg mb-4">
                    Oryza sativa husks are carbonised at 400°C under anaerobic conditions. 
                  </p>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    This yields a highly porous bio-char adsorbent that captures organic dye molecules via physisorption and dispersion forces.
                  </p>
                </div>
              </section>

              {/* PAGE 4: THE PIPELINE */}
              <section className="h-screen flex items-center justify-start px-10 md:px-32 pointer-events-none">
                <div className="max-w-xl pointer-events-auto">
                  <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-white tracking-wide">The IoT Pipeline</h2>
                  <div className="h-px w-12 bg-emerald-500 mb-6"></div>
                  
                  <div className="space-y-6 text-zinc-400">
                    <div>
                      <h3 className="text-emerald-400 font-medium tracking-wider uppercase text-sm mb-1">Tier 1: Middleware</h3>
                      <p>A Node.js daemon polls the serial port and applies a 5-point moving-average noise filter.</p>
                    </div>
                    <div>
                      <h3 className="text-emerald-400 font-medium tracking-wider uppercase text-sm mb-1">Tier 2: Kinetic Dashboard</h3>
                      <p>Continuously refits the first-order kinetic decay model using weighted least-squares regression.</p>
                    </div>
                    <div>
                      <h3 className="text-emerald-400 font-medium tracking-wider uppercase text-sm mb-1">Tier 3: Compliance Engine</h3>
                      <p>Autonomously generates a tamper-evident, SHA-256 hashed PDF compliance report.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* PAGE 5: THE RESULTS */}
              <section className="h-screen flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                {/* Mobile scroll fix applied here: max-h-[85dvh], overflow-y-auto, hidden scrollbars */}
                <div className="pointer-events-auto bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-6 md:p-12 rounded-2xl w-full max-w-4xl max-h-[85dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <h2 className="text-2xl font-medium text-zinc-400 uppercase tracking-widest mb-8 mt-4 md:mt-0">Performance Validated</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-left">
                    <div>
                      <div className="text-5xl font-bold text-sky-400 mb-2">93%</div>
                      <div className="text-zinc-300 font-medium text-lg mb-1">Pollutant Mass Removal</div>
                      <div className="text-zinc-500 text-sm">Achieved in a continuous-flow 300s operational window.</div>
                    </div>
                    
                    <div>
                      <div className="text-5xl font-bold text-emerald-400 mb-2">&le;1000<span className="text-2xl ml-1">BDT</span></div>
                      <div className="text-zinc-300 font-medium text-lg mb-1">Instrumentation Cost</div>
                      <div className="text-zinc-500 text-sm">Accessible capital expenditure for SMEs.</div>
                    </div>
                  </div>

                  {/* Dark Mode Inverted Graphs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <img 
                      src="/fig1_calibration.png" 
                      alt="Calibration Graph" 
                      className="w-full h-auto rounded-lg invert hue-rotate-180 opacity-90"
                    />
                    <img 
                      src="/fig2_kinetic.png" 
                      alt="Kinetic Graph" 
                      className="w-full h-auto rounded-lg invert hue-rotate-180 opacity-90"
                    />
                  </div>

                  {/* Open Modal Button with bottom padding cushion for mobile nav bar */}
                  <div className="pb-8 md:pb-0">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="px-8 py-3 bg-zinc-100 text-zinc-950 font-semibold rounded-full hover:bg-sky-400 transition-colors duration-300 tracking-wide"
                    >
                      Read Full Research Paper
                    </button>
                  </div>
                </div>
              </section>

            </Scroll>
          </ScrollControls>
          <Environment preset="city" />
        </Suspense>
      </Canvas>

      {/* --- 4. THE PROTECTED PDF MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-lg p-4 md:p-10">
          <div className="relative w-full max-w-6xl h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="text-white font-medium tracking-wide">Project ClearRiver: Methodological Blueprint</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Protected PDF Container */}
            <div 
              className="relative flex-1 w-full h-full bg-zinc-800"
              onContextMenu={(e) => e.preventDefault()}
            >
              <iframe 
                src="/research_paper.pdf#toolbar=0&navpanes=0&scrollbar=0" 
                className="w-full h-full border-none"
                title="Research Paper Viewer"
              />
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}