import { AppSidebar } from "@/components/app/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ShadcnLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">{children}</SidebarInset>
    </SidebarProvider>
  )
}
