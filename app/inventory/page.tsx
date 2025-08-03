import { InventoryContent } from "@/components/inventory-content"
import { Navbar } from "@/components/navbar"


export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <InventoryContent />
    </div>
  )
}
