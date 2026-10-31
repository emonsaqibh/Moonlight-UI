import { AppSidebar } from "@/components/app/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

/** The shadcn-based rebuild. The pixel-exact Strata replica lives under /exact. */
export default function ShadcnLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">{children}</SidebarInset>
    </SidebarProvider>
  )
}
