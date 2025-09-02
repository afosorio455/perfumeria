import { UsersContent } from "@/components/users-content"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"

export default function UsersPage() {
  return (
    <AuthGuard requiredRole="administrador">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UsersContent />
        </main>
      </div>
    </AuthGuard>
  )
}
