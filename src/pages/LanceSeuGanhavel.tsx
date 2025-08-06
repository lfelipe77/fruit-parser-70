import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Upload, DollarSign, Users, Shield, Clock, MapPin, Globe, AlertTriangle, Package, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { brazilStates } from "@/data/locations";
import CountryRegionSelector from "@/components/CountryRegionSelector";
import { supabase } from "@/integrations/supabase/client";

const categoriesData = {
  "eletronicos": {
    name: "Eletrônicos",
    subcategories: ["Celulares", "Tablets", "TVs", "Notebooks", "Acessórios", "Outros"]
  },
  "celulares-smartwatches": {
    name: "Celulares & Smartwatches",
    subcategories: ["iPhone", "Samsung Galaxy", "Apple Watch", "Smartwatches Android", "Acessórios", "Outros"]
  },
  "games-consoles": {
    name: "Games & Consoles",
    subcategories: ["PlayStation", "Xbox", "Nintendo", "Jogos", "Acessórios", "Outros"]
  },
  "eletrodomesticos": {
    name: "Eletrodomésticos",
    subcategories: ["Cozinha", "Limpeza", "Climatização", "Pequenos Eletrodomésticos", "Outros"]
  },
  "gift-cards": {
    name: "Gift Cards",
    subcategories: ["Gift Cards Lojas", "Cartões Pré-pagos", "Investimentos", "Outros"]
  },
  "carros-motos": {
    name: "Carros & Motos",
    subcategories: ["Carros Populares", "Carros Premium", "Motos", "Elétricos", "Outros"]
  },
  "produtos-virais": {
    name: "Produtos Virais",
    subcategories: ["Tech Viral", "Casa & Decoração", "Fitness", "Beleza", "Outros"]
  },
  "diversos": {
    name: "Diversos",
    subcategories: ["Imóveis", "Experiências", "Cursos", "Serviços", "Outros"]
  }
};

export default function LanceSuaRifa() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    prizeValue: "",
    ticketPrice: "",
    countryRegion: "",
    state: "",
    city: "",
    affiliateLink: "",
    images: [] as File[]
  });

  // Função para obter moeda baseada no país/região
  const getCurrency = () => {
    switch (formData.countryRegion) {
      case 'brasil':
        return 'R$';
      case 'usa':
        return '$';
      case 'uk':
        return '£';
      case 'europe':
        return '€';
      default:
        return 'R$'; // Default para Brasil
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função para detectar país/região baseado no link
  const detectCountryFromLink = (url: string) => {
    if (!url) return null;
    
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      if (domain.includes('.com.br') || domain.includes('mercadolivre.com.br') || domain.includes('amazon.com.br')) {
        return 'brasil';
      } else if (domain.includes('.co.uk') || domain.includes('amazon.co.uk')) {
        return 'uk';
      } else if (domain.includes('amazon.com') || domain.includes('.com')) {
        return 'usa';
      } else if (domain.includes('.eu') || domain.includes('amazon.de') || domain.includes('amazon.fr')) {
        return 'europe';
      }
      
      return 'online';
    } catch {
      return null;
    }
  };

  const handleAffiliateLinkChange = (value: string) => {
    setFormData(prev => ({ ...prev, affiliateLink: value }));
    
    // Auto-detectar país/região baseado no link
    const detectedCountry = detectCountryFromLink(value);
    if (detectedCountry && !formData.countryRegion) {
      setFormData(prev => ({ ...prev, countryRegion: detectedCountry }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // File validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const maxFiles = 1; // Limit to 1 file
    
    // Check if trying to upload more than 1 file
    if (files.length > maxFiles) {
      toast({
        title: "Limite de arquivos excedido",
        description: `Você pode enviar no máximo ${maxFiles} arquivo.`,
        variant: "destructive"
      });
      e.target.value = ''; // Clear the input
      return;
    }
    
    // Check if already has files and trying to add more
    if (formData.images.length > 0) {
      toast({
        title: "Limite de arquivos excedido",
        description: "Você já enviou um arquivo. Remova o arquivo atual para enviar outro.",
        variant: "destructive"
      });
      e.target.value = ''; // Clear the input
      return;
    }
    
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não permitido",
          description: `O arquivo "${file.name}" não é um tipo de imagem válido. Use apenas JPG, JPEG, PNG, WEBP ou GIF.`,
          variant: "destructive"
        });
        continue;
      }
      
      // Check file size
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo "${file.name}" excede o limite de 5MB.`,
          variant: "destructive"
        });
        continue;
      }
      
      // Sanitize filename
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      
      // Create new file with sanitized name
      const sanitizedFile = new File([file], sanitizedName, {
        type: file.type,
        lastModified: file.lastModified,
      });
      
      validFiles.push(sanitizedFile);
    }
    
    if (validFiles.length > 0) {
      setFormData(prev => ({ ...prev, images: validFiles }));
      
      // Log audit event for image upload
      try {
        const { error: auditError } = await (supabase as any).rpc('log_audit_event', {
          action: 'uploaded_raffle_image',
          context: {
            page: 'LanceSeuGanhavel',
            filename: validFiles[0].name
          }
        });

        if (auditError) {
          console.error('Error logging audit event:', auditError);
        }
      } catch (error) {
        console.error('Error logging image upload audit:', error);
      }
      
      toast({
        title: "Arquivo enviado com sucesso",
        description: `${validFiles.length} arquivo válido foi carregado.`,
      });
    }
    
    // Clear the input regardless
    e.target.value = '';
  };

  const calculateCommission = () => {
    const prizeValue = parseFloat(formData.prizeValue) || 0;
    const processingFee = prizeValue * 0.02; // 2% taxa de processamento
    return { prizeValue, processingFee, totalAmount: prizeValue + processingFee };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios para continuar.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Log audit event for raffle creation
      const { error: auditError } = await (supabase as any).rpc('log_audit_event', {
        action: 'launched_new_raffle',
        context: {
          raffle_name: formData.title,
          page: 'LanceSeuGanhavel'
        }
      });

      if (auditError) {
        console.error('Error logging audit event:', auditError);
      }

      // Notificação de sucesso com evento registrado
      toast({
        title: "🎉 Sua rifa foi lançada com sucesso!",
        description: "Evento registrado para segurança. Sua rifa será analisada em até 24 horas.",
      });
      
      console.log("Dados da rifa:", formData);
    } catch (error) {
      console.error('Error submitting raffle:', error);
      toast({
        title: "Erro ao enviar rifa",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const { prizeValue, processingFee, totalAmount } = calculateCommission();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              Lance seu Ganhavel
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Transforme seus sonhos em realidade e ajude outros a realizarem os deles
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                100% Seguro
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                +50.000 Criadores
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Análise em 24h
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>
                    Conte sobre o prêmio do seu ganhavel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Ganhavel *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: iPhone 15 Pro Max 256GB"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva detalhadamente o prêmio, suas condições, especificações..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoriesData).map(([key, category]) => (
                            <SelectItem key={key} value={key}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.category && (
                      <div className="space-y-2">
                        <Label htmlFor="subcategory">Subcategoria</Label>
                        <Select onValueChange={(value) => handleInputChange("subcategory", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma subcategoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesData[formData.category as keyof typeof categoriesData]?.subcategories.map((subcategory) => (
                              <SelectItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <CountryRegionSelector
                    value={formData.countryRegion}
                    onValueChange={(value) => handleInputChange("countryRegion", value)}
                  />

                  {/* Seletor de Estado/Região (apenas para Brasil e USA) */}
                  {(formData.countryRegion === 'brasil' || formData.countryRegion === 'usa') && (
                    <div className="space-y-2">
                      <Label>Estado/Região</Label>
                      <Select
                        value={formData.state || ""}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, state: value, city: "" }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Selecione um estado${formData.countryRegion === 'usa' ? ' (US)' : ''}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.countryRegion === 'brasil' && brazilStates.map((stateData) => (
                            <SelectItem key={stateData.state} value={stateData.state}>
                              {stateData.state}
                            </SelectItem>
                          ))}
                          {formData.countryRegion === 'usa' && [
                            'California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 
                            'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'
                          ].map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Input de Cidade */}
                  {(formData.countryRegion === 'brasil' || formData.countryRegion === 'usa') && formData.state && (
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        placeholder="Digite o nome da cidade"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                      {formData.countryRegion === 'brasil' && formData.state && (
                        <div className="text-xs text-muted-foreground">
                          <p>Cidades principais em {formData.state}:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {brazilStates.find(s => s.state === formData.state)?.cities.map((city) => (
                              <Button
                                key={city}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-xs"
                                onClick={() => setFormData(prev => ({ ...prev, city }))}
                              >
                                {city}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Campo para Link de Afiliado */}
                  {formData.countryRegion && (
                    <div className="space-y-2">
                      <Label htmlFor="affiliateLink">Link de Afiliado {formData.countryRegion === 'online' ? '*' : ''}</Label>
                      <Input
                        id="affiliateLink"
                        type="url"
                        placeholder="https://exemplo.com/produto?ref=seucodigo"
                        value={formData.affiliateLink || ""}
                        onChange={(e) => handleAffiliateLinkChange(e.target.value)}
                        required={formData.countryRegion === 'online'}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.countryRegion === 'online' 
                          ? "Cole aqui o link de afiliado do produto. Este link será usado para comprar o produto quando o sorteio acontecer."
                          : "Link opcional de afiliado. Se fornecido, será usado para rastreamento e comissões."
                        }
                      </p>
                    </div>
                  )}

                  {/* Alertas informativos baseados na seleção */}
                  {formData.countryRegion && (
                    <div className="mt-4 space-y-3">
                      {/* Alert para Produtos Online */}
                      {formData.countryRegion === 'online' && (
                        <Alert className="border-blue-200 bg-blue-50/50">
                          <Package className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm">
                            <strong>ONLINE - Produtos Afiliados:</strong> Uma vez que o valor completar e o sorteio acontecer, o site comprará o produto com o seu link de afiliado. O comprovante será enviado tanto para o ganhador quanto para você.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Alert para Produtos Regionais */}
                      {(formData.countryRegion !== 'online') && (
                        <Alert className="border-orange-200 bg-orange-50/50">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-sm">
                            <strong>Produtos Regionais:</strong> Para ganhaveis específicos de país/região, será necessário comprovar disponibilidade local. O organizador é responsável pela entrega conforme regulamentação local.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Alert especial para categorias específicas */}
                      {(formData.category === "carros-motos" || formData.category === "diversos") && (
                        <Alert className="border-amber-200 bg-amber-50/50">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-sm">
                            <strong>Produtos Especiais (Imóveis, Automóveis, etc.):</strong> Será necessário comprovarmos o recebimento pelo custo do vendedor, ou realizarmos a transferência no momento da transferência do bem. O vendedor deverá arcar com o envio até o recebimento final confirmado.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Link para Como Funciona */}
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Para maiores detalhes, consulte nossa página</span>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-sm text-primary hover:text-primary/80"
                          onClick={() => window.open('/como-funciona', '_blank')}
                        >
                          Como Funciona
                        </Button>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Configurações da Rifa */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>
                    Defina como seu ganhavel funcionará
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ticketPrice">Preço do Bilhete ({getCurrency()}) *</Label>
                      <Input
                        id="ticketPrice"
                        type="number"
                        placeholder="5.00"
                        step="0.01"
                        value={formData.ticketPrice}
                        onChange={(e) => handleInputChange("ticketPrice", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prizeValue">Valor do Prêmio ({getCurrency()}) *</Label>
                      <Input
                        id="prizeValue"
                        type="number"
                        placeholder="5000"
                        value={formData.prizeValue}
                        onChange={(e) => handleInputChange("prizeValue", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Upload de Imagens */}
              <Card>
                <CardHeader>
                  <CardTitle>Imagens do Prêmio</CardTitle>
                  <CardDescription>
                    Adicione fotos do prêmio para atrair mais participantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <div className="space-y-2">
                      <Label htmlFor="images" className="cursor-pointer">
                        <span className="text-primary hover:text-primary/80">
                          Clique para enviar imagens
                        </span>
                        <span className="text-muted-foreground"> ou arraste e solte</span>
                      </Label>
                      <Input
                        id="images"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.gif"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <p className="text-sm text-muted-foreground">
                        JPG, JPEG, PNG, WEBP, GIF até 5MB (máximo 1 imagem)
                      </p>
                    </div>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        Imagem selecionada:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.images.map((file, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {file.name}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, images: [] }))}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botão de Envio */}
              <div className="flex gap-4">
                <Button type="submit" size="lg" className="flex-1">
                  Enviar para Análise
                </Button>
                <Button type="button" variant="outline" size="lg">
                  Salvar Rascunho
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar com Resumo */}
          <div className="space-y-6">
            {/* Calculadora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Calculadora
                </CardTitle>
              </CardHeader>
               <CardContent className="space-y-4">
                {formData.prizeValue && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Valor do Prêmio:</span>
                        <span className="font-medium">R$ {prizeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Taxa de Processamento (2%):</span>
                        <span>+ R$ {processingFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total a arrecadar:</span>
                        <span className="text-primary">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          <strong>Sobre a taxa de processamento:</strong> Os 2% adicionais são destinados à instituição financeira para processar pagamentos via API SAAS e garantir a segurança das transações.
                        </p>
                      </div>
                    </div>
                  </>
                )}
                
                {!formData.prizeValue && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Preencha o valor do prêmio para ver os cálculos
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Como Funciona */}
            <Card>
              <CardHeader>
                <CardTitle>Como Funciona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm">Envie seu ganhavel</p>
                      <p className="text-xs text-muted-foreground">Nossa equipe analisa em até 24h</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-sm">Aprovação</p>
                      <p className="text-xs text-muted-foreground">Publicamos e promovemos seu ganhavel</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sorteio transparente</p>
                      <p className="text-xs text-muted-foreground">Baseado na loteria federal do país de origem</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-sm">Você recebe o prêmio completo</p>
                      <p className="text-xs text-muted-foreground">Transferência após confirmação da entrega</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suporte */}
            <Card>
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Nossa equipe está pronta para te ajudar a criar a rifa perfeita.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/central-de-ajuda">
                    Falar com Suporte
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}