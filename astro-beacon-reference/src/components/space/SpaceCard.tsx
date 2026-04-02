import { ReactNode } from "react";

interface SpaceCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "alert" | "discovery";
  title?: string;
}

const SpaceCard = ({ children, className = "", variant = "default", title }: SpaceCardProps) => {
  const borderColor = {
    default: "border-t-primary/40",
    alert: "border-t-destructive",
    discovery: "border-t-accent",
  }[variant];

  const glowClass = {
    default: "border-glow",
    alert: "border-glow-orange",
    discovery: "",
  }[variant];

  return (
    <div className={`bg-card border-t ${borderColor} ${glowClass} p-4 ${className}`}>
      {title && (
        <h3 className="font-mono text-xs tracking-[0.2em] text-muted-foreground mb-3 uppercase">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default SpaceCard;
