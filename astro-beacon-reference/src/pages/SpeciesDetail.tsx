import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import SpaceCard from "@/components/space/SpaceCard";
import { ArrowLeft, Volume2, MapPin } from "lucide-react";

const speciesData: Record<string, {
  name: string; type: string; habitat: string; danger: string;
  dangerLevel: "safe" | "danger"; description: string; notes: string; location: string;
}> = {
  "1": { name: "Flora Luminosa X-7", type: "Planta", habitat: "Zona Húmeda Norte", danger: "Inofensiva", dangerLevel: "safe", description: "Organismo vegetal bioluminiscente que emite luz azul-verdosa durante el ciclo nocturno. Reacciona al contacto con movimiento retráctil lento. Emisión de radiación UV-C baja, no perjudicial.", notes: "Podría servir como fuente de luz natural en el campamento. Necesito recolectar muestras para análisis nutricional.", location: "34.2°N, 118.5°W — Cueva Cristalina" },
  "2": { name: "Criatura Acorazada R-3", type: "Animal", habitat: "Zona Rocosa Este", danger: "Alta — Depredador", dangerLevel: "danger", description: "Artrópodo de gran tamaño con exoesqueleto mineral. Comportamiento territorial agresivo. Velocidad estimada: 40 km/h en terreno plano.", notes: "Mantener distancia mínima de 50m. Parece reaccionar al sonido. Silencio total al pasar por su territorio.", location: "35.1°N, 117.8°W — Cañón Rojo" },
};

const SpeciesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const species = speciesData[id || "1"] || speciesData["1"];
  const isDangerous = species.dangerLevel === "danger";

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="fixed inset-0 scanline pointer-events-none z-40" />

      {/* Hero image area */}
      <div className="relative h-56 bg-card border-b border-primary/10 overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-6xl text-primary/10">{species.name.charAt(0)}</span>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-30 w-10 h-10 bg-card/80 border border-primary/20 flex items-center justify-center text-primary"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Audio button */}
        <motion.button
          className="absolute top-4 right-4 z-30 w-10 h-10 bg-card/80 border border-primary/20 flex items-center justify-center text-primary"
          whileTap={{ scale: 0.9 }}
        >
          <Volume2 size={18} />
        </motion.button>
      </div>

      <main className="px-4 -mt-6 relative z-10 space-y-4 max-w-lg mx-auto">
        {/* Name card */}
        <SpaceCard variant={isDangerous ? "alert" : "discovery"}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`font-mono text-lg tracking-wider ${isDangerous ? "text-destructive text-glow-orange" : "text-accent text-glow-green"}`}>
                {species.name}
              </h2>
              <p className="font-mono text-[10px] text-muted-foreground mt-1 tracking-wider">
                CLASIFICACIÓN AUTOMÁTICA
              </p>
            </div>
            <span className={`font-mono text-[9px] px-2 py-1 border ${isDangerous ? "border-destructive/30 text-destructive" : "border-accent/30 text-accent"}`}>
              {species.danger}
            </span>
          </div>
        </SpaceCard>

        {/* Data fields */}
        <SpaceCard title="DATOS DE CLASIFICACIÓN">
          <div className="space-y-3">
            {[
              { label: "TIPO", value: species.type },
              { label: "HÁBITAT", value: species.habitat },
              { label: "PELIGROSIDAD", value: species.danger },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center border-b border-primary/5 pb-2">
                <span className="font-mono text-[10px] text-muted-foreground tracking-wider">{label}</span>
                <span className="font-mono text-xs text-primary">{value}</span>
              </div>
            ))}
          </div>
        </SpaceCard>

        {/* Description */}
        <SpaceCard title="ANÁLISIS">
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {species.description}
          </p>
        </SpaceCard>

        {/* Astronaut Notes */}
        <SpaceCard title="NOTAS DEL ASTRONAUTA">
          <div className="border-l-2 border-primary/20 pl-3">
            <p className="font-body text-sm text-primary/80 italic leading-relaxed">
              "{species.notes}"
            </p>
          </div>
        </SpaceCard>

        {/* Location */}
        <SpaceCard title="UBICACIÓN">
          <div className="flex items-center gap-3">
            <MapPin className="text-destructive flex-shrink-0" size={16} />
            <div>
              <p className="font-mono text-xs text-primary">{species.location}</p>
              <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
                REGISTRADO: DÍA 42 — 14:23 UTC
              </p>
            </div>
          </div>
        </SpaceCard>
      </main>
    </div>
  );
};

export default SpeciesDetail;
