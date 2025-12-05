// import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { AppSidebar } from "@/components/app-layout/app-sidebar";
// import Navbar from "@/components/app-layout/Navbar";

// export async function ConditionalLayout({ children }: { children: React.ReactNode }) {
//     const headersList = await headers();

//     // Get the pathname from various possible header sources
//     let pathname =
//         headersList.get("x-invoke-path") ||
//         headersList.get("x-pathname") ||
//         headersList.get("x-url")?.split("?")[0] ||
//         "";

//     // Fallback: try to get from referer header
//     if (!pathname || pathname === "[[...path]]") {
//         const referer = headersList.get("referer");
//         if (referer) {
//             try {
//                 const url = new URL(referer);
//                 pathname = url.pathname;
//             } catch {
//                 pathname = "/";
//             }
//         } else {
//             pathname = "/";
//         }
//     }

//     // Get session to check authentication status
//     const session = await auth.api.getSession({
//         headers: await headers(),
//     });

//     const isAuthRoute =
//         pathname.startsWith("/signin") || pathname.startsWith("/signup");
//     const isHomePage = pathname === "/";

//     // Redirect logged-in users away from auth pages
//     if (isAuthRoute && session?.user) {
//         redirect("/dashboard");
//     }

//     // For auth routes and home page, show simple layout
//     // if (isAuthRoute || isHomePage) {
//     //     return (
//     //         <>
//     //             <div className="container mx-auto flex flex-col min-h-screen">
//     //                 <Navbar user={session?.user || null} showSidebarTrigger={false} />
//     //                 <div className="flex flex-1 items-center justify-center p-4">
//     //                     {children}
//     //                 </div>
//     //             </div>
//     //             <Toaster />
//     //         </>
//     //     );
//     // }

//     // For protected routes, show sidebar layout (dashboard type)
//     return (
//         <>
//             {
//                 !isAuthRoute || !isHomePage ? (
//                     <>
//                         <AppSidebar variant="inset" />
//                         <SidebarInset>
//                             <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b bg-background px-4">
//                                 <SidebarTrigger className="-ml-1" />
//                                 <div className="flex flex-1 items-center justify-end gap-4">
//                                     <Navbar user={session?.user || null} showSidebarTrigger={false} />
//                                 </div>
//                             </header>
//                             <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 pt-6">
//                                 <div className="w-full">{children}</div>
//                             </main>
//                         </SidebarInset>
//                     </>
//                 ) : (
//                     <>
//                         <AppSidebar />
//                         <SidebarInset>
//                             <div className="flex flex-1 items-center justify-end gap-4">
//                                 <Navbar user={session?.user || null} showSidebarTrigger={false} />
//                             </div>
//                         </SidebarInset>
//                     </>
//                 )
//             }
//         </>
//     );
// }
