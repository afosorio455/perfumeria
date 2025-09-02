import { InventoryContent } from "@/components/inventory-content"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"

export default function InventoryPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <InventoryContent />
      </div>
    </AuthGuard>
  )
}
