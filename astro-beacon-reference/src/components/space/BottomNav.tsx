import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Package, FileText } from "lucide-react";

const tabs = [
  { path: "/dashboard", label: "PANEL", icon: Home },
  { path: "/bestiary", label: "BITÁCORA", icon: BookOpen },
  { path: "/resources", label: "RECURSOS", icon: Package },
  { path: "/logbook", label: "REGISTROS", icon: FileText },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-primary/10">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive
                  ? "text-primary text-glow-cyan"
                  : "text-muted-foreground hover:text-primary/60"
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
