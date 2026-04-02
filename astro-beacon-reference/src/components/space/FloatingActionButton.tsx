import { useNavigate } from "react-router-dom";
import { Radar } from "lucide-react";
import { motion } from "framer-motion";

const FloatingActionButton = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate("/map")}
      className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center animate-pulse-glow"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
    >
      <Radar size={24} />
    </motion.button>
  );
};

export default FloatingActionButton;
