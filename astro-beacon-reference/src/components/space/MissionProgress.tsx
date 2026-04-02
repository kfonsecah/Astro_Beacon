import { motion } from "framer-motion";

interface MissionProgressProps {
  level: number;
  xp: number;
  maxXp: number;
  title: string;
}

const MissionProgress = ({ level, xp, maxXp, title }: MissionProgressProps) => {
  const progress = (xp / maxXp) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border border-primary/40 flex items-center justify-center font-mono text-primary text-sm text-glow-cyan">
            {level}
          </div>
          <div>
            <p className="font-mono text-xs tracking-wider text-primary uppercase">{title}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{xp}/{maxXp} XP</p>
          </div>
        </div>
      </div>
      <div className="h-1 bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default MissionProgress;
