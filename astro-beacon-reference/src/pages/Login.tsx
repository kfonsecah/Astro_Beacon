import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [agentId, setAgentId] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!agentId.trim()) return;
    setIsAuthenticating(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden">
      {/* Slow starfield */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[1px] h-[1px] bg-primary/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, 10, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanline pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-sm px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* System header */}
        <div className="text-center mb-12">
          <p className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground mb-4">
            // SISTEMA DE CONTROL DE MISIÓN
          </p>
          <h1 className="font-mono text-2xl tracking-[0.2em] text-primary text-glow-cyan">
            ASTRO
          </h1>
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mt-1">
            v2.7.1 — PROTOCOLO DE SUPERVIVENCIA
          </p>
        </div>

        {/* Login form */}
        <div className="space-y-6">
          <div>
            <label className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground block mb-2">
              ID DE AGENTE
            </label>
            <div className="relative">
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-card border border-primary/30 text-primary font-mono text-sm tracking-wider px-4 py-3 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
                placeholder="INGRESE ID..."
                autoFocus
              />
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-4 bg-primary"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </div>
          </div>

          <motion.button
            onClick={handleLogin}
            disabled={!agentId.trim() || isAuthenticating}
            className="w-full border border-primary/40 text-primary font-mono text-xs tracking-[0.3em] py-3 hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.98 }}
          >
            {isAuthenticating ? (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                AUTENTICANDO...
              </motion.span>
            ) : (
              "[ AUTENTICAR ]"
            )}
          </motion.button>
        </div>

        {/* Connection status */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
            ENLACE ESTABLECIDO — SEÑAL DÉBIL
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
