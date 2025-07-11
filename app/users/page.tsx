import { Navbar } from "@/components/navbar"
import { UsersContentComponent } from "@/components/users-content"

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <UsersContentComponent />
    </div>
  )
}
