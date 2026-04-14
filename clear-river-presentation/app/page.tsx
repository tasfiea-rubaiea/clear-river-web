"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, Scroll, useScroll, Environment, Float, Sphere, useProgress, Html } from "@react-three/drei";
import { useRef, useMemo, useState, Suspense, useEffect } from "react";
import * as THREE from "three";
import dynamic from "next/dynamic";

// DYNAMIC IMPORTS: This forces Next.js to skip SSR for the PDF viewer, preventing Vercel build crashes.
const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// --- 1. THE CUSTOM LOADER ---
function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center pointer-events-none">
        <div className="text-5xl font-light text-white mb-2 font-mono">{progress.toFixed(0)}%</div>
        <div className="text-xs uppercase tracking-[0.3em] text-sky-500">Initializing Environment</div>
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
  const [activeDocument, setActiveDocument] = useState<"paper" | "hardware" | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  
  // Vercel SSR Safety for the window object
  const [windowWidth, setWindowWidth] = useState(800);

  useEffect(() => {
    // Only import the worker on the client side
    import('react-pdf').then(({ pdfjs }) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    });
    
    // Safely set window width for responsive PDFs
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main className="w-full h-screen bg-zinc-950 overflow-hidden relative select-none">
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

              {/* PAGE 4: THE PIPELINE & HARDWARE */}
              <section className="h-screen flex items-center justify-center px-6 md:px-20 pointer-events-none">
                <div className="w-full max-w-7xl pointer-events-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Native Hardware Widget */}
                  <div className="lg:col-span-6 relative flex flex-col bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Hardware Schematic</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider bg-sky-500/10 text-sky-400 px-2 py-1 rounded border border-sky-500/20">
                        .BRD Ready
                      </span>
                    </div>
                    
                    <div className="p-6 bg-zinc-900 flex justify-center items-center">
                      <img src="/circuit.png" alt="Arduino Circuit Schematic" className="w-full max-w-md h-auto mix-blend-screen opacity-80" />
                    </div>

                    <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                      <span className="text-sm text-zinc-500">ATmega328P TDM Array</span>
                      <button 
                        onClick={() => setActiveDocument("hardware")}
                        className="text-xs font-semibold tracking-wider text-white hover:text-sky-400 transition-colors uppercase"
                      >
                        View Full Schematic →
                      </button>
                    </div>
                  </div>

                  {/* The Logic */}
                  <div className="lg:col-span-6">
                    <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-white tracking-wide">The IoT Pipeline</h2>
                    <div className="h-px w-12 bg-emerald-500 mb-8"></div>
                    <div className="space-y-6 text-zinc-400">
                      <div>
                        <h3 className="text-emerald-400 font-medium tracking-wider uppercase text-sm mb-1">Hardware Interface</h3>
                        <p>An ATmega328P micro-controller sequentially activates an RGB LED array. A GL5528 LDR wired in a precise voltage-divider digitizes optical transmittance.</p>
                      </div>
                      <div>
                        <h3 className="text-emerald-400 font-medium tracking-wider uppercase text-sm mb-1">Kinetic Dashboard</h3>
                        <p>Continuously refits the first-order kinetic decay model using weighted least-squares regression asynchronously.</p>
                      </div>
                      <div>
                        <h3 className="text-emerald-400 font-medium tracking-wider uppercase text-sm mb-1">Compliance Engine</h3>
                        <p>Autonomously generates a tamper-evident, SHA-256 hashed PDF compliance report once the effluent achieves regulatory clarity.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* PAGE 5: THE RESULTS */}
              <section className="h-screen flex items-center justify-center px-6 md:px-20 pointer-events-none">
                <div className="w-full max-w-7xl pointer-events-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-h-[90dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                  
                  {/* Left Column: Data & Actions */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-widest mb-4">Performance Validated</h2>
                    <h3 className="text-3xl md:text-5xl font-light text-white mb-10">Industrial grade monitoring.<br/><span className="font-bold text-zinc-500">Accessible scale.</span></h3>
                    
                    <div className="space-y-8 mb-12">
                      <div className="border-l-2 border-sky-500 pl-6">
                        <div className="text-5xl font-bold text-sky-400 mb-1">93%</div>
                        <div className="text-zinc-300 font-medium text-lg">Pollutant Mass Removal</div>
                        <div className="text-zinc-500 text-sm">Achieved in a continuous-flow 300s window.</div>
                      </div>
                      
                      <div className="border-l-2 border-emerald-500 pl-6">
                        <div className="text-5xl font-bold text-emerald-400 mb-1">&le;1000<span className="text-2xl ml-1">BDT</span></div>
                        <div className="text-zinc-300 font-medium text-lg">Total Prototype Cost</div>
                        <div className="text-zinc-500 text-sm">Using locally sourced Dinajpur rice husks.</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveDocument("paper")}
                      className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-sky-400 hover:text-white transition-all duration-300 tracking-wide text-center"
                    >
                      Read Methodological Blueprint
                    </button>
                  </div>

                  {/* Right Column: The Data Widgets */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-full sm:w-1/2">
                         <h4 className="text-zinc-300 font-medium mb-2">Beer-Lambert Calibration</h4>
                         <p className="text-xs text-zinc-500 mb-4">Sensor linearity confirmed within the experimental range (R² = 0.992).</p>
                      </div>
                      <div className="w-full sm:w-1/2 bg-black rounded-lg overflow-hidden border border-zinc-800">
                        <img src="/fig1_calibration.png" alt="Calibration" className="w-full h-auto invert hue-rotate-180 opacity-80 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-full sm:w-1/2">
                         <h4 className="text-zinc-300 font-medium mb-2">First-Order Kinetics</h4>
                         <p className="text-xs text-zinc-500 mb-4">Real-time kinetic decay extraction triggering autonomous compliance reporting.</p>
                      </div>
                      <div className="w-full sm:w-1/2 bg-black rounded-lg overflow-hidden border border-zinc-800">
                        <img src="/fig2_kinetic.png" alt="Kinetics" className="w-full h-auto invert hue-rotate-180 opacity-80 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>

                </div>
              </section>

            </Scroll>
          </ScrollControls>
          <Environment preset="city" />
        </Suspense>
      </Canvas>

      {/* --- 4. THE DYNAMIC PDF MODAL --- */}
      {activeDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-xl p-0 md:p-10">
          <div className="relative w-full h-full md:max-w-6xl bg-zinc-900 md:border border-zinc-800 md:rounded-xl overflow-hidden flex flex-col shadow-2xl">
            
            <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
              <h3 className="text-white font-medium tracking-wide text-sm md:text-base">
                {activeDocument === "paper" ? "Methodological Blueprint" : "Hardware Schematic & PCB Data"}
              </h3>
              <button 
                onClick={() => setActiveDocument(null)}
                className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                ✕ Close
              </button>
            </div>

            <div 
              className="flex-1 w-full h-full overflow-y-auto bg-zinc-800/50 flex flex-col items-center py-8 px-2 md:px-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-track]:bg-zinc-900"
              onContextMenu={(e) => e.preventDefault()}
            >
              <Document
                file={activeDocument === "paper" ? "/research_paper.pdf" : "/hardware_schematic.pdf"}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div className="text-zinc-400 animate-pulse text-center w-full py-10">Loading Secure Document...</div>}
                className="max-w-full flex flex-col items-center"
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="mb-8 shadow-2xl overflow-hidden rounded-md pointer-events-none bg-white">
                    <Page 
                      pageNumber={index + 1} 
                      renderTextLayer={false} 
                      renderAnnotationLayer={false}
                      className="max-w-full"
                      width={windowWidth < 768 ? windowWidth - 32 : 800}
                    />
                  </div>
                ))}
              </Document>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}