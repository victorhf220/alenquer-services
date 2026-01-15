import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  Zap,
  Users,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<number | null>(null);

  const { data: categories } = trpc.data.categories.useQuery();
  const { data: neighborhoods } = trpc.data.neighborhoods.useQuery();
  const { data: providers } = trpc.providers.list.useQuery({
    categoryId: selectedCategory || undefined,
    neighborhoodId: selectedNeighborhood || undefined,
  });
  const { data: featuredProviders } = trpc.providers.featured.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Alenquer Serviços</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Olá, {user?.name}
                </span>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                >
                  Sair
                </Button>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Entrar</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Encontre Profissionais Locais em Alenquer
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Conecte-se com eletricistas, encanadores, pedreiros e muito mais. Rápido, fácil e confiável.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar serviço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button size="lg" className="h-12">
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories Filter */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Categoria</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedCategory === cat.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Neighborhoods Filter */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Bairro</h3>
              <div className="grid grid-cols-2 gap-2">
                {neighborhoods?.map((neighborhood) => (
                  <button
                    key={neighborhood.id}
                    onClick={() =>
                      setSelectedNeighborhood(
                        selectedNeighborhood === neighborhood.id ? null : neighborhood.id
                      )
                    }
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium flex items-center gap-2 ${
                      selectedNeighborhood === neighborhood.id
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-border bg-card text-foreground hover:border-secondary/50"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {neighborhood.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      {featuredProviders && featuredProviders.length > 0 && (
        <section className="py-12 md:py-16 bg-card border-b border-border">
          <div className="container">
            <div className="flex items-center gap-2 mb-8">
              <Star className="w-6 h-6 text-accent fill-accent" />
              <h3 className="text-2xl font-bold text-foreground">Profissionais Destaque</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProviders.map((provider) => (
                <Link key={provider.id} href={`/provider/${provider.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-foreground">{provider.name}</h4>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                      <Star className="w-5 h-5 text-accent fill-accent flex-shrink-0" />
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Bairro</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="w-4 h-4" />
                        <span>Serviço</span>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${provider.phone.replace(/\D/g, "")}?text=Olá, encontrei seu perfil no Alenquer Serviços`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full"
                    >
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chamar no WhatsApp
                      </Button>
                    </a>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Providers List */}
      <section className="py-12 md:py-16">
        <div className="container">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            {selectedCategory || selectedNeighborhood
              ? "Profissionais Encontrados"
              : "Todos os Profissionais"}
          </h3>

          {providers && providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Link key={provider.id} href={`/provider/${provider.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-foreground">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {provider.description || "Profissional qualificado"}
                      </p>
                    </div>

                    <div className="space-y-2 mb-6 flex-1">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <MapPin className="w-4 h-4 text-secondary" />
                        <span>Bairro</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Zap className="w-4 h-4 text-primary" />
                        <span>Serviço</span>
                      </div>
                      {provider.isActive ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Ativo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Indisponível</span>
                        </div>
                      )}
                    </div>

                    <a
                      href={`https://wa.me/${provider.phone.replace(/\D/g, "")}?text=Olá, encontrei seu perfil no Alenquer Serviços`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full"
                    >
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chamar no WhatsApp
                      </Button>
                    </a>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                Nenhum profissional encontrado com esses critérios.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedNeighborhood(null);
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container text-center">
          <h3 className="text-3xl font-bold mb-4">Você é um Profissional?</h3>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e comece a receber clientes de Alenquer
          </p>
          {isAuthenticated ? (
            <Link href="/provider-signup">
              <Button size="lg" variant="secondary">
                Cadastrar como Prestador
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 md:py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">Alenquer Serviços</h4>
              <p className="text-sm text-muted-foreground">
                Conectando profissionais e clientes em Alenquer - Pará
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Sobre</a></li>
                <li><a href="#" className="hover:text-primary">Contato</a></li>
                <li><a href="#" className="hover:text-primary">Termos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Contato</h4>
              <p className="text-sm text-muted-foreground">
                Email: contato@alenquerservicos.com
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Alenquer Serviços. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
