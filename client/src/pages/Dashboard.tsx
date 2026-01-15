import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = trpc.auth.getProfile.useQuery();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const userType = profile?.userType || "customer";

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo, {user?.name}!</p>
        <p className="text-sm text-muted-foreground mt-2">Tipo de usuário: {userType}</p>
      </div>
    </DashboardLayout>
  );
}
