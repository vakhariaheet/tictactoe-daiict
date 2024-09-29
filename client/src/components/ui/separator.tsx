// src/components/ui/separator.tsx
import React from "react";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({ orientation = "horizontal", className }) => {
  return (
    <div
      className={`separator ${orientation} ${className}`}
      style={{
        border: orientation === "horizontal" ? "1px solid #eaeaea" : "none",
        height: orientation === "vertical" ? "100%" : "1px",
        width: orientation === "vertical" ? "1px" : "100%",
        margin: orientation === "vertical" ? "0 8px" : "8px 0",
      }}
    />
  );
};
