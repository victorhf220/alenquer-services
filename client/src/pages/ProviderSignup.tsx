import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProviderSignup() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    categoryId: "",
    neighborhoodId: "",
    description: "",
  });

  const { data: categories } = trpc.data.categories.useQuery();
  const { data: neighborhoods } = trpc.data.neighborhoods.useQuery();
  const { mutate: createProvider, isPending } = trpc.myProvider.create.useMutation({
    onSuccess: () => {
      toast.success("Perfil criado com sucesso! Aguarde aprovação do administrador.");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar perfil");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-foreground mb-4">Você precisa estar autenticado para se cadastrar como prestador.</p>
          <Button onClick={() => setLocation("/")} className="w-full">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.categoryId || !formData.neighborhoodId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createProvider({
      name: formData.name,
      phone: formData.phone,
      categoryId: parseInt(formData.categoryId),
      neighborhoodId: parseInt(formData.neighborhoodId),
      description: formData.description,
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-2xl">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Cadastre-se como Prestador</h1>
          <p className="text-muted-foreground mb-8">
            Preencha seus dados para começar a receber clientes em Alenquer
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nome Completo *
              </label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                WhatsApp *
              </label>
              <Input
                type="tel"
                placeholder="(93) 98888-8888"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Use este número para receber contatos de clientes
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Categoria de Serviço *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione uma categoria</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Neighborhood */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Bairro *
              </label>
              <select
                value={formData.neighborhoodId}
                onChange={(e) => setFormData({ ...formData, neighborhoodId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione um bairro</option>
                {neighborhoods?.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Descrição (opcional)
              </label>
              <textarea
                placeholder="Descreva seus serviços, experiência e especialidades"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground mb-1">Próximos passos</p>
                  <p className="text-muted-foreground">
                    Seu perfil será revisado pelo administrador. Você receberá uma notificação quando for aprovado.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-12"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar como Prestador"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
