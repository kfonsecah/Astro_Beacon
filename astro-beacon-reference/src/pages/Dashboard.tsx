import { motion } from "framer-motion";
import HudIndicator from "@/components/space/HudIndicator";
import SpaceCard from "@/components/space/SpaceCard";
import ResourceBar from "@/components/space/ResourceBar";
import MissionProgress from "@/components/space/MissionProgress";
import BottomNav from "@/components/space/BottomNav";
import FloatingActionButton from "@/components/space/FloatingActionButton";
import { Activity, AlertTriangle, MapPin, Zap } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanline pointer-events-none z-40" />

      {/* Fixed HUD Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-primary/10 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">
              DÍA 47 — MISIÓN ACTIVA
            </p>
            <h1 className="font-mono text-sm tracking-[0.2em] text-primary text-glow-cyan">
              PANEL DE CONTROL
            </h1>
          </div>
          <motion.div
            className="flex items-center gap-1 text-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="font-mono text-[9px] tracking-wider">EN LÍNEA</span>
          </motion.div>
        </div>

        {/* HUD Indicators */}
        <div className="grid grid-cols-4 gap-2">
          <HudIndicator label="O₂" value={87} />
          <HudIndicator label="H₂O" value={62} />
          <HudIndicator label="ALIM" value={45} />
          <HudIndicator label="ENRG" value={12} critical />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Critical Alert */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <SpaceCard variant="alert" title="⚠ ALERTA CRÍTICA">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-destructive mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="font-body text-sm text-destructive">
                  Energía por debajo del umbral mínimo
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">
                  CELDA DE ENERGÍA #3 — FALLO DETECTADO
                </p>
              </div>
            </div>
          </SpaceCard>
        </motion.div>

        {/* Astronaut Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SpaceCard title="ESTADO DEL ASTRONAUTA">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                {/* EKG Line */}
                <svg viewBox="0 0 200 40" className="w-full h-8">
                  <motion.path
                    d="M0,20 L30,20 L35,5 L40,35 L45,20 L80,20 L85,8 L90,32 L95,20 L140,20 L145,5 L150,35 L155,20 L200,20"
                    fill="none"
                    stroke="hsl(160 100% 70%)"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0.5 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </svg>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-primary text-glow-cyan">ESTABLE</p>
                <p className="font-mono text-[10px] text-muted-foreground">BPM: 72</p>
              </div>
            </div>
          </SpaceCard>
        </motion.div>

        {/* Resource Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SpaceCard title="RECURSOS">
            <div className="space-y-3">
              <ResourceBar label="Oxígeno" value={87} />
              <ResourceBar label="Agua" value={62} />
              <ResourceBar label="Alimento" value={45} />
              <ResourceBar label="Energía" value={12} />
            </div>
          </SpaceCard>
        </motion.div>

        {/* Latest Discovery */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SpaceCard variant="discovery" title="ÚLTIMO DESCUBRIMIENTO">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-muted border border-accent/20 flex items-center justify-center">
                <Zap className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <p className="font-mono text-sm text-accent text-glow-green">
                  FLORA LUMINOSA X-7
                </p>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  Especie bioluminiscente. Emite radiación UV-C baja. Clasificada como no hostil.
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="font-mono text-[9px] px-2 py-0.5 border border-accent/30 text-accent">
                    PLANTA
                  </span>
                  <span className="font-mono text-[9px] px-2 py-0.5 border border-accent/30 text-accent">
                    SEGURA
                  </span>
                </div>
              </div>
            </div>
          </SpaceCard>
        </motion.div>

        {/* Supply Drop */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SpaceCard title="SUMINISTRO ENTRANTE">
            <div className="flex items-center gap-4">
              <MapPin className="text-destructive flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-mono text-xs text-destructive text-glow-orange">
                  NASA DROP #23
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">
                  COORD: 34.2°N, 118.5°W — 2.3 KM
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg text-primary text-glow-cyan">03:42</p>
                <p className="font-mono text-[9px] text-muted-foreground">ETA</p>
              </div>
            </div>
          </SpaceCard>
        </motion.div>

        {/* Mission Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SpaceCard title="PROGRESO DE MISIÓN">
            <div className="space-y-4">
              <MissionProgress level={5} xp={340} maxXp={500} title="Explorador" />
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center">
                  <p className="font-mono text-xl text-primary text-glow-cyan">12</p>
                  <p className="font-mono text-[9px] text-muted-foreground">ESPECIES</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-xl text-destructive text-glow-orange">7</p>
                  <p className="font-mono text-[9px] text-muted-foreground">MISIONES</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-xl text-accent text-glow-green">3</p>
                  <p className="font-mono text-[9px] text-muted-foreground">LOGROS</p>
                </div>
              </div>
            </div>
          </SpaceCard>
        </motion.div>
      </main>

      <FloatingActionButton />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
