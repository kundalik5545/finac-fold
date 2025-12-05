"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

const ModeToggle = () => {
    const { theme, setTheme } = useTheme();
    return (
        <div>
            <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                    theme === "light" ? setTheme("dark") : setTheme("light")
                }
            >
                {theme === "light" ? <Moon /> : <Sun />}
            </Button>
        </div>
    );
};

export default ModeToggle;
