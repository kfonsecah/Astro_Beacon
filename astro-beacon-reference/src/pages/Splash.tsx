import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Splash = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => navigate("/login"), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-space-black flex items-center justify-center overflow-hidden">
      {/* Star field */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] bg-primary/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Planet curvature */}
      {phase >= 1 && (
        <motion.div
          className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-t-full border-t border-primary/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          style={{
            background: "radial-gradient(ellipse at center top, hsl(220 68% 15%), transparent 70%)",
          }}
        />
      )}

      {/* Crash trajectory */}
      {phase >= 2 && (
        <motion.div
          className="absolute w-2 h-2 bg-destructive rounded-full"
          initial={{ x: 100, y: -200, opacity: 1 }}
          animate={{ x: -50, y: 200, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeIn" }}
          style={{
            boxShadow: "0 0 20px hsl(20 100% 70%), 0 0 60px hsl(20 100% 70% / 0.5)",
          }}
        />
      )}

      {/* Logo */}
      {phase >= 3 && (
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="font-mono text-4xl tracking-[0.3em] text-primary text-glow-cyan"
            animate={{ opacity: [0, 1, 0.8, 1] }}
            transition={{ duration: 0.3, times: [0, 0.3, 0.6, 1] }}
          >
            ASTRO
          </motion.h1>
          <motion.p
            className="font-mono text-xs tracking-[0.5em] text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            SURVIVAL PROTOCOL
          </motion.p>
        </motion.div>
      )}
    </div>
  );
};

export default Splash;
