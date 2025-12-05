import { ThemeProvider } from "@/providers/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/app-layout/Navbar";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalAppLayout from "@/components/app-layout/conditional-app-layout";

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
            <ConditionalAppLayout />

            <SidebarInset>
              <Navbar />
              <main className="container mx-auto pt-1">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
