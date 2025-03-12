"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check if dark mode is enabled in settings
    const settings = JSON.parse(localStorage.getItem("settings") || "{}")
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    setMounted(true)

    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  // Handle ResizeObserver error
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes("ResizeObserver") || event.error?.message?.includes("ResizeObserver")) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener("error", handleError as any)
    window.addEventListener("unhandledrejection", handleError as any)

    return () => {
      window.removeEventListener("error", handleError as any)
      window.removeEventListener("unhandledrejection", handleError as any)
    }
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}

