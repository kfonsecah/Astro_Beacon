import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SpaceCard from "@/components/space/SpaceCard";
import ResourceBar from "@/components/space/ResourceBar";

const Exploration = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [o2, setO2] = useState(87);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setIsComplete(true);
          clearInterval(interval);
          return 100;
        }
        return p + 0.5;
      });
      setO2((o) => Math.max(0, o - 0.2));
    }, 100);
    return () => clearInterval(interval);
  }, [isComplete]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="fixed inset-0 scanline pointer-events-none z-40" />

      <header className="px-4 py-3 border-b border-primary/10">
        <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">
          VIAJE EN PROGRESO
        </p>
        <h1 className="font-mono text-sm tracking-[0.2em] text-primary text-glow-cyan">
          RECOLECCIÓN DE SUMINISTROS
        </h1>
      </header>

      <main className="flex-1 flex flex-col px-4 py-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Travel visualization */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Travel line */}
          <div className="relative w-full h-2 bg-muted">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary"
              style={{ width: `${progress}%` }}
            />
            {/* Start point */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full" />
            {/* End point */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-destructive rotate-45" />
            {/* Astronaut dot */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full z-10"
              style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
              animate={{ boxShadow: ["0 0 5px hsl(160 100% 70%)", "0 0 15px hsl(160 100% 70%)", "0 0 5px hsl(160 100% 70%)"] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>

          {/* Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between">
            <span className="font-mono text-[9px] text-primary">NAVE</span>
            <span className="font-mono text-[9px] text-destructive">DROP #23</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <SpaceCard className="text-center p-3">
            <p className="font-mono text-lg text-primary text-glow-cyan">
              {Math.round(2.3 * (1 - progress / 100) * 10) / 10}
            </p>
            <p className="font-mono text-[9px] text-muted-foreground">KM REST.</p>
          </SpaceCard>
          <SpaceCard className="text-center p-3">
            <p className="font-mono text-lg text-primary text-glow-cyan">
              {Math.round((100 - progress) * 0.42)}
            </p>
            <p className="font-mono text-[9px] text-muted-foreground">MIN ETA</p>
          </SpaceCard>
          <SpaceCard className="text-center p-3">
            <p className={`font-mono text-lg ${o2 < 15 ? "text-destructive text-glow-orange" : "text-primary text-glow-cyan"}`}>
              {Math.round(o2)}%
            </p>
            <p className="font-mono text-[9px] text-muted-foreground">O₂</p>
          </SpaceCard>
        </div>

        {/* O2 consumption */}
        <SpaceCard title="CONSUMO DE OXÍGENO">
          <ResourceBar label="O₂ Restante" value={Math.round(o2)} />
          <p className="font-mono text-[9px] text-muted-foreground mt-2">
            TASA: -0.2 L/MIN — CONSUMO NORMAL
          </p>
        </SpaceCard>

        {/* Complete */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SpaceCard variant="discovery" title="DESTINO ALCANZADO">
              <p className="font-body text-sm text-accent mb-3">
                Suministros NASA localizados. Inventario disponible para registro.
              </p>
              <motion.button
                className="w-full border border-accent/40 text-accent font-mono text-xs tracking-wider py-2.5"
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/log-resource")}
              >
                [ REGISTRAR RECURSOS ]
              </motion.button>
            </SpaceCard>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Exploration;
