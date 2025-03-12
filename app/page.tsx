import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sales & Inventory Management</h1>
          <p className="mt-2 text-gray-600">Manage your inventory and track sales without a database</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

