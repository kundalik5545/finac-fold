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
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Bell, LogOut, Settings2, User2, EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

type UserType = {
    name: string;
    email: string;
    image: string;
}

export function NavUser() {
    const { isMobile } = useSidebar();
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
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg grayscale">
                                <AvatarImage src={user?.image} alt={user?.name || "John Doe"} />
                                <AvatarFallback className="rounded-lg">{user?.name?.charAt(0) || "JD"}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user?.name || "John Doe"}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {user?.email || "john.doe@example.com"}
                                </span>
                            </div>
                            <EllipsisVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.image} alt={user?.name || "John Doe"} />
                                    <AvatarFallback className="rounded-lg">{user?.name?.charAt(0) || "JD"}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user?.name || "John Doe"}</span>
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
    );
}
