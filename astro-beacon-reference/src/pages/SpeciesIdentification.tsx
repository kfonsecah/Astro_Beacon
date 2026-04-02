import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import ScanAnimation from "@/components/space/ScanAnimation";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, ArrowLeft } from "lucide-react";

const SpeciesIdentification = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<null | { name: string; type: string; danger: string }>(null);
  const navigate = useNavigate();

  const startScan = useCallback(() => {
    setIsScanning(true);
    setProgress(0);
    setResult(null);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setResult({
            name: "ORGANISMO DESCONOCIDO Ω-14",
            type: "FAUNA",
            danger: "NIVEL 3 — PRECAUCIÓN",
          });
          return 100;
        }
        return p + 2;
      });
    }, 60);
  }, []);

  return (
    <div className="fixed inset-0 bg-space-black flex flex-col">
      <div className="absolute inset-0 scanline pointer-events-none z-40" />

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-primary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-mono text-xs tracking-[0.2em] text-primary text-glow-cyan">
          IDENTIFICACIÓN
        </h1>
        <div className="w-5" />
      </header>

      {/* Camera viewfinder area */}
      <div className="flex-1 relative flex items-center justify-center mx-4 mb-4 border border-primary/20 overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 grid-pattern" />

        {/* Reticle */}
        <div className="relative w-48 h-48">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary" />

          {/* Crosshairs */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-primary/20" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-primary/20" />
        </div>

        {/* Scan animation */}
        <ScanAnimation isScanning={isScanning} progress={progress} />

        {/* Result overlay */}
        {result && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-space-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center space-y-3">
              <motion.p
                className="font-mono text-accent text-lg tracking-wider text-glow-green"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {result.name}
              </motion.p>
              <motion.div
                className="space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="font-mono text-xs text-muted-foreground">TIPO: {result.type}</p>
                <p className="font-mono text-xs text-destructive">{result.danger}</p>
              </motion.div>
              <motion.button
                className="border border-primary/40 text-primary font-mono text-xs tracking-wider px-6 py-2 mt-4"
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/bestiary")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                [ GUARDAR EN BITÁCORA ]
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-30 px-4 pb-8 flex items-center justify-center gap-6">
        <motion.button
          className="w-12 h-12 border border-primary/30 flex items-center justify-center text-primary"
          whileTap={{ scale: 0.9 }}
        >
          <Upload size={18} />
        </motion.button>

        <motion.button
          onPointerDown={startScan}
          className={`w-16 h-16 border-2 flex items-center justify-center ${
            isScanning ? "border-accent bg-accent/10" : "border-primary"
          }`}
          whileTap={{ scale: 0.95 }}
          disabled={isScanning}
        >
          <Camera size={24} className={isScanning ? "text-accent" : "text-primary"} />
        </motion.button>

        <div className="w-12 h-12" /> {/* Spacer */}
      </div>
    </div>
  );
};

export default SpeciesIdentification;
