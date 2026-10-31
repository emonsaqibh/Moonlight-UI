import { cn } from "@/lib/utils"

export function PageBody({ className, ...props }: React.ComponentProps<"main">) {
  return <main className={cn("@container flex min-w-0 flex-col gap-4 p-4", className)} {...props} />
}
