"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash2, Search, Download, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  image?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin = user?.role === "admin"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    // Load products from local storage
    const storedProducts = JSON.parse(localStorage.getItem("products") || "[]")
    setProducts(storedProducts)

    // Extract unique categories
    const uniqueCategories = Array.from(new Set(storedProducts.map((p: Product) => p.category)))
    setCategories(uniqueCategories as string[])
  }, [])

  const saveProducts = (updatedProducts: Product[]) => {
    localStorage.setItem("products", JSON.stringify(updatedProducts))
    setProducts(updatedProducts)

    // Update categories
    const uniqueCategories = Array.from(new Set(updatedProducts.map((p) => p.category)))
    setCategories(uniqueCategories as string[])
  }

  const handleAddProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: Date.now(),
    }
    const updatedProducts = [...products, newProduct]
    saveProducts(updatedProducts)
    toast({
      title: "Product added",
      description: `${product.name} has been added to inventory.`,
    })
  }

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updatedProducts = products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
    saveProducts(updatedProducts)
    toast({
      title: "Product updated",
      description: `${updatedProduct.name} has been updated.`,
    })
  }

  const handleDeleteProduct = (id: number) => {
    const productToDelete = products.find((product) => product.id === id)
    const updatedProducts = products.filter((product) => product.id !== id)
    saveProducts(updatedProducts)
    toast({
      title: "Product deleted",
      description: `${productToDelete?.name} has been removed from inventory.`,
    })
  }

  const exportProducts = (format: "json" | "csv") => {
    if (format === "json") {
      const jsonString = JSON.stringify(products, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `products-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (format === "csv") {
      // Create CSV header
      let csvContent = "ID,Name,Category,Price,Stock\n"

      // Add data rows
      products.forEach((product) => {
        csvContent += `${product.id},"${product.name}","${product.category}",${product.price},${product.stock}\n`
      })

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `products-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    toast({
      title: "Export successful",
      description: `Products have been exported as ${format.toUpperCase()}.`,
    })
  }

  const handleImportProducts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string

        // Check if it's JSON or CSV
        if (file.name.endsWith(".json")) {
          // Parse JSON
          const importedProducts = JSON.parse(content)

          if (Array.isArray(importedProducts) && importedProducts.length > 0) {
            // Validate structure
            if (
              importedProducts[0].hasOwnProperty("name") &&
              importedProducts[0].hasOwnProperty("price") &&
              importedProducts[0].hasOwnProperty("stock")
            ) {
              // Ensure all products have IDs
              const productsWithIds = importedProducts.map((product) => {
                if (!product.id) {
                  return { ...product, id: Date.now() + Math.floor(Math.random() * 1000) }
                }
                return product
              })

              saveProducts(productsWithIds)

              toast({
                title: "Import successful",
                description: `${productsWithIds.length} products have been imported.`,
              })
            } else {
              throw new Error("Invalid product structure")
            }
          } else {
            throw new Error("Invalid data format")
          }
        } else if (file.name.endsWith(".csv")) {
          // Parse CSV
          const lines = content.split("\n")
          const headers = lines[0].split(",")

          // Find column indices
          const nameIndex = headers.findIndex((h) => h.toLowerCase().includes("name"))
          const categoryIndex = headers.findIndex((h) => h.toLowerCase().includes("category"))
          const priceIndex = headers.findIndex((h) => h.toLowerCase().includes("price"))
          const stockIndex = headers.findIndex((h) => h.toLowerCase().includes("stock"))

          if (nameIndex === -1 || priceIndex === -1 || stockIndex === -1) {
            throw new Error("CSV must contain name, price, and stock columns")
          }

          const importedProducts: Product[] = []

          // Parse data rows
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue

            const values = lines[i].split(",")

            // Handle quoted values
            for (let j = 0; j < values.length; j++) {
              if (values[j].startsWith('"') && !values[j].endsWith('"')) {
                const k = j + 1
                while (k < values.length && !values[k].endsWith('"')) {
                  values[j] += "," + values[k]
                  values.splice(k, 1)
                }
                if (k < values.length) {
                  values[j] += "," + values[k]
                  values.splice(k, 1)
                }
                values[j] = values[j].replace(/^"|"$/g, "")
              }
            }

            const product: Product = {
              id: Date.now() + i,
              name: values[nameIndex].replace(/^"|"$/g, ""),
              category: categoryIndex !== -1 ? values[categoryIndex].replace(/^"|"$/g, "") : "Uncategorized",
              price: Number.parseFloat(values[priceIndex]),
              stock: Number.parseInt(values[stockIndex]),
            }

            importedProducts.push(product)
          }

          if (importedProducts.length > 0) {
            saveProducts([...products, ...importedProducts])

            toast({
              title: "Import successful",
              description: `${importedProducts.length} products have been imported.`,
            })
          } else {
            throw new Error("No valid products found in CSV")
          }
        } else {
          throw new Error("Unsupported file format")
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "The file format is invalid or corrupted.",
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

  // Apply filters
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())

    // Category filter
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    // Stock filter
    let matchesStock = true
    if (stockFilter === "low") {
      matchesStock = product.stock < 5
    } else if (stockFilter === "out") {
      matchesStock = product.stock === 0
    }

    return matchesSearch && matchesCategory && matchesStock
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500">Manage your inventory</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <ProductForm onSubmit={handleAddProduct} />
              </DialogContent>
            </Dialog>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportProducts("json")}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => exportProducts("csv")}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            {isAdmin && (
              <>
                <Input
                  type="file"
                  accept=".json,.csv"
                  ref={fileInputRef}
                  onChange={handleImportProducts}
                  className="hidden"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stock Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No products found. Add some products to get started.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image ? (
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                        No img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={product.stock < 5 ? "text-orange-500 font-medium" : ""}>{product.stock}</span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <ProductForm product={product} onSubmit={handleUpdateProduct} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

type ProductFormProps = {
  product?: Product
  onSubmit: (product: any) => void
}

function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "")
  const [category, setCategory] = useState(product?.category || "")
  const [price, setPrice] = useState(product?.price?.toString() || "")
  const [stock, setStock] = useState(product?.stock?.toString() || "")
  const [image, setImage] = useState<string | undefined>(product?.image)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id: product?.id,
      name,
      category,
      price: Number.parseFloat(price),
      stock: Number.parseInt(stock),
      image,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogDescription>
          {product
            ? "Update the product details below."
            : "Fill in the details to add a new product to your inventory."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Category
          </Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">
            Price
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="stock" className="text-right">
            Stock
          </Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="image" className="text-right">
            Image
          </Label>
          <div className="col-span-3">
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            {image && (
              <div className="mt-2">
                <img
                  src={image || "/placeholder.svg"}
                  alt="Product preview"
                  className="h-20 w-20 object-cover rounded"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">{product ? "Update Product" : "Add Product"}</Button>
      </DialogFooter>
    </form>
  )
}

