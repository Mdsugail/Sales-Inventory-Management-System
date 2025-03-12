"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer } from "lucide-react"

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

type SaleInvoiceProps = {
  sale: Sale
}

export function SaleInvoice({ sale }: SaleInvoiceProps) {
  const handlePrint = () => {
    window.print()
  }

  // Get company name from settings
  const settings = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("settings") || "{}") : {}
  const companyName = settings.companyName || "Inventory System"

  return (
    <div className="space-y-6 print-container">
      <div className="border-b pb-4 print-only">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Invoice #{sale.id}</h2>
          <Button onClick={handlePrint} className="no-print">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
        <p className="text-gray-500">
          {new Date(sale.date).toLocaleDateString()} at {new Date(sale.date).toLocaleTimeString()}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold text-lg">{companyName}</h3>
            <p className="text-gray-500">Invoice #{sale.id}</p>
            <p className="text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold">Customer</h3>
            <p>{sale.customerName || "Walk-in Customer"}</p>
          </div>
        </div>

        <div className="responsive-table">
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
              {sale.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Subtotal
                </TableCell>
                <TableCell className="text-right">${sale.totalPrice.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Tax (0%)
                </TableCell>
                <TableCell className="text-right">$0.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold text-lg">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold text-lg">${sale.totalPrice.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>{companyName} - Inventory Management System</p>
        </div>
      </div>
    </div>
  )
}

