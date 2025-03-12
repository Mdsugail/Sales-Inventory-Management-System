"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash2 } from "lucide-react"

type User = {
  id: number
  username: string
  password?: string
  role: "admin" | "sales"
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  // Load users from local storage
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    // Remove passwords for display
    const usersWithoutPasswords = storedUsers.map((user: User) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })
    setUsers(usersWithoutPasswords)
  }, [])

  const handleAddUser = (newUser: Omit<User, "id">) => {
    // Get all users with passwords
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if username already exists
    if (allUsers.some((u: User) => u.username === newUser.username)) {
      toast({
        title: "Username already exists",
        description: "Please choose a different username.",
        variant: "destructive",
      })
      return
    }

    // Create new user with ID
    const userWithId = {
      ...newUser,
      id: Date.now(),
    }

    // Add to local storage
    const updatedUsers = [...allUsers, userWithId]
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Update state (without password)
    const { password, ...userWithoutPassword } = userWithId
    setUsers([...users, userWithoutPassword])

    toast({
      title: "User added",
      description: `${newUser.username} has been added as ${newUser.role}.`,
    })
  }

  const handleUpdateUser = (updatedUser: User) => {
    // Get all users with passwords
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if username already exists for other users
    if (allUsers.some((u: User) => u.username === updatedUser.username && u.id !== updatedUser.id)) {
      toast({
        title: "Username already exists",
        description: "Please choose a different username.",
        variant: "destructive",
      })
      return
    }

    // Update user in local storage
    const updatedUsers = allUsers.map((u: User) => {
      if (u.id === updatedUser.id) {
        // If password is not provided, keep the existing one
        if (!updatedUser.password) {
          return { ...updatedUser, password: u.password }
        }
        return updatedUser
      }
      return u
    })

    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Update state (without passwords)
    const usersWithoutPasswords = updatedUsers.map((u: User) => {
      const { password, ...userWithoutPassword } = u
      return userWithoutPassword
    })

    setUsers(usersWithoutPasswords)

    toast({
      title: "User updated",
      description: `${updatedUser.username} has been updated.`,
    })
  }

  const handleDeleteUser = (id: number) => {
    // Prevent deleting the current user
    if (user?.id === id) {
      toast({
        title: "Cannot delete current user",
        description: "You cannot delete your own account while logged in.",
        variant: "destructive",
      })
      return
    }

    // Get user to delete
    const userToDelete = users.find((u) => u.id === id)

    // Get all users
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")

    // Remove user
    const updatedUsers = allUsers.filter((u: User) => u.id !== id)

    // Ensure there's at least one admin
    if (!updatedUsers.some((u: User) => u.role === "admin")) {
      toast({
        title: "Cannot delete last admin",
        description: "You must have at least one admin user.",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Update state
    setUsers(users.filter((u) => u.id !== id))

    toast({
      title: "User deleted",
      description: `${userToDelete?.username} has been removed.`,
    })
  }

  if (user?.role !== "admin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500">Manage system users</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <UserForm onSubmit={handleAddUser} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <UserForm user={user} onSubmit={handleUpdateUser} />
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

type UserFormProps = {
  user?: User
  onSubmit: (user: any) => void
}

function UserForm({ user, onSubmit }: UserFormProps) {
  const [username, setUsername] = useState(user?.username || "")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "sales">(user?.role || "sales")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const userData = {
      id: user?.id,
      username,
      role,
    }

    // Only include password if it's provided (for updates) or if it's a new user
    if (password || !user) {
      Object.assign(userData, { password })
    }

    onSubmit(userData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogDescription>
          {user ? "Update the user details below." : "Fill in the details to add a new user to the system."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Username
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="col-span-3"
            placeholder={user ? "Leave blank to keep current password" : ""}
            required={!user}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">
            Role
          </Label>
          <Select value={role} onValueChange={(value: "admin" | "sales") => setRole(value)}>
            <SelectTrigger id="role" className="col-span-3">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">{user ? "Update User" : "Add User"}</Button>
      </DialogFooter>
    </form>
  )
}

