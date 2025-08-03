import { Navbar } from "@/components/navbar"
import { NewFlaskForm } from "@/components/new-flask-form"


export default function NewFlaskPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NewFlaskForm />
    </div>
  )
}
