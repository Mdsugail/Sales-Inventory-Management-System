"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Download, Upload, Save, Trash2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [lowStockThreshold, setLowStockThreshold] = useState("5")
  const [companyName, setCompanyName] = useState("Inventory System")
  const [darkMode, setDarkMode] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }

    // Load settings from local storage
    const settings = JSON.parse(localStorage.getItem("settings") || "{}")
    if (settings.lowStockThreshold) setLowStockThreshold(settings.lowStockThreshold)
    if (settings.companyName) setCompanyName(settings.companyName)
    if (settings.darkMode) setDarkMode(settings.darkMode)

    // Apply dark mode if enabled
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [user, router])

  const saveSettings = () => {
    const settings = {
      lowStockThreshold,
      companyName,
      darkMode,
    }
    localStorage.setItem("settings", JSON.stringify(settings))

    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })
  }

  const exportData = (type: string) => {
    let data
    let filename

    if (type === "all") {
      data = {
        products: JSON.parse(localStorage.getItem("products") || "[]"),
        sales: JSON.parse(localStorage.getItem("sales") || "[]"),
        settings: JSON.parse(localStorage.getItem("settings") || "{}"),
      }
      filename = `inventory-system-backup-${new Date().toISOString().split("T")[0]}.json`
    } else if (type === "products") {
      data = JSON.parse(localStorage.getItem("products") || "[]")
      filename = `products-${new Date().toISOString().split("T")[0]}.json`
    } else if (type === "sales") {
      data = JSON.parse(localStorage.getItem("sales") || "[]")
      filename = `sales-${new Date().toISOString().split("T")[0]}.json`
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: `Data has been exported to ${filename}.`,
    })
  }

  const exportCSV = (type: string) => {
    let data: any[]
    let filename: string
    let csvContent: string

    if (type === "products") {
      data = JSON.parse(localStorage.getItem("products") || "[]")
      filename = `products-${new Date().toISOString().split("T")[0]}.csv`

      // Create CSV header
      csvContent = "ID,Name,Category,Price,Stock\n"

      // Add data rows
      data.forEach((item) => {
        csvContent += `${item.id},"${item.name}","${item.category}",${item.price},${item.stock}\n`
      })
    } else if (type === "sales") {
      data = JSON.parse(localStorage.getItem("sales") || "[]")
      filename = `sales-${new Date().toISOString().split("T")[0]}.csv`

      // Create CSV header
      csvContent = "ID,Date,Customer,Total Price,Items\n"

      // Add data rows
      data.forEach((item) => {
        csvContent += `${item.id},"${new Date(item.date).toLocaleDateString()}","${item.customerName || "Walk-in Customer"}",${item.totalPrice},${item.items.length}\n`
      })
    } else {
      toast({
        title: "Export failed",
        description: "Invalid export type.",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: `Data has been exported to ${filename}.`,
    })
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        // Check if it's a valid data structure
        if (data.products) {
          // It's a full backup
          localStorage.setItem("products", JSON.stringify(data.products))
          localStorage.setItem("sales", JSON.stringify(data.sales))
          if (data.settings) {
            localStorage.setItem("settings", JSON.stringify(data.settings))
          }

          toast({
            title: "Import successful",
            description: "All data has been imported successfully.",
          })
        } else if (Array.isArray(data) && data.length > 0) {
          // It's either products or sales
          if (data[0].hasOwnProperty("stock")) {
            // It's products
            localStorage.setItem("products", JSON.stringify(data))
            toast({
              title: "Import successful",
              description: `${data.length} products have been imported.`,
            })
          } else if (data[0].hasOwnProperty("items")) {
            // It's sales
            localStorage.setItem("sales", JSON.stringify(data))
            toast({
              title: "Import successful",
              description: `${data.length} sales records have been imported.`,
            })
          } else {
            throw new Error("Unknown data format")
          }
        } else {
          throw new Error("Invalid data format")
        }

        // Reload the page to reflect changes
        window.location.reload()
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is invalid or corrupted.",
          variant: "destructive",
        })
      }
    }

    reader.readAsText(file)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetSystem = () => {
    // Clear all data except users
    localStorage.removeItem("products")
    localStorage.removeItem("sales")
    localStorage.removeItem("settings")

    toast({
      title: "System reset",
      description: "All data has been cleared. The page will reload.",
    })

    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  if (user?.role !== "admin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Configure system settings and manage data</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Products with stock below this number will be marked as low stock
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="darkMode" checked={darkMode} onCheckedChange={setDarkMode} />
                <Label htmlFor="darkMode">Dark Mode</Label>
              </div>

              <Button onClick={saveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Export your data for backup or analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => exportData("all")} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data (JSON)
                </Button>
                <Button onClick={() => exportData("products")} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Products (JSON)
                </Button>
                <Button onClick={() => exportData("sales")} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Sales (JSON)
                </Button>
                <Button onClick={() => exportCSV("products")} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Products (CSV)
                </Button>
                <Button onClick={() => exportCSV("sales")} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Sales (CSV)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>Import data from a backup file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="importFile">Select JSON file to import</Label>
                <div className="flex items-center gap-2">
                  <Input id="importFile" type="file" accept=".json" ref={fileInputRef} onChange={handleImport} />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Supported formats: Full backup, Products only, or Sales only</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Management</CardTitle>
              <CardDescription>Advanced system operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset System
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset System</DialogTitle>
                    <DialogDescription>
                      This will delete all products, sales, and settings. User accounts will be preserved. This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center p-4 bg-amber-50 text-amber-800 rounded-md">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <p>All data will be permanently deleted.</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={resetSystem}>
                      Reset System
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

