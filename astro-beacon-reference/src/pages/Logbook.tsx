import { motion } from "framer-motion";
import SpaceCard from "@/components/space/SpaceCard";
import BottomNav from "@/components/space/BottomNav";
import FloatingActionButton from "@/components/space/FloatingActionButton";
import { PenLine } from "lucide-react";

const logEntries = [
  {
    day: 47,
    time: "14:30",
    title: "Fallo en celda de energía",
    content: "La celda #3 dejó de funcionar. Reservas de energía cayendo rápido. Necesito encontrar los paneles solares del suministro NASA antes del anochecer.",
    mood: "urgent",
  },
  {
    day: 46,
    time: "09:15",
    title: "Nuevo descubrimiento: Flora Luminosa",
    content: "Encontré una planta bioluminiscente en la cueva al norte. Emite luz azul-verdosa. Podría ser útil como fuente de luz natural. Tomé muestras.",
    mood: "discovery",
  },
  {
    day: 45,
    time: "18:00",
    title: "Tormenta de arena",
    content: "Una tormenta masiva pasó durante la noche. La nave tiene daños menores en el panel exterior. Visibilidad casi nula por 6 horas.",
    mood: "warning",
  },
  {
    day: 44,
    time: "11:30",
    title: "Suministro NASA recibido",
    content: "Drop #22 localizado a 1.8km al este. Contenido: 20L agua, 10kg alimento, kit médico. La NASA sigue escuchando.",
    mood: "positive",
  },
  {
    day: 42,
    time: "16:45",
    title: "Encuentro con Criatura R-3",
    content: "Casi no la cuento. Criatura acorazada a 30m. Se movía rápido. Logré volver a la nave. Nota: evitar Cañón Rojo en horario diurno.",
    mood: "urgent",
  },
];

const moodConfig = {
  urgent: { border: "border-t-destructive", textClass: "text-destructive" },
  discovery: { border: "border-t-accent", textClass: "text-accent" },
  warning: { border: "border-t-warning-orange", textClass: "text-destructive" },
  positive: { border: "border-t-primary", textClass: "text-primary" },
};

const Logbook = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed inset-0 scanline pointer-events-none z-40" />

      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-primary/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">
              {logEntries.length} ENTRADAS
            </p>
            <h1 className="font-mono text-sm tracking-[0.2em] text-primary text-glow-cyan">
              REGISTROS DE MISIÓN
            </h1>
          </div>
          <motion.button
            className="w-10 h-10 border border-primary/30 flex items-center justify-center text-primary"
            whileTap={{ scale: 0.9 }}
          >
            <PenLine size={18} />
          </motion.button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {logEntries.map((entry, i) => {
          const mood = moodConfig[entry.mood as keyof typeof moodConfig];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`bg-card ${mood.border} border-t p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                    DÍA {entry.day} — {entry.time} UTC
                  </span>
                </div>
                <h3 className={`font-mono text-xs tracking-wider ${mood.textClass} mb-2`}>
                  {entry.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {entry.content}
                </p>
              </div>
            </motion.div>
          );
        })}
      </main>

      <FloatingActionButton />
      <BottomNav />
    </div>
  );
};

export default Logbook;
