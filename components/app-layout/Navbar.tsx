import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import ModeToggle from "./dark-mode";
import NotificationIcon from "./notification-icon";
import { TopNavUser } from "./top-nav-user";
import Link from "next/link";
import { websiteDetails } from "@/data/website-details";

const Navbar = async () => {
    // Get session to check authentication status
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Get the pathname from the request headers (works on server)
    const path =
        (await headers()).get("x-invoke-path") || (await headers()).get("x-pathname") || "";

    let pathname = path || "/";

    // Fallback for edge/renderPathHeader
    if (!pathname || pathname === "[[...path]]") {
        // Try parsing from referer or fallback to "/"
        pathname =
            (await headers())
                .get("referer")
                ?.replace(/^https?:\/\/[^/]+/, "") || "/";
    }

    const isAuthRoute =
        pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

    const isHomePage = pathname === "/";

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium"><Link href={isHomePage ? "/" : "/dashboard"}>{websiteDetails.websiteName}</Link></h1>

                {/* Right Side */}
                <div className="ml-auto flex items-center gap-2">
                    {/* Notification Icon, Dark Mode Icon,User Icon */}
                    <section className="flex items-center">
                        <NotificationIcon />

                        {/* Theme Toggle */}
                        <ModeToggle />

                        {/* User detail */}
                        {session ? <TopNavUser /> : <></>}
                    </section>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
