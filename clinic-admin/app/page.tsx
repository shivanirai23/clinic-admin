import { AuthGuard } from "@/lib/auth/AuthGuard";
import { DashboardPage } from "@/views/dashboard/dashboardPage";

export default function Home() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
}
