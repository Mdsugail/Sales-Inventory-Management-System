"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: number
  username: string
  role: "admin" | "sales"
}

type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)

    // Initialize default users if they don't exist
    if (!localStorage.getItem("users")) {
      const defaultUsers = [
        { id: 1, username: "admin", password: "admin123", role: "admin" },
        { id: 2, username: "sales", password: "sales123", role: "sales" },
      ]
      localStorage.setItem("users", JSON.stringify(defaultUsers))
    }

    // Initialize products and sales if they don't exist
    if (!localStorage.getItem("products")) {
      const defaultProducts = [
        {
          id: 1,
          name: "Laptop Pro",
          category: "Electronics",
          price: 1299.99,
          stock: 15,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 2,
          name: "Wireless Headphones",
          category: "Audio",
          price: 149.99,
          stock: 25,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 3,
          name: "Smartphone X",
          category: "Electronics",
          price: 899.99,
          stock: 10,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 4,
          name: "Coffee Maker",
          category: "Kitchen",
          price: 79.99,
          stock: 8,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 5,
          name: "Fitness Tracker",
          category: "Wearables",
          price: 129.99,
          stock: 20,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 6,
          name: "Bluetooth Speaker",
          category: "Audio",
          price: 89.99,
          stock: 12,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 7,
          name: "Desk Chair",
          category: "Furniture",
          price: 199.99,
          stock: 5,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 8,
          name: "LED Monitor",
          category: "Electronics",
          price: 249.99,
          stock: 7,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 9,
          name: "Wireless Mouse",
          category: "Accessories",
          price: 39.99,
          stock: 30,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 10,
          name: "External Hard Drive",
          category: "Storage",
          price: 119.99,
          stock: 18,
          image: "/placeholder.svg?height=200&width=200",
        },
      ]
      localStorage.setItem("products", JSON.stringify(defaultProducts))
    }

    if (!localStorage.getItem("sales")) {
      localStorage.setItem("sales", JSON.stringify([]))
    }
  }, [])

  const login = (username: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.username === username && u.password === password)

    if (user) {
      const { password, ...userWithoutPassword } = user
      setUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

