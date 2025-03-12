"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download } from "lucide-react"

type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  image?: string
}

type SaleItem = {
  productId: number
  productName: string
  quantity: number
  price: number
  total: number
}

type Sale = {
  id: number
  date: string
  items: SaleItem[]
  totalPrice: number
  customerName?: string
}

export default function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [reportType, setReportType] = useState<string>("sales")
  const [timeFrame, setTimeFrame] = useState<string>("all")
  const [chartVisible, setChartVisible] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load data from local storage
    const storedProducts = JSON.parse(localStorage.getItem("products") || "[]")
    const storedSales = JSON.parse(localStorage.getItem("sales") || "[]")
    setProducts(storedProducts)
    setSales(storedSales)

    // Handle ResizeObserver error
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes("ResizeObserver") || event.error?.message?.includes("ResizeObserver")) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener("error", handleError as any)
    window.addEventListener("unhandledrejection", handleError as any)

    // Set chart visible after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setChartVisible(true)
    }, 300)

    return () => {
      window.removeEventListener("error", handleError as any)
      window.removeEventListener("unhandledrejection", handleError as any)
      clearTimeout(timer)
    }
  }, [])

  const filteredSales = sales.filter((sale) => {
    if (timeFrame === "all") return true

    const saleDate = new Date(sale.date)
    const now = new Date()

    if (timeFrame === "today") {
      return saleDate.toDateString() === now.toDateString()
    } else if (timeFrame === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)
      return saleDate >= weekAgo
    } else if (timeFrame === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(now.getMonth() - 1)
      return saleDate >= monthAgo
    }

    return true
  })

  const exportData = () => {
    let dataToExport

    if (reportType === "sales") {
      dataToExport = filteredSales
    } else if (reportType === "inventory") {
      dataToExport = products
    } else {
      dataToExport = {
        sales: filteredSales,
        products: products,
      }
    }

    const jsonString = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Prepare data for charts
  const salesByDate = filteredSales.reduce((acc: any, sale) => {
    const date = new Date(sale.date).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = 0
    }
    acc[date] += sale.totalPrice
    return acc
  }, {})

  const salesChartData = Object.keys(salesByDate).map((date) => ({
    date,
    amount: salesByDate[date],
  }))

  // Top selling products
  const productSales: Record<number, { name: string; quantity: number; revenue: number }> = {}

  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        }
      }
      productSales[item.productId].quantity += item.quantity
      productSales[item.productId].revenue += item.total
    })
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((product) => ({
      name: product.name,
      revenue: product.revenue,
      quantity: product.quantity,
    }))

  // Category distribution
  const categoryData = products.reduce((acc: any, product) => {
    if (!acc[product.category]) {
      acc[product.category] = 0
    }
    acc[product.category] += 1
    return acc
  }, {})

  const pieChartData = Object.keys(categoryData).map((category) => ({
    name: category,
    value: categoryData[category],
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

  const exportCSV = () => {
    let csvContent = ""
    let filename = ""

    if (reportType === "sales") {
      // Create header row
      csvContent = "ID,Date,Customer,Total Price\n"

      // Add data rows
      filteredSales.forEach((sale) => {
        csvContent += `${sale.id},${new Date(sale.date).toLocaleDateString()},"${sale.customerName || "Walk-in Customer"}",${sale.totalPrice.toFixed(2)}\n`
      })

      filename = `sales-report-${new Date().toISOString().split("T")[0]}.csv`
    } else if (reportType === "inventory") {
      // Create header row
      csvContent = "ID,Name,Category,Price,Stock\n"

      // Add data rows
      products.forEach((product) => {
        csvContent += `${product.id},"${product.name}","${product.category}",${product.price.toFixed(2)},${product.stock}\n`
      })

      filename = `inventory-report-${new Date().toISOString().split("T")[0]}.csv`
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
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-500">View and export sales and inventory reports</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button onClick={exportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Report</SelectItem>
              <SelectItem value="inventory">Inventory Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time Frame</label>
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger>
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {reportType === "sales" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80" ref={chartRef}>
                {chartVisible && salesChartData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Legend />
                      <Bar dataKey="amount" name="Sales Amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {salesChartData.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No sales data available for the selected time period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">${product.revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No sales data available for the selected time period
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "inventory" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80" ref={chartRef}>
                {chartVisible && pieChartData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {pieChartData.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-500">No product data available</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              {products.filter((product) => product.stock < 5).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products
                      .filter((product) => product.stock < 5)
                      .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell className="text-right text-orange-500 font-medium">{product.stock}</TableCell>
                          <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-gray-500">No low stock items found</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

