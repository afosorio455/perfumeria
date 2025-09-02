import { Navbar } from "@/components/navbar"
import { DashboardContent } from "@/components/dashboard-content"
import { AuthGuard } from "@/components/auth-guard"

export default function Dashboard() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <DashboardContent />
      </div>
    </AuthGuard>
  )
}
