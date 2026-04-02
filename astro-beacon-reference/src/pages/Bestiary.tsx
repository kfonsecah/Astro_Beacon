import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SpaceCard from "@/components/space/SpaceCard";
import BottomNav from "@/components/space/BottomNav";
import FloatingActionButton from "@/components/space/FloatingActionButton";
import { Search, Camera } from "lucide-react";

const species = [
  { id: 1, name: "Flora Luminosa X-7", type: "Planta", status: "safe", description: "Bioluminiscente. Emite UV-C baja." },
  { id: 2, name: "Criatura Acorazada R-3", type: "Animal", status: "danger", description: "Depredador territorial. Evitar contacto." },
  { id: 3, name: "Hongo Nebular K-12", type: "Hongo", status: "safe", description: "Comestible. Alto contenido proteico." },
  { id: 4, name: "Insecto Cristalino W-1", type: "Animal", status: "unknown", description: "Comportamiento desconocido. En observación." },
  { id: 5, name: "Alga Roja Tóxica M-9", type: "Planta", status: "danger", description: "Altamente tóxica. No consumir." },
  { id: 6, name: "Mineral Orgánico Z-4", type: "Recurso", status: "safe", description: "Fuente de minerales esenciales." },
];

const statusConfig = {
  safe: { color: "bg-accent", label: "SEGURO", textClass: "text-accent" },
  danger: { color: "bg-destructive", label: "PELIGROSO", textClass: "text-destructive" },
  unknown: { color: "bg-muted-foreground", label: "DESCONOCIDO", textClass: "text-muted-foreground" },
};

const Bestiary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const filtered = species.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed inset-0 scanline pointer-events-none z-40" />

      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-primary/10 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">
              {species.length} REGISTROS
            </p>
            <h1 className="font-mono text-sm tracking-[0.2em] text-primary text-glow-cyan">
              BITÁCORA
            </h1>
          </div>
          <motion.button
            className="w-10 h-10 border border-primary/30 flex items-center justify-center text-primary"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/identify")}
          >
            <Camera size={18} />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR ESPECIE..."
            className="w-full bg-card border border-primary/20 text-primary font-mono text-xs tracking-wider pl-9 pr-4 py-2.5 outline-none focus:border-primary/50 placeholder:text-muted-foreground/30"
          />
        </div>
      </header>

      <main className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {filtered.map((sp, i) => {
          const status = statusConfig[sp.status as keyof typeof statusConfig];
          return (
            <motion.div
              key={sp.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/species/${sp.id}`)}
              className="cursor-pointer"
            >
              <SpaceCard className="flex gap-4 items-start hover:border-t-primary/60 transition-colors">
                {/* Thumbnail placeholder */}
                <div className="w-16 h-16 bg-muted border border-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-lg text-primary/30">
                    {sp.name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${status.color} rounded-full flex-shrink-0`} />
                    <p className="font-mono text-xs text-primary truncate">{sp.name}</p>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-1">
                    {sp.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="font-mono text-[9px] px-1.5 py-0.5 border border-primary/20 text-muted-foreground">
                      {sp.type.toUpperCase()}
                    </span>
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 border border-primary/20 ${status.textClass}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </SpaceCard>
            </motion.div>
          );
        })}
      </main>

      <FloatingActionButton />
      <BottomNav />
    </div>
  );
};

export default Bestiary;
