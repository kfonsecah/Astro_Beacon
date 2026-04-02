import { motion } from "framer-motion";

interface ScanAnimationProps {
  isScanning: boolean;
  progress: number;
}

const ScanAnimation = ({ isScanning, progress }: ScanAnimationProps) => {
  if (!isScanning) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Scanning rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute border border-accent/40 rounded-full"
          initial={{ width: 20, height: 20, opacity: 0 }}
          animate={{
            width: [20, 200 + ring * 60],
            height: [20, 200 + ring * 60],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 2,
            delay: ring * 0.3,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Center dot */}
      <motion.div
        className="w-4 h-4 bg-accent"
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />

      {/* Progress text */}
      <div className="absolute bottom-8 font-mono text-accent text-sm tracking-widest text-glow-green">
        ANALIZANDO... {Math.round(progress)}%
      </div>

      {/* Scan data particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent"
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
          }}
          animate={{
            x: Math.cos((i / 12) * Math.PI * 2) * (80 + progress),
            y: Math.sin((i / 12) * Math.PI * 2) * (80 + progress),
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};

export default ScanAnimation;
