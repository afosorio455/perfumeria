import { Navbar } from "@/components/navbar"
import { FlasksContent } from "@/components/flasks-content"

export default function FlasksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FlasksContent />
    </div>
  )
}
