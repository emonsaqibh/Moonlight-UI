"use client"

import * as React from "react"
import { ClockIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { deploys, type DeployState } from "@/lib/data/deploy-data"

const variant: Record<DeployState, React.ComponentProps<typeof Badge>["variant"]> = {
  failed: "destructive-light",
  "rolled-back": "secondary",
  deployed: "success-light",
  checks: "info-light",
  rolling: "primary-light",
  queued: "outline",
  approval: "warning-light",
  scheduled: "outline",
}

export function DeployBoard() {
  const [tab, setTab] = React.useState("deploys")
  return (
    <Frame>
      <FramePanel className="p-0">
        <FrameHeader className="flex-row items-start justify-between">
          <div>
            <FrameTitle>Deploy Board</FrameTitle>
            <FrameDescription>Main ships to production every 20 minutes</FrameDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Next window 14:20
            <Badge variant="outline" className="font-mono tabular-nums"><ClockIcon />14:00 UTC</Badge>
          </div>
        </FrameHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList variant="line">
            <TabsTrigger value="deploys">Deploys <Badge variant="outline" size="sm" radius="full">12</Badge></TabsTrigger>
            <TabsTrigger value="merges">Merges <Badge variant="outline" size="sm" radius="full">7</Badge></TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <InputGroup className="max-w-56">
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput placeholder="Search" />
          </InputGroup>
          <div className="flex items-center gap-2">
            <Button variant="muted" size="sm">All envs</Button>
            <Button variant="muted" size="icon" aria-label="Display"><SlidersHorizontalIcon /></Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {["Time", "Service", "Version", "Environment", "Status"].map((h) => <TableHead key={h} className="text-xs uppercase tracking-wide text-muted-foreground">{h}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {deploys.map((d) => (
              <TableRow key={d.id} aria-label={`Open ${d.id}, ${d.service} ${d.version} to ${d.env} ${d.region}, ${d.label}`} className="cursor-pointer">
                <TableCell><Badge variant="outline" className="font-mono tabular-nums">{d.time}</Badge></TableCell>
                <TableCell className="font-medium">{d.service}</TableCell>
                <TableCell title={`${d.version}, from ${d.from}`}><Badge variant="outline" className="font-mono">{d.version}</Badge></TableCell>
                <TableCell><Badge variant="outline">{d.env}</Badge></TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <Badge variant={variant[d.state]}>{d.label}</Badge>
                    {d.state === "approval" && <span className="text-xs text-muted-foreground">20 min</span>}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <FrameFooter className="flex-row justify-between border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" />Needs approval</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Rolling out</span>
          </span>
          <span>All times UTC</span>
        </FrameFooter>
      </FramePanel>
    </Frame>
  )
}
