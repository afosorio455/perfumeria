import { Navbar } from "@/components/navbar"
import { InventoryContent } from "@/components/inventory-content"

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <InventoryContent />
    </div>
  )
}
