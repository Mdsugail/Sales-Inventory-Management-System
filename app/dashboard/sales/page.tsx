"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Plus, FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { NewSaleForm } from "@/components/new-sale-form"
import { SaleInvoice } from "@/components/sale-invoice"

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

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load sales and products from local storage
    const storedSales = JSON.parse(localStorage.getItem("sales") || "[]")
    const storedProducts = JSON.parse(localStorage.getItem("products") || "[]")
    setSales(storedSales)
    setProducts(storedProducts)
  }, [])

  const handleAddSale = (sale: Omit<Sale, "id" | "date">) => {
    // Create new sale with ID and date
    const newSale = {
      ...sale,
      id: Date.now(),
      date: new Date().toISOString(),
    }

    // Update product stock levels
    const updatedProducts = [...products]
    for (const item of sale.items) {
      const productIndex = updatedProducts.findIndex((p) => p.id === item.productId)
      if (productIndex !== -1) {
        updatedProducts[productIndex].stock -= item.quantity
      }
    }

    // Save updated products and new sale
    localStorage.setItem("products", JSON.stringify(updatedProducts))
    localStorage.setItem("sales", JSON.stringify([...sales, newSale]))

    // Update state
    setProducts(updatedProducts)
    setSales([...sales, newSale])

    toast({
      title: "Sale recorded",
      description: `Sale #${newSale.id} has been recorded successfully.`,
    })

    return newSale
  }

  const filteredSales = sales
    .filter((sale) => {
      if (!searchTerm) return true

      // Search by sale ID or customer name
      return (
        sale.id.toString().includes(searchTerm) ||
        (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-gray-500">Record and manage sales</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
              <DialogDescription>Add products to the sale and record customer information.</DialogDescription>
            </DialogHeader>
            <NewSaleForm products={products} onSubmit={handleAddSale} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search sales..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredSales.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No sales recorded yet. Create a new sale to get started.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">#{sale.id}</TableCell>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell>{sale.customerName || "Walk-in Customer"}</TableCell>
                  <TableCell>{sale.items.length} items</TableCell>
                  <TableCell>${sale.totalPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedSale(sale)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedSale && (
        <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
          <DialogContent className="max-w-3xl">
            <SaleInvoice sale={selectedSale} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

