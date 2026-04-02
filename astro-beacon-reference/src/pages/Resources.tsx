import { motion } from "framer-motion";
import SpaceCard from "@/components/space/SpaceCard";
import ResourceBar from "@/components/space/ResourceBar";
import BottomNav from "@/components/space/BottomNav";
import FloatingActionButton from "@/components/space/FloatingActionButton";
import { Plus, Minus, TrendingDown, TrendingUp } from "lucide-react";

const resources = [
  { id: "o2", label: "Oxígeno", value: 87, unit: "L", icon: "O₂", trend: "down" },
  { id: "h2o", label: "Agua", value: 62, unit: "L", icon: "H₂O", trend: "down" },
  { id: "food", label: "Alimento", value: 45, unit: "KG", icon: "🍴", trend: "down" },
  { id: "energy", label: "Energía", value: 12, unit: "KW", icon: "⚡", trend: "up" },
  { id: "materials", label: "Materiales", value: 34, unit: "KG", icon: "🔧", trend: "stable" },
  { id: "meds", label: "Medicina", value: 8, unit: "UN", icon: "💊", trend: "down" },
];

const history = [
  { time: "14:30", action: "Consumo O₂", amount: -3, resource: "Oxígeno" },
  { time: "13:15", action: "Suministro NASA", amount: +20, resource: "Agua" },
  { time: "12:00", action: "Comida consumida", amount: -5, resource: "Alimento" },
  { time: "10:45", action: "Panel solar", amount: +2, resource: "Energía" },
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed inset-0 scanline pointer-events-none z-40" />

      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-primary/10 px-4 py-3">
        <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">
          INVENTARIO ACTIVO
        </p>
        <h1 className="font-mono text-sm tracking-[0.2em] text-primary text-glow-cyan">
          GESTIÓN DE RECURSOS
        </h1>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Resource Grid */}
        <div className="grid grid-cols-3 gap-3">
          {resources.map((res, i) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <SpaceCard className="text-center p-3">
                <p className="text-2xl mb-1">{res.icon}</p>
                <p className="font-mono text-lg text-primary text-glow-cyan">{res.value}</p>
                <p className="font-mono text-[9px] text-muted-foreground tracking-wider">{res.unit}</p>
                <p className="font-mono text-[9px] text-muted-foreground mt-1 uppercase">{res.label}</p>
                <div className="flex justify-center gap-2 mt-2">
                  <button className="w-6 h-6 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10">
                    <Minus size={12} />
                  </button>
                  <button className="w-6 h-6 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10">
                    <Plus size={12} />
                  </button>
                </div>
              </SpaceCard>
            </motion.div>
          ))}
        </div>

        {/* Resource Bars */}
        <SpaceCard title="NIVELES DE RECURSO">
          <div className="space-y-3">
            {resources.map((res) => (
              <ResourceBar key={res.id} label={res.label} value={res.value} />
            ))}
          </div>
        </SpaceCard>

        {/* History */}
        <SpaceCard title="HISTORIAL RECIENTE">
          <div className="space-y-3">
            {history.map((entry, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 border-b border-primary/5 pb-2"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {entry.amount > 0 ? (
                  <TrendingUp size={14} className="text-accent flex-shrink-0" />
                ) : (
                  <TrendingDown size={14} className="text-destructive flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-primary truncate">{entry.action}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">{entry.resource}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-mono text-xs ${entry.amount > 0 ? "text-accent" : "text-destructive"}`}>
                    {entry.amount > 0 ? "+" : ""}{entry.amount}
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground">{entry.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </SpaceCard>
      </main>

      <FloatingActionButton />
      <BottomNav />
    </div>
  );
};

export default Resources;
