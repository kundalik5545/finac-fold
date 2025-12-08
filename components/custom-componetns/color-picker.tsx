"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// 10 premade light color templates (pastel colors)
const DEFAULT_COLORS = [
  "#ffb3b3", // Darker Pink
  "#99ccff", // Darker Blue
  "#47479a", // Darker Green
  "#ffd699", // Darker Orange
  "#c3a6ff", // Darker Purple
  "#ffb3d9", // Darker Rose
  "#99ffff", // Darker Cyan
  "#ffff99", // Darker Yellow
  "#b3b3ff", // Darker Indigo
  "#ffb38c", // Darker Peach
];

interface ColorPickerProps {
  value?: string | null;
  onChange: (color: string | null) => void;
  colors?: string[];
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  colors = DEFAULT_COLORS,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-5 gap-2">
        {colors.map((color) => {
          const isSelected = value === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(isSelected ? null : color)}
              className={cn(
                "relative h-10 w-full rounded-md border-2 transition-all hover:scale-105",
                isSelected
                  ? "border-foreground ring-2 ring-offset-2"
                  : "border-border hover:border-foreground/50"
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-4 w-4 text-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear selection
        </button>
      )}
    </div>
  );
}

