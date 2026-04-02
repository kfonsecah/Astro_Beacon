import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { useState } from "react";

const mapPoints = [
  { id: "ship", x: 50, y: 55, type: "ship", label: "NAVE" },
  { id: "drop1", x: 30, y: 25, type: "supply", label: "DROP #23" },
  { id: "drop2", x: 75, y: 35, type: "supply", label: "DROP #22" },
  { id: "explored1", x: 40, y: 40, type: "explored", label: "CUEVA CRISTALINA" },
  { id: "explored2", x: 60, y: 70, type: "explored", label: "CAÑÓN ROJO" },
  { id: "explored3", x: 25, y: 65, type: "explored", label: "LLANURA NORTE" },
];

const ExplorationMap = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-space-black z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
        <h1 className="font-mono text-xs tracking-[0.2em] text-primary text-glow-cyan">
          MAPA DE EXPLORACIÓN
        </h1>
        <button onClick={() => navigate(-1)} className="text-primary">
          <X size={20} />
        </button>
      </header>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 grid-pattern" />

        {/* Topographic contours */}
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            className="absolute border border-primary/5 rounded-full"
            style={{
              width: `${ring * 30}%`,
              height: `${ring * 25}%`,
              left: `${35 - ring * 5}%`,
              top: `${40 - ring * 3}%`,
            }}
          />
        ))}

        {/* Map points */}
        {mapPoints.map((point) => (
          <motion.button
            key={point.id}
            className="absolute z-10 flex flex-col items-center"
            style={{ left: `${point.x}%`, top: `${point.y}%`, transform: "translate(-50%, -50%)" }}
            onClick={() => setSelected(point.id)}
            whileTap={{ scale: 1.2 }}
          >
            {point.type === "ship" && (
              <>
                <motion.div
                  className="w-4 h-4 bg-primary rounded-full"
                  animate={{ boxShadow: ["0 0 5px hsl(160 100% 70% / 0.3)", "0 0 20px hsl(160 100% 70% / 0.6)", "0 0 5px hsl(160 100% 70% / 0.3)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="font-mono text-[8px] text-primary mt-1 tracking-wider">{point.label}</span>
              </>
            )}
            {point.type === "supply" && (
              <>
                <motion.div
                  className="w-3 h-3 bg-destructive rotate-45"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="font-mono text-[8px] text-destructive mt-1 tracking-wider">{point.label}</span>
              </>
            )}
            {point.type === "explored" && (
              <>
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
                <span className="font-mono text-[7px] text-muted-foreground mt-1 tracking-wider">{point.label}</span>
              </>
            )}
          </motion.button>
        ))}

        {/* Explored area glow */}
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: "40%",
            height: "35%",
            left: "30%",
            top: "35%",
            background: "radial-gradient(ellipse, hsl(160 100% 70% / 0.3), transparent 70%)",
          }}
        />
      </div>

      {/* Selected point info */}
      {selected && (
        <motion.div
          className="px-4 py-4 bg-card border-t border-primary/10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {(() => {
            const point = mapPoints.find((p) => p.id === selected)!;
            return (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-primary tracking-wider">{point.label}</p>
                  <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
                    {point.type === "supply" ? "SUMINISTRO PENDIENTE" : point.type === "ship" ? "POSICIÓN ACTUAL" : "ZONA EXPLORADA"}
                  </p>
                </div>
                {point.type === "supply" && (
                  <motion.button
                    className="border border-destructive/40 text-destructive font-mono text-[10px] tracking-wider px-4 py-2"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/exploration")}
                  >
                    [ INICIAR VIAJE ]
                  </motion.button>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
};

export default ExplorationMap;
