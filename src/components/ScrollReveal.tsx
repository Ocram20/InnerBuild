import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: "up" | "left" | "scale";
  delay?: number;
}

export function ScrollReveal({
  children,
  className,
  variant = "up",
  delay = 0,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal();

  const variantClass = {
    up: "reveal",
    left: "reveal-left",
    scale: "reveal-scale",
  }[variant];

  return (
    <div
      ref={ref}
      className={cn(variantClass, isVisible && "revealed", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
