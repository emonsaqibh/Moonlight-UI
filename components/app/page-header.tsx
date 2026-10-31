import { Fragment } from "react"

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/app/theme"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function PageHeader({ crumbs, children }: { crumbs: string[]; children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3 lg:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" />
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((c, i) => (
            <Fragment key={c}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>{i === crumbs.length - 1 ? <BreadcrumbPage>{c}</BreadcrumbPage> : c}</BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        {children}
        <ThemeToggle />
      </div>
    </header>
  )
}
