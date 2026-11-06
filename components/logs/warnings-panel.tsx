"use client"

import * as React from "react"
import { ArrowRightIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, GitCommitHorizontalIcon, XIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { warnings } from "@/lib/data/logs-data"

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("")

export function WarningsPanel() {
  const [done, setDone] = React.useState<Set<string>>(new Set())
  const [open, setOpen] = React.useState<number | null>(null)
  const review = (id: string) => setDone((s) => new Set(s).add(id))
  const w = open === null ? null : warnings[open]
  const left = warnings.filter((x) => !done.has(x.id))
  const owners = new Set(left.map((x) => x.owner)).size
  const afterDeploy = left.filter((x) => x.after).length
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Warnings to review</FrameTitle>
            <FrameDescription>Newest first, oldest 16h ago</FrameDescription>
          </div>
          <Button variant="muted" size="sm" disabled={!left.length} onClick={() => setOpen(warnings.indexOf(left[0]))}>Review all <ArrowRightIcon /></Button>
        </FrameHeader>
        <div className="flex flex-wrap items-baseline gap-x-2 px-4 text-sm">
          <span className="text-2xl font-semibold tabular-nums">{left.length}</span>
          <span className="text-muted-foreground">to review · {owners} owner{owners === 1 ? "" : "s"}{afterDeploy > 0 && " ·"}</span>
          {afterDeploy > 0 && <span className="flex items-center gap-1 text-muted-foreground"><GitCommitHorizontalIcon className="size-3.5 text-warning" />{afterDeploy} after v3.5.0 deploy</span>}
        </div>
        <div className="px-4 pt-3">
          <div className="flex h-1.5 overflow-hidden rounded-full">
            <span className="bg-success transition-[flex]" style={{ flex: done.size }} />
            <span className="bg-[repeating-linear-gradient(135deg,var(--color-amber-400)_0_4px,var(--color-amber-300)_4px_8px)] transition-[flex]" style={{ flex: left.length }} />
          </div>
          <div className="mt-1 text-right text-[11px] text-muted-foreground">{done.size} of {warnings.length} reviewed</div>
        </div>
        <div className="flex flex-col px-2 py-2">
          {warnings.map((x, i) => (
            <Item key={x.id} size="sm" className="group/warning cursor-pointer hover:bg-muted/50 data-[done=true]:opacity-50" data-done={done.has(x.id)} onClick={() => setOpen(i)}>
              <ItemMedia><Avatar className="size-5"><AvatarFallback className="text-[9px]">{initials(x.owner)}</AvatarFallback></Avatar></ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {x.owner}
                  {x.after && <span className="flex items-center gap-1 text-xs font-normal text-warning-foreground"><GitCommitHorizontalIcon className="size-3" />{x.after}</span>}
                </ItemTitle>
                <ItemDescription className="font-mono text-[11px]">{x.event} · {x.resource}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <span className="text-xs text-muted-foreground group-hover/warning:hidden">{x.ago}</span>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="ghost" size="icon-xs" className="hidden group-hover/warning:inline-flex" aria-label={`Mark ${x.owner}'s ${x.event} on ${x.resource}, ${x.ago}, reviewed`} disabled={done.has(x.id)} onClick={(e) => { e.stopPropagation(); review(x.id) }} />}><CheckIcon /></TooltipTrigger>
                  <TooltipContent>Mark reviewed</TooltipContent>
                </Tooltip>
              </ItemActions>
            </Item>
          ))}
        </div>
      </FramePanel>
      <Sheet open={!!w} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="gap-0 data-[side=right]:sm:max-w-lg" showCloseButton={false}>
          {w && open !== null && (
            <>
              <SheetHeader className="gap-2 border-b">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-mono">{w.id}</span>
                  <span className="ml-auto tabular-nums">{open + 1} of {warnings.length}</span>
                  <Button variant="ghost" size="icon-sm" aria-label="Previous warning" disabled={open === 0} onClick={() => setOpen(open - 1)}><ChevronLeftIcon /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Next warning" disabled={open === warnings.length - 1} onClick={() => setOpen(open + 1)}><ChevronRightIcon /></Button>
                  <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}><XIcon /></SheetClose>
                </div>
                <SheetTitle className="flex items-center gap-2 font-mono">{w.event}<Badge variant="warning-light">{w.level}</Badge></SheetTitle>
                <SheetDescription render={<div />} className="flex flex-col gap-1">
                  <span className="text-xs">{w.owner} · {w.time.replace(/^(\w+ \d+),/, "$1, 2026,")} UTC</span>
                  <span className="text-foreground">{w.summary}</span>
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4">
                {w.note && (
                  <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 p-3">
                    <div className="font-medium">Warning</div>
                    <div className="text-muted-foreground">{w.note}</div>
                  </div>
                )}
                {([
                  ["Actor", [["Name", w.owner], ["Role", w.role], ["Auth", w.auth], ["Session", w.session], ["Pod IP", `${w.ip} · ${w.ipNote ?? "Pod network"}`], ["User agent", w.agent]]],
                  ["Target", [["Resource", w.resource], ["Resource ID", w.resourceId], ["Environment", "Production"], ["Cluster", w.cluster], ["Source", w.source]]],
                  ["Request", [["Correlation ID", w.correlation], ["Trace ID", w.trace], ["Recorded", `${w.time} UTC · ${w.ago}`]]],
                ] as const).map(([title, rows]) => (
                  <section key={title} className="border-b py-2 last:border-0">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase">{title}</h3>
                    <dl className="text-sm">
                      {rows.map(([l, v]) => (
                        <div key={l} className="grid grid-cols-[7rem_1fr] gap-3 py-1.5"><dt className="text-muted-foreground">{l}</dt><dd className="min-w-0 break-words">{v}</dd></div>
                      ))}
                      {title === "Request" && (
                        <div className="grid grid-cols-[7rem_1fr] gap-3 py-1.5"><dt className="text-muted-foreground">Review</dt><dd>{done.has(w.id) ? <Badge variant="success-light">Reviewed</Badge> : <Badge variant="warning-light">Needs review</Badge>}</dd></div>
                      )}
                    </dl>
                  </section>
                ))}
              </div>
              <SheetFooter className="flex-row border-t">
                <Button size="sm" disabled={done.has(w.id)} onClick={() => { review(w.id); const next = warnings.findIndex((x, k) => k !== open && !done.has(x.id)); setOpen(next < 0 ? null : next) }}><CheckIcon /> Mark reviewed</Button>
                <SheetClose render={<Button variant="muted" size="sm" className="ml-auto" />}>Close</SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Frame>
  )
}
