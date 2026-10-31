"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function RangeToggle({ options, defaultValue }: { options: string[]; defaultValue: string }) {
  return (
    <ToggleGroup defaultValue={[defaultValue]} variant="outline" size="sm" onValueChange={() => {}}>
      {options.map((o) => <ToggleGroupItem key={o} value={o}>{o}</ToggleGroupItem>)}
    </ToggleGroup>
  )
}
