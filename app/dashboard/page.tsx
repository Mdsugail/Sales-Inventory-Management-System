"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react"

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [lowStockItems, setLowStockItems] = useState(0)

  useEffect(() => {
    // Load data from local storage
    const products = JSON.parse(localStorage.getItem("products") || "[]")
    const sales = JSON.parse(localStorage.getItem("sales") || "[]")

    // Calculate dashboard metrics
    setTotalProducts(products.length)
    setTotalSales(sales.length)
    setTotalRevenue(sales.reduce((sum: number, sale: any) => sum + sale.totalPrice, 0))
    setLowStockItems(products.filter((product: any) => product.stock < 5).length)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Overview of your inventory and sales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProducts}</div>
            <p className="text-xs text-gray-500">Items in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSales}</div>
            <p className="text-xs text-gray-500">Orders processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">From all sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-gray-500">Items below threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <LowStockAlerts />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RecentSales() {
  const [recentSales, setRecentSales] = useState<any[]>([])

  useEffect(() => {
    const sales = JSON.parse(localStorage.getItem("sales") || "[]")
    setRecentSales(sales.slice(-5).reverse())
  }, [])

  if (recentSales.length === 0) {
    return <p className="text-gray-500">No sales recorded yet.</p>
  }

  return (
    <div className="space-y-4">
      {recentSales.map((sale) => (
        <div key={sale.id} className="flex justify-between items-center">
          <div>
            <p className="font-medium">Order #{sale.id}</p>
            <p className="text-sm text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">${sale.totalPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-500">{sale.items.length} items</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function LowStockAlerts() {
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem("products") || "[]")
    setLowStockProducts(products.filter((product: any) => product.stock < 5))
  }, [])

  if (lowStockProducts.length === 0) {
    return <p className="text-gray-500">No low stock items.</p>
  }

  return (
    <div className="space-y-4">
      {lowStockProducts.map((product) => (
        <div key={product.id} className="flex justify-between items-center">
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
          <div className="text-right">
            <p className={`font-medium ${product.stock <= 0 ? "text-red-500" : "text-orange-500"}`}>
              {product.stock} in stock
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

