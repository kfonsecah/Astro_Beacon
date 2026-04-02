import { motion } from "framer-motion";

interface ResourceBarProps {
  label: string;
  value: number;
  maxValue?: number;
  segments?: number;
}

const ResourceBar = ({ label, value, maxValue = 100, segments = 10 }: ResourceBarProps) => {
  const filledSegments = Math.round((value / maxValue) * segments);
  const isCritical = (value / maxValue) < 0.15;

  return (
    <div className="space-y-1">
      <div className="flex justify-between font-mono text-xs tracking-wider">
        <span className="text-muted-foreground uppercase">{label}</span>
        <span className={isCritical ? "text-destructive text-glow-orange" : "text-primary"}>
          {value}/{maxValue}
        </span>
      </div>
      <div className="flex gap-[2px]">
        {[...Array(segments)].map((_, i) => {
          const isFilled = i < filledSegments;
          return (
            <motion.div
              key={i}
              className={`h-3 flex-1 ${
                isFilled
                  ? isCritical
                    ? "bg-destructive"
                    : "bg-primary"
                  : "bg-muted"
              }`}
              animate={
                isCritical && isFilled
                  ? { opacity: [1, 0.4, 1] }
                  : {}
              }
              transition={{
                duration: 0.6 + i * 0.1,
                repeat: Infinity,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ResourceBar;
