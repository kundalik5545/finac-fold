"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// 10 premade light color templates (pastel colors)
const DEFAULT_COLORS = [
  "#FFE5E5", // Light Pink
  "#E5F3FF", // Light Blue
  "#E5FFE5", // Light Green
  "#FFF5E5", // Light Orange
  "#F0E5FF", // Light Purple
  "#FFE5F0", // Light Rose
  "#E5FFFF", // Light Cyan
  "#FFFEE5", // Light Yellow
  "#E5E5FF", // Light Indigo
  "#FFE5D9", // Light Peach
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

