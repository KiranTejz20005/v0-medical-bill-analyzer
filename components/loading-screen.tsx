"use client";

import { useState, useEffect } from "react";
import { Check, Circle } from "lucide-react";

interface LoadingScreenProps {
  stage: "extracting" | "analyzing" | "generating";
}

interface AnalysisStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete";
  subtext: string;
}

export function LoadingScreen({ stage }: LoadingScreenProps) {
  const [dots, setDots] = useState("");
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: "parse", label: "Parsing document structure", status: "pending", subtext: "Identifying line items and codes" },
    { id: "extract", label: "Extracting billing data", status: "pending", subtext: "Reading CPT codes and charges" },
    { id: "validate", label: "Validating code formats", status: "pending", subtext: "Cross-referencing HCPCS database" },
    { id: "analyze", label: "Running anomaly detection", status: "pending", subtext: "Checking for duplicates and errors" },
    { id: "price", label: "Comparing fair prices", status: "pending", subtext: "Medicare reimbursement lookup" },
    { id: "generate", label: "Generating report", status: "pending", subtext: "Compiling findings and recommendations" },
  ]);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [variant, setVariant] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate step progression
    const stepInterval = setInterval(() => {
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps];
        
        // Find current active step
        const activeIndex = newSteps.findIndex(s => s.status === "active");
        
        if (activeIndex === -1) {
          // No active step, start the first one
          newSteps[0].status = "active";
          setCurrentStepIndex(0);
        } else if (activeIndex < newSteps.length - 1) {
          // Mark current as complete and next as active
          newSteps[activeIndex].status = "complete";
          newSteps[activeIndex + 1].status = "active";
          setCurrentStepIndex(activeIndex + 1);
        } else {
          // Last step is active, mark as complete
          newSteps[activeIndex].status = "complete";
        }
        
        return newSteps;
      });
    }, 1200);

    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    // Smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const targetProgress = ((currentStepIndex + 1) / steps.length) * 100;
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 1) return targetProgress;
        return prev + diff * 0.1;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [currentStepIndex, steps.length]);

  useEffect(() => {
    // Cycle through variants
    const variantInterval = setInterval(() => {
      setVariant((prev) => (prev >= 6 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(variantInterval);
  }, []);

  const currentStep = steps.find(s => s.status === "active") || steps[0];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"
          style={{
            animation: "scan-line 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-zinc-800/50" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-zinc-800/50" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-zinc-800/50" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-zinc-800/50" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border border-zinc-700 flex items-center justify-center">
            <div className="w-3 h-3 bg-white" />
          </div>
          <span className="font-medium tracking-widest text-sm">BILLANALYZER</span>
        </div>
        <span className="text-xs text-zinc-600 tracking-widest font-mono">
          VARIANT {variant} OF 6
        </span>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        {/* Animated Box */}
        <div className="relative w-20 h-20 mb-12">
          <div className="absolute inset-0 border border-zinc-700" />
          <div 
            className="absolute inset-0 border border-white/50"
            style={{
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <div 
            className="absolute inset-2 border border-zinc-600"
            style={{
              animation: "pulse 2s ease-in-out infinite 0.5s",
            }}
          />
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-8">
          <p className="text-xl mb-2 font-mono tracking-wide">
            {currentStep.label}
            <span className="text-amber-500">{dots}</span>
            <span className="inline-block w-0.5 h-5 bg-white ml-1 animate-blink align-middle" />
          </p>
          <p className="text-xs text-zinc-500 tracking-widest uppercase">
            {currentStep.subtext}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="w-full max-w-md mb-12">
          {/* Progress bar */}
          <div className="h-0.5 bg-zinc-800 rounded-full mb-8 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-4 transition-all duration-300 ${
                  step.status === "pending" ? "opacity-30" : "opacity-100"
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {step.status === "complete" ? (
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                  ) : step.status === "active" ? (
                    <div className="w-5 h-5 border border-amber-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 border border-zinc-700 rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-mono ${
                    step.status === "active" ? "text-white" : 
                    step.status === "complete" ? "text-zinc-400" : "text-zinc-600"
                  }`}>
                    {step.label}
                  </p>
                </div>
                {step.status === "complete" && (
                  <span className="text-[10px] text-green-500 font-mono">DONE</span>
                )}
                {step.status === "active" && (
                  <span className="text-[10px] text-amber-500 font-mono animate-pulse">RUNNING</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Local Engine Badge */}
        <div className="flex items-center gap-4">
          <span className="px-5 py-2.5 border border-zinc-800 text-xs tracking-widest text-zinc-500 font-mono bg-zinc-900/50">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            LOCAL ENGINE ACTIVE
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-6 text-xs text-zinc-700">
        <div className="flex items-center gap-8">
          <button type="button" className="hover:text-zinc-400 transition-colors tracking-wider">
            Privacy
          </button>
          <button type="button" className="hover:text-zinc-400 transition-colors tracking-wider">
            Security
          </button>
        </div>
        <span className="font-mono">© 2024</span>
      </footer>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-8 text-zinc-800 font-mono text-[10px] tracking-widest">
        <div>SYS.READY</div>
        <div className="mt-1">MEM.OK</div>
      </div>
      <div className="absolute top-1/4 right-8 text-zinc-800 font-mono text-[10px] tracking-widest text-right">
        <div>v2.0.1</div>
        <div className="mt-1">BUILD.4891</div>
      </div>
    </div>
  );
}
