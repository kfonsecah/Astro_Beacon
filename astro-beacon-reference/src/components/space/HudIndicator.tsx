import { motion } from "framer-motion";

interface HudIndicatorProps {
  label: string;
  value: number;
  unit?: string;
  critical?: boolean;
  icon?: React.ReactNode;
}

const HudIndicator = ({ label, value, unit = "%", critical = false, icon }: HudIndicatorProps) => {
  const isCritical = critical || value < 15;
  
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {icon && <span className="text-xs">{icon}</span>}
        <motion.span
          className={`font-mono text-lg font-semibold ${
            isCritical ? "text-destructive text-glow-orange" : "text-primary text-glow-cyan"
          }`}
          animate={isCritical ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {value}{unit}
        </motion.span>
      </div>
      {/* Mini sparkline */}
      <div className="flex items-end gap-[2px] h-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`w-[3px] ${isCritical ? "bg-destructive/60" : "bg-primary/40"}`}
            style={{ height: `${Math.max(2, Math.random() * 12)}px` }}
          />
        ))}
      </div>
    </div>
  );
};

export default HudIndicator;
