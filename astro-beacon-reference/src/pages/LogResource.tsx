import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

const resourceTypes = [
  { id: "water", label: "AGUA", emoji: "💧" },
  { id: "food", label: "ALIMENTO", emoji: "🍴" },
  { id: "oxygen", label: "OXÍGENO", emoji: "🫁" },
  { id: "mineral", label: "MINERAL", emoji: "💎" },
  { id: "biomass", label: "BIOMASA", emoji: "🧬" },
  { id: "energy", label: "ENERGÍA", emoji: "⚡" },
];

const LogResource = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [logged, setLogged] = useState(false);

  const handleLog = () => {
    if (!selectedType || !quantity) return;
    setLogged(true);
    setTimeout(() => navigate("/resources"), 1500);
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="fixed inset-0 scanline pointer-events-none z-40" />

      <header className="flex items-center gap-3 px-4 py-3 border-b border-primary/10">
        <button onClick={() => navigate(-1)} className="text-primary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">
            NUEVO REGISTRO
          </p>
          <h1 className="font-mono text-sm tracking-[0.2em] text-primary text-glow-cyan">
            REGISTRAR RECURSO
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 max-w-lg mx-auto w-full">
        {logged ? (
          <motion.div
            className="flex-1 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-16 h-16 border-2 border-accent flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Check className="text-accent" size={32} />
            </motion.div>
            <p className="font-mono text-accent text-glow-green tracking-wider">
              RECURSO REGISTRADO
            </p>
            <p className="font-mono text-[10px] text-muted-foreground mt-2">
              +25 XP — INVENTARIO ACTUALIZADO
            </p>
          </motion.div>
        ) : (
          <>
            {/* Resource type chips */}
            <div>
              <label className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground block mb-3">
                TIPO DE RECURSO
              </label>
              <div className="grid grid-cols-3 gap-2">
                {resourceTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`border py-3 flex flex-col items-center gap-1 transition-colors ${
                      selectedType === type.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-primary/20 text-muted-foreground hover:border-primary/40"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{type.emoji}</span>
                    <span className="font-mono text-[9px] tracking-wider">{type.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground block mb-2">
                CANTIDAD
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full bg-card border border-primary/30 text-primary font-mono text-2xl tracking-wider px-4 py-3 outline-none focus:border-primary text-center placeholder:text-muted-foreground/20"
              />
            </div>

            {/* Location */}
            <div>
              <label className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground block mb-2">
                UBICACIÓN
              </label>
              <input
                type="text"
                placeholder="COORD. AUTOMÁTICAS"
                className="w-full bg-card border border-primary/30 text-primary font-mono text-xs tracking-wider px-4 py-3 outline-none focus:border-primary placeholder:text-muted-foreground/30"
              />
            </div>

            {/* Submit */}
            <motion.button
              onClick={handleLog}
              disabled={!selectedType || !quantity}
              className="w-full border border-primary/40 text-primary font-mono text-xs tracking-[0.3em] py-3 hover:bg-primary/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.98 }}
            >
              [ REGISTRAR RECURSO ]
            </motion.button>
          </>
        )}
      </main>
    </div>
  );
};

export default LogResource;
