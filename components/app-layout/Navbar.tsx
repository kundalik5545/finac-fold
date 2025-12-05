"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell, LogOut, Settings2, User2 } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import ModeToggle from "./dark-mode";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserType = {
    name: string;
    email: string;
    image: string;
}

const Navbar = () => {
    const isMobile = useIsMobile();
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);

    const handleLogout = async () => {
        try {
            await authClient.signOut();
            router.push("/signin");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/user");
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    console.error("Failed to fetch user");
                    setUser({
                        name: "John Doe",
                        email: "john.doe@example.com",
                        image: "https://avatars.githubusercontent.com/u/167022612",
                    });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchUser();
    }, []);
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">App Name</h1>

                {/* Right Side */}
                <div className="ml-auto flex items-center gap-2">
                    {/* Notification Icon, Dark Mode Icon,User Icon */}
                    <section className="flex items-center">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => alert("You have 5 Notification pending.")}
                        >
                            <Bell />
                        </Button>

                        {/* Theme Toggle */}
                        <ModeToggle />

                        {/* User detail */}

                        <SidebarMenu>
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton
                                            size="sm"
                                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                        >
                                            <Avatar className="h-8 w-8 rounded-lg grayscale">
                                                <AvatarImage src={user?.image} alt={user?.name || "John Doe"} />
                                                <AvatarFallback className="rounded-lg">
                                                    {user?.name?.charAt(0) || "JD"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                        side={isMobile ? "bottom" : "top"}
                                        align="end"
                                        sideOffset={4}
                                    >
                                        <DropdownMenuLabel className="p-0 font-normal">
                                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                                <Avatar className="h-8 w-8 rounded-lg">
                                                    <AvatarImage src={user?.image} alt={user?.name || "John Doe"} />
                                                    <AvatarFallback className="rounded-lg">
                                                        {user?.name?.charAt(0) || "JD"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="grid flex-1 text-left text-sm leading-tight">
                                                    <span className="truncate font-medium">
                                                        {user?.name || "John Doe"}
                                                    </span>
                                                    <span className="text-muted-foreground truncate text-xs">
                                                        {user?.email || "john.doe@example.com"}
                                                    </span>
                                                </div>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>
                                                <User2 />
                                                Account
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Settings2 />
                                                Setting
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Bell />
                                                Notifications
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                            <LogOut />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </section>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
