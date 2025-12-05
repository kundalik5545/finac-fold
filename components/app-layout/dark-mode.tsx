"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

const ModeToggle = () => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    // Wait for client-side hydration before rendering
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div>
                <Button size="icon" variant="ghost" disabled>
                    <Moon />
                </Button>
            </div>
        );
    }

    // Use resolvedTheme to reliably get theme value after hydration
    const currentTheme = resolvedTheme || theme;

    return (
        <div>
            <Button
                size="icon"
                variant="ghost"
                aria-label="Toggle theme"
                onClick={() =>
                    currentTheme === "light"
                        ? setTheme("dark")
                        : setTheme("light")
                }
            >
                {currentTheme === "light" ? <Moon /> : <Sun />}
            </Button>
        </div>
    );
};

export default ModeToggle;
