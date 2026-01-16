import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Phone, Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProviderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const providerId = parseInt(id || "0");
  const { data: provider, isLoading } = trpc.providers.getById.useQuery(providerId);
  const { data: reviews = [] } = trpc.reviews.getByProvider.useQuery(
    { providerId },
    { enabled: !!provider }
  );
  const { data: avgRating = 0 } = trpc.reviews.getAverageRating.useQuery(
    { providerId },
    { enabled: !!provider }
  );

  const logContactMutation = trpc.contacts.logContact.useMutation({
    onSuccess: () => {
      if (provider?.phone) {
        const message = encodeURIComponent("Olá! Encontrei seu perfil no Alenquer Serviços");
        window.open(
          `https://wa.me/55${provider.phone.replace(/\D/g, "")}?text=${message}`,
          "_blank"
        );
      }
    },
  });

  const createReviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso!");
      setRating(0);
      setComment("");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar avaliação");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Prestador não encontrado</h1>
        <Button onClick={() => setLocation("/")}>Voltar para Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4">
            ← Voltar
          </Button>
        </div>

        {/* Provider Card */}
        <Card className="p-6 md:p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{provider.name}</h1>
              <p className="text-lg text-muted-foreground">Categoria {provider.categoryId}</p>
            </div>
            <Badge variant={provider.isActive ? "default" : "secondary"}>
              {provider.isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Bairro</p>
                <p className="text-foreground font-medium">Bairro {provider.neighborhoodId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Telefone/WhatsApp</p>
                <p className="text-foreground font-medium">{provider.phone}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {provider.description && (
            <div className="mb-8 p-4 bg-muted rounded-lg">
              <p className="text-foreground">{provider.description}</p>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(avgRating)
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">
              {avgRating.toFixed(1)} ({reviews.length} avaliações)
            </span>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => logContactMutation.mutate({ providerId })}
            disabled={logContactMutation.isPending}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
          >
            {logContactMutation.isPending ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Phone className="w-5 h-5 mr-2" />
            )}
            Chamar no WhatsApp
          </Button>
        </Card>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Avaliações</h2>

              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Este prestador ainda não tem avaliações
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {review.rating}/5
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-foreground italic">"{review.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Review Form */}
          <Card className="p-6 h-fit">
            <h3 className="text-lg font-bold text-foreground mb-4">Deixar Avaliação</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Sua Avaliação</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 cursor-pointer transition-colors ${
                          star <= rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Comentário (opcional)</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Compartilhe sua experiência..."
                  className="w-full p-2 border rounded-lg bg-background text-foreground text-sm"
                  rows={4}
                />
              </div>

              <Button
                onClick={() => {
                  if (rating === 0) {
                    toast.error("Selecione uma avaliação");
                    return;
                  }
                  createReviewMutation.mutate({
                    providerId,
                    rating,
                    comment: comment || undefined,
                  });
                }}
                disabled={createReviewMutation.isPending || rating === 0}
                className="w-full"
              >
                {createReviewMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Enviar Avaliação
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
