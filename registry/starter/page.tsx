import { PlusIcon, ServerIcon } from "lucide-react"

import { AppSidebar } from "@/components/app/app-sidebar"
import { PageBody } from "@/components/app/page-body"
import { PageHeader } from "@/components/app/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { IconTile } from "@/components/ui/icon-tile"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const rows = [
  { name: "api-gateway", owner: "Platform", status: "Healthy", tone: "success-light" },
  { name: "checkout", owner: "Payments", status: "Degraded", tone: "warning-light" },
  { name: "search-index", owner: "Search", status: "Down", tone: "destructive-light" },
] as const

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <PageHeader crumbs={["Overview"]}>
          <Button><PlusIcon /> New service</Button>
        </PageHeader>
        <PageBody>
          <Frame>
            <FramePanel className="p-0">
              <FrameHeader>
                <div className="flex items-center gap-3">
                  <IconTile variant="frame" size="sm"><ServerIcon /></IconTile>
                  <div>
                    <FrameTitle>Services</FrameTitle>
                    <FrameDescription>Status over the last 24 hours</FrameDescription>
                  </div>
                </div>
              </FrameHeader>
              <Table>
                <TableHeader>
                  <TableRow>{["Service", "Owner", "Status"].map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.owner}</TableCell>
                      <TableCell><Badge variant={r.tone}>{r.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </FramePanel>
          </Frame>
        </PageBody>
      </SidebarInset>
    </SidebarProvider>
  )
}
