"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import {
    DollarSign
} from "lucide-react";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { websiteDetails } from "@/data/website-details";
import { useEffect, useState } from "react";
import { User } from "@/app/generated/prisma/client";
import { navItems as navItemsData, navQuick as navQuickData } from "@/data/nav-items";

export function AppSidebar({ variant }: { variant: "sidebar" | "floating" | "inset" }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    type NavItem = {
        title: string;
        url: string;
        icon: React.ElementType;
    }

    type NavQuick = {
        title: string;
        url: string;
        icon: React.ElementType;
    }

    const navItems: NavItem[] = navItemsData;
    const navQuick: NavQuick[] = navQuickData;
    return (
        <Sidebar collapsible="offcanvas">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <Link href="/">
                                {/* Icon logo */}
                                <websiteDetails.websiteIcon size="16" />
                                {/* App Name */}
                                <span className="text-base font-semibold">{websiteDetails.websiteName}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
