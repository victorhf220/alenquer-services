import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function AdminApprovals() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile } = trpc.auth.getProfile.useQuery();
  const { data: pending, isLoading, refetch } = trpc.admin.pendingApprovals.useQuery();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (profile?.userType !== "admin") {
    setLocation("/");
    return null;
  }

  const approveMutation = trpc.admin.approveProvider.useMutation({
    onSuccess: () => {
      toast.success("Prestador aprovado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao aprovar prestador");
    },
  });

  const rejectMutation = trpc.admin.rejectProvider.useMutation({
    onSuccess: () => {
      toast.success("Prestador rejeitado");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao rejeitar prestador");
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Aprovações de Prestadores</h1>
        <p className="text-muted-foreground mb-8">
          {pending?.length || 0} prestador(es) aguardando aprovação
        </p>

        {!pending || pending.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum prestador aguardando aprovação</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pending.map((provider) => (
              <Card key={provider.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">Categoria {provider.categoryId}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                    Pendente
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Bairro {provider.neighborhoodId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{provider.phone}</span>
                  </div>
                </div>

                {provider.description && (
                  <p className="text-sm text-foreground mb-6 p-3 bg-muted rounded">
                    {provider.description}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => approveMutation.mutate(provider.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate({ providerId: provider.id, reason: "Rejeitado pelo administrador" })}
                    disabled={rejectMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Rejeitar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
