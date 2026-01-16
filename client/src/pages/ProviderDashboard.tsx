import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Eye, Phone, MapPin, Star, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ProviderDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile } = trpc.auth.getProfile.useQuery();
  const { data: provider, isLoading } = trpc.myProvider.get.useQuery();
  const { data: contacts = [] } = trpc.contacts.getProviderContacts.useQuery(
    { providerId: provider?.id || 0 },
    { enabled: !!provider }
  );
  const { data: reviews = [] } = trpc.reviews.getByProvider.useQuery(
    { providerId: provider?.id || 0 },
    { enabled: !!provider }
  );
  const { data: avgRating = 0 } = trpc.reviews.getAverageRating.useQuery(
    { providerId: provider?.id || 0 },
    { enabled: !!provider }
  );

  const toggleStatusMutation = trpc.myProvider.toggleStatus.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (profile?.userType !== "provider") {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Seu Perfil</h1>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Você ainda não tem um perfil de prestador</p>
            <Button onClick={() => setLocation("/provider-signup")}>Criar Perfil</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{provider.name}</h1>
            <p className="text-muted-foreground">Seu perfil de prestador de serviços</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation(`/provider/${provider.id}`)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Perfil Público
            </Button>
            <Button onClick={() => setLocation("/provider-signup")}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="text-2xl font-bold text-foreground">
                  {provider.isActive ? "Ativo" : "Inativo"}
                </p>
              </div>
              <Badge variant={provider.isActive ? "default" : "secondary"}>
                {provider.isActive ? "🟢" : "🔴"}
              </Badge>
            </div>
            <Button
              onClick={() => toggleStatusMutation.mutate()}
              disabled={toggleStatusMutation.isPending}
              variant="outline"
              className="w-full mt-4"
            >
              {toggleStatusMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {provider.isActive ? "Desativar" : "Ativar"}
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Contatos Recebidos</p>
                <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
              </div>
              <Phone className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avaliação Média</p>
                <p className="text-2xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações do Perfil */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Informações do Perfil</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="text-foreground font-medium">{provider.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone/WhatsApp</p>
                <p className="text-foreground font-medium">{provider.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bairro</p>
                <p className="text-foreground font-medium">Bairro {provider.neighborhoodId}</p>
              </div>
              {provider.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="text-foreground">{provider.description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Avaliações Recentes */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Avaliações ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Você ainda não tem avaliações
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{review.rating}/5</span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-foreground italic">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
