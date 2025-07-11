import { Navbar } from "@/components/navbar"
import { AlcoholConsumptionForm } from "@/components/alcohol-consumption-form"

export default function AlcoholConsumptionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AlcoholConsumptionForm />
    </div>
  )
}
