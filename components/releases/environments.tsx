import { ArrowRightIcon, GitCommitHorizontalIcon, MoreHorizontalIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { environments } from "@/lib/data/releases-data"
import { cn } from "@/lib/utils"

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("")

export function Environments() {
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Environments</FrameTitle>
            <FrameDescription>8 services across 3 environments</FrameDescription>
          </div>
          <Select defaultValue="services" items={[{ value: "services", label: "Services" }, { value: "regions", label: "Regions" }]}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="regions">Regions</SelectItem>
            </SelectContent>
          </Select>
        </FrameHeader>
        <div className="grid items-stretch gap-3 px-4 pb-4 @3xl:grid-cols-3">
          {environments.map((e, i) => (
            <div key={e.name} className="relative flex flex-col gap-3 rounded-lg border bg-card p-3">
              {i > 0 && <ArrowRightIcon className="absolute -left-[17px] top-1/2 hidden size-3.5 -translate-y-1/2 text-muted-foreground @3xl:block" />}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{e.name}</span>
                <Badge variant={e.tone}>{e.health}</Badge>
                <Button variant="ghost" size="icon-xs" className="ml-auto" aria-label="More"><MoreHorizontalIcon /></Button>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                {e.regions.map((r) => <span key={r} className="font-mono">{r}</span>)}
                {e.note && <span>{e.note}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{e.service}</span>
                <Badge variant={e.status === "Running" ? "info-light" : "success-light"} className="ml-auto">{e.status}</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold tabular-nums">{e.version}</span>
                <span className="text-xs text-muted-foreground">from {e.from}</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="flex shrink-0 items-center gap-1 font-mono text-muted-foreground"><GitCommitHorizontalIcon className="size-3.5" />{e.sha}</span>
                <span className="line-clamp-2 text-muted-foreground">{e.message}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-1.5 flex-1 gap-0.5 overflow-hidden rounded-full">
                  {Array.from({ length: 6 }, (_, k) => (
                    <span key={k} className={cn("flex-1", e.status === "Running" && k >= 3 ? "bg-muted" : "bg-success")} />
                  ))}
                </div>
                <span className="text-[11px] tabular-nums text-muted-foreground">{e.progress}</span>
              </div>
              <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <Avatar className="size-5"><AvatarFallback className="text-[9px]">{initials(e.author)}</AvatarFallback></Avatar>
                {e.author}
                <span className="ml-auto">{e.when}</span>
              </div>
            </div>
          ))}
        </div>
      </FramePanel>
    </Frame>
  )
}
