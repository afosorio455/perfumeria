import { Navbar } from "@/components/navbar"
import { NewAlcoholForm } from "@/components/new-alcohol-form"

export default function NewAlcoholPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NewAlcoholForm />
    </div>
  )
}
