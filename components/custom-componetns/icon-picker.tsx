"use client";

import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value?: string | null;
  onChange: (icon: string | null) => void;
  label?: string;
  className?: string;
}

export function IconPicker({
  value,
  onChange,
  label = "Icon",
  className,
}: IconPickerProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue || null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="icon-input">{label}</Label>
      <div className="flex gap-2">
        <Input
          id="icon-input"
          type="text"
          value={value || ""}
          onChange={handleInputChange}
          placeholder="Press Win + . to open emoji picker"
          className="flex-1"
          maxLength={2}
        />
        {value && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md border bg-background text-2xl"
            role="img"
            aria-label="Selected icon"
          >
            {value}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Press Win + . (Windows) or Cmd + Ctrl + Space (Mac) to open emoji picker
      </p>
    </div>
  );
}

