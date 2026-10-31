import { cn } from "@/lib/utils"

type RunStatus = "Succeeded" | "Failed" | "Timed Out"

const tone: Record<RunStatus, string> = {
  Succeeded: "bg-success/70",
  Failed: "bg-destructive",
  "Timed Out": "bg-warning",
}

/** A row of thin bars, one per recent run. */
export function RunStrip({ runs, className, tall }: { runs: RunStatus[]; className?: string; tall?: boolean }) {
  return (
    <div className={cn("flex items-center gap-[2px]", className)}>
      {runs.map((r, i) => (
        <span key={i} title={r} className={cn("w-[3px] rounded-[1px]", tall ? "h-4" : "h-3.5", tone[r])} />
      ))}
    </div>
  )
}
