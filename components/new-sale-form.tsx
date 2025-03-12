"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"

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
  items: SaleItem[]
  totalPrice: number
  customerName?: string
}

type NewSaleFormProps = {
  products: Product[]
  onSubmit: (sale: Sale) => any
}

export function NewSaleForm({ products, onSubmit }: NewSaleFormProps) {
  const [items, setItems] = useState<SaleItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("1")
  const [customerName, setCustomerName] = useState<string>("")
  const [showInvoice, setShowInvoice] = useState(false)
  const [completedSale, setCompletedSale] = useState<any>(null)

  const availableProducts = products.filter((p) => p.stock > 0 && !items.some((item) => item.productId === p.id))

  const addItem = () => {
    if (!selectedProductId || Number.parseInt(quantity) <= 0) return

    const productId = Number.parseInt(selectedProductId)
    const product = products.find((p) => p.id === productId)

    if (!product) return

    const newItem: SaleItem = {
      productId,
      productName: product.name,
      quantity: Number.parseInt(quantity),
      price: product.price,
      total: product.price * Number.parseInt(quantity),
    }

    setItems([...items, newItem])
    setSelectedProductId("")
    setQuantity("1")
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) return

    const sale: Sale = {
      items,
      totalPrice: calculateTotal(),
      customerName: customerName || undefined,
    }

    const completedSale = onSubmit(sale)
    setCompletedSale(completedSale)
    setShowInvoice(true)
  }

  if (showInvoice && completedSale) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">Sale Completed</h2>
          <p className="text-gray-500">Sale #{completedSale.id} has been recorded successfully.</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold">Invoice #{completedSale.id}</h3>
              <p className="text-sm text-gray-500">{new Date(completedSale.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Customer</p>
              <p>{completedSale.customerName || "Walk-in Customer"}</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedSale.items.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">${completedSale.totalPrice.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => window.print()}>Print Invoice</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              New Sale
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="customerName">Customer Name (Optional)</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-4">Add Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="product">Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger id="product">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No products available
                  </SelectItem>
                ) : (
                  availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} (${product.price.toFixed(2)}) - {product.stock} in stock
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <Button type="button" onClick={addItem} disabled={!selectedProductId}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">${calculateTotal().toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={items.length === 0}>
          Complete Sale
        </Button>
      </div>
    </form>
  )
}

