"use client"

import * as React from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export type Theme = "light" | "dark" | "system"

const KEY = "theme"
const EVENT = "themechange"

/** Runs before first paint (in the root layout's / index.html's <head>) so there is no light flash in dark mode. Plain literal,
 * so it can be pasted into an HTML file as-is; "theme" is KEY. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`

function read(): Theme {
  try {
    return (localStorage.getItem(KEY) as Theme) || "system"
  } catch {
    return "system"
  }
}

function apply(t: Theme) {
  const dark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", dark)
}

export function setTheme(t: Theme) {
  try {
    localStorage.setItem(KEY, t)
  } catch {}
  apply(t)
  window.dispatchEvent(new Event(EVENT))
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = React.useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb)
      return () => window.removeEventListener(EVENT, cb)
    },
    read,
    () => "system" as Theme
  )
  React.useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => theme === "system" && apply("system")
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [theme])
  return [theme, setTheme]
}

const order: Theme[] = ["light", "dark", "system"]
const icons = { light: SunIcon, dark: MoonIcon, system: MonitorIcon }

/** Cycles light, dark, system. */
export function ThemeToggle() {
  const [theme, set] = useTheme()
  const Icon = icons[theme]
  return (
    <Button
      variant="muted"
      size="icon"
      aria-label={`Color theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
      onClick={() => set(order[(order.indexOf(theme) + 1) % order.length])}
    >
      <Icon />
    </Button>
  )
}
