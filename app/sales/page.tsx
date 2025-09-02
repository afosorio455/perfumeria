import { SalesContent } from "@/components/sales-content"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"

export default function SalesPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <SalesContent />
      </div>
    </AuthGuard>
  )
}
