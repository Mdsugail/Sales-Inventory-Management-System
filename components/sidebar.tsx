"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, BarChart, Users, Settings, LogOut, Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    // Check if dark mode is enabled
    const settings = JSON.parse(localStorage.getItem("settings") || "{}")
    setIsDarkMode(settings.darkMode || false)
  }, [])

  const toggleTheme = () => {
    const settings = JSON.parse(localStorage.getItem("settings") || "{}")
    const newDarkMode = !isDarkMode

    // Update state
    setIsDarkMode(newDarkMode)

    // Update settings in local storage
    settings.darkMode = newDarkMode
    localStorage.setItem("settings", JSON.stringify(settings))

    // Apply dark mode
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Products",
      icon: Package,
      href: "/dashboard/products",
      active: pathname === "/dashboard/products",
    },
    {
      label: "Sales",
      icon: ShoppingCart,
      href: "/dashboard/sales",
      active: pathname === "/dashboard/sales",
    },
    {
      label: "Reports",
      icon: BarChart,
      href: "/dashboard/reports",
      active: pathname === "/dashboard/reports",
    },
  ]

  // Admin-only routes
  if (isAdmin) {
    routes.push({
      label: "Users",
      icon: Users,
      href: "/dashboard/users",
      active: pathname === "/dashboard/users",
    })
    routes.push({
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    })
  }

  return (
    <div className="flex flex-col h-full w-64 bg-gray-900 text-white dark:bg-gray-950">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold">Inventory System</h2>
        <p className="text-sm text-gray-400">Logged in as {user?.role}</p>
      </div>
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                route.active
                  ? "bg-gray-800 text-white dark:bg-gray-700"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700",
              )}
            >
              <route.icon className="mr-3 h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700"
          onClick={toggleTheme}
        >
          {isDarkMode ? (
            <>
              <Sun className="mr-3 h-5 w-5" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="mr-3 h-5 w-5" />
              Dark Mode
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}

