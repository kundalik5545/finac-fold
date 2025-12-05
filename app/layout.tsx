import { ThemeProvider } from "@/providers/theme-provider";
import { AppSidebar } from "@/components/app-layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/app-layout/Navbar";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Dashboard Design",
  description: "My Dashboard Design",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider
            style={{
              "--sidebar-width": "calc(var(--spacing) * 60)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
          >
            {/* App Layout */}
            <AppSidebar variant="inset" />
            <SidebarInset>
              <Navbar />
              {/* <Toaster />
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {children}
                  </div>
                </div>
              </div> */}
              <main className="container mx-auto pt-1">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
