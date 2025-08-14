import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Upload, Calculator, HelpCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface Category {
  id: string;
  nome: string;
  slug: string;
  icone_url: string;
  descricao: string;
}

interface FormData {
  title: string;
  description: string;
  category_id: string | null;
  prize_value: string;
  total_tickets: string;
  ticket_price: string;
  draw_date: string;
  image: File | null;
}

export default function LanceSeuGanhavel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category_id: null,
    prize_value: "",
    total_tickets: "",
    ticket_price: "",
    draw_date: "",
    image: null,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('ganhavel_categories')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    handleInputChange('image', file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('raffle-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('raffle-images')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Categoria é obrigatória";
    }

    if (!formData.prize_value || parseFloat(formData.prize_value) <= 0) {
      newErrors.prize_value = "Valor do prêmio deve ser maior que zero";
    }

    if (!formData.total_tickets || parseInt(formData.total_tickets) <= 0) {
      newErrors.total_tickets = "Número total de tickets deve ser maior que zero";
    }

    if (!formData.ticket_price || parseFloat(formData.ticket_price) <= 0) {
      newErrors.ticket_price = "Preço do ticket deve ser maior que zero";
    }

    if (!formData.draw_date) {
      newErrors.draw_date = "Data do sorteio é obrigatória";
    } else {
      const drawDate = new Date(formData.draw_date);
      const now = new Date();
      if (drawDate <= now) {
        newErrors.draw_date = "Data do sorteio deve ser no futuro";
      }
    }

    if (!formData.image) {
      newErrors.image = "Imagem é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCommission = () => {
    const prizeValue = parseFloat(formData.prize_value) || 0;
    const commissionRate = 0.05; // 5%
    return prizeValue * commissionRate;
  };

  const calculateTotalRevenue = () => {
    const totalTickets = parseInt(formData.total_tickets) || 0;
    const ticketPrice = parseFloat(formData.ticket_price) || 0;
    return totalTickets * ticketPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um ganhavel",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Erro",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image first
      let imageUrl = "";
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      // Create raffle using direct insert
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .insert({
          title: formData.title,
          description: formData.description,
          category_id: parseInt(formData.category_id || '0'),
          image_url: imageUrl,
          prize_value: parseFloat(formData.prize_value),
          total_tickets: parseInt(formData.total_tickets),
          ticket_price: parseFloat(formData.ticket_price),
          draw_date: new Date(formData.draw_date).toISOString(),
          status: 'draft'
        })
        .select()
        .single();

      if (raffleError) throw raffleError;

      toast({
        title: "Sucesso!",
        description: "Seu ganhavel foi criado e está aguardando aprovação",
      });

      // Navigate to user's raffles or dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error creating raffle:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar ganhavel. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const commission = calculateCommission();
  const totalRevenue = calculateTotalRevenue();
  const netProfit = totalRevenue - commission;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Criar Novo Ganhavel</h1>
            <p className="text-muted-foreground">
              Preencha as informações abaixo para criar seu ganhavel
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                    <CardDescription>
                      Dados principais do seu ganhavel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Ex: iPhone 15 Pro Max 256GB"
                        className={errors.title ? "border-red-500" : ""}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Descreva detalhadamente o prêmio..."
                        rows={4}
                        className={errors.description ? "border-red-500" : ""}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={formData.category_id?.toString() || ""}
                        onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                      >
                        <SelectTrigger className={errors.category_id ? "border-red-500" : ""}>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span>{category.icone_url}</span>
                                <span>{category.nome}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category_id && (
                        <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configuração do Ganhavel</CardTitle>
                    <CardDescription>
                      Defina os valores e quantidade de tickets
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prize_value">Valor do Prêmio (R$) *</Label>
                        <Input
                          id="prize_value"
                          type="number"
                          step="0.01"
                          value={formData.prize_value}
                          onChange={(e) => handleInputChange('prize_value', e.target.value)}
                          placeholder="0,00"
                          className={errors.prize_value ? "border-red-500" : ""}
                        />
                        {errors.prize_value && (
                          <p className="text-sm text-red-500 mt-1">{errors.prize_value}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="total_tickets">Total de Tickets *</Label>
                        <Input
                          id="total_tickets"
                          type="number"
                          value={formData.total_tickets}
                          onChange={(e) => handleInputChange('total_tickets', e.target.value)}
                          placeholder="100"
                          className={errors.total_tickets ? "border-red-500" : ""}
                        />
                        {errors.total_tickets && (
                          <p className="text-sm text-red-500 mt-1">{errors.total_tickets}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ticket_price">Preço por Ticket (R$) *</Label>
                        <Input
                          id="ticket_price"
                          type="number"
                          step="0.01"
                          value={formData.ticket_price}
                          onChange={(e) => handleInputChange('ticket_price', e.target.value)}
                          placeholder="0,00"
                          className={errors.ticket_price ? "border-red-500" : ""}
                        />
                        {errors.ticket_price && (
                          <p className="text-sm text-red-500 mt-1">{errors.ticket_price}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="draw_date">Data do Sorteio *</Label>
                        <Input
                          id="draw_date"
                          type="datetime-local"
                          value={formData.draw_date}
                          onChange={(e) => handleInputChange('draw_date', e.target.value)}
                          className={errors.draw_date ? "border-red-500" : ""}
                        />
                        {errors.draw_date && (
                          <p className="text-sm text-red-500 mt-1">{errors.draw_date}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Imagem do Prêmio</CardTitle>
                    <CardDescription>
                      Adicione uma imagem atrativa do prêmio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="image">Imagem *</Label>
                      <div className="mt-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className={errors.image ? "border-red-500" : ""}
                        />
                        {formData.image && (
                          <div className="mt-2 p-2 bg-muted rounded">
                            <p className="text-sm">{formData.image.name}</p>
                          </div>
                        )}
                        {errors.image && (
                          <p className="text-sm text-red-500 mt-1">{errors.image}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="flex-1"
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isUploading ? 'Enviando imagem...' : 'Criando...'}
                      </>
                    ) : (
                      'Criar Ganhavel'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Calculadora
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Receita Total:</span>
                      <span className="font-medium">R$ {totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Comissão (5%):</span>
                      <span className="font-medium text-red-500">-R$ {commission.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Lucro Líquido:</span>
                        <span className="font-bold text-green-500">R$ {netProfit.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Como Funciona
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-start">
                      1. Criar Ganhavel
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Preencha todas as informações e envie para análise
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-start">
                      2. Aprovação
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Nossa equipe irá revisar e aprovar seu ganhavel
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-start">
                      3. Venda de Tickets
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Usuários podem comprar tickets para participar
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-start">
                      4. Sorteio
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      O sorteio acontece na data programada
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Importante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Todos os ganhaveis passam por análise</li>
                    <li>• Não é permitido alterar valores após aprovação</li>
                    <li>• Você deve entregar o prêmio ao vencedor</li>
                    <li>• Taxa de 5% sobre o valor arrecadado</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}