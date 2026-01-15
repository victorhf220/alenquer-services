import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, Phone, MessageCircle, ArrowLeft, Star, CheckCircle } from "lucide-react";

export default function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const providerId = parseInt(id || "0");

  const { data: provider, isLoading, error } = trpc.providers.getById.useQuery(providerId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Link href="/">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Profissional não encontrado</h1>
            <p className="text-muted-foreground">Desculpe, não conseguimos encontrar este profissional.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Link href="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">{provider.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {provider.isFeatured ? (
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="w-5 h-5 fill-accent" />
                          <span className="font-semibold">Profissional Destaque</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {provider.isActive ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Ativo</span>
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-muted text-muted-foreground rounded-lg">
                      <span className="font-semibold">Indisponível</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {provider.description && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Sobre</h2>
                  <p className="text-foreground leading-relaxed">{provider.description}</p>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Categoria</h3>
                  <p className="text-lg font-semibold text-foreground">Categoria</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Bairro</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <p className="text-lg font-semibold text-foreground">Bairro</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
                <h2 className="text-lg font-semibold text-foreground mb-4">Informações de Contato</h2>
                <div className="flex items-center gap-3 text-foreground">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="font-mono">{provider.phone}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 sticky top-24">
              <div className="space-y-4">
                <a
                  href={`https://wa.me/${provider.phone.replace(/\D/g, "")}?text=Olá, encontrei seu perfil no Alenquer Serviços e gostaria de contratar seus serviços.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full h-14 bg-green-500 hover:bg-green-600 text-white text-base font-semibold">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chamar no WhatsApp
                  </Button>
                </a>

                <Button variant="outline" className="w-full h-12">
                  <Phone className="w-4 h-4 mr-2" />
                  Copiar Telefone
                </Button>

                {/* Quick Info */}
                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-4">Informações</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Membro desde</p>
                      <p className="text-foreground font-medium">
                        {new Date(provider.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="text-foreground font-medium capitalize">
                        {provider.status === "approved" ? "Aprovado" : "Pendente"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
