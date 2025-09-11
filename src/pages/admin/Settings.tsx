import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings as SettingsIcon,
  Plus,
  Edit,
  Trash2,
  Shield,
  DollarSign,
  Globe,
  Bell,
  Users,
  Gift,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const platformSettings = {
  general: {
    siteName: "Sistema de Ganhaveis",
    siteUrl: "Ganhavel.com",
    supportEmail: "help@ganhavel.com",
    defaultLanguage: "pt-BR",
    timezone: "America/Sao_Paulo",
  },
  fees: {
    institutionalFee: 2,
    paymentProcessingFee: 2,
    maxRifaValue: 1000000,
    minRifaValue: 10,
  },
  approval: {
    autoApproveAffiliates: true,
    requireDocumentVerification: true,
    maxPendingRifas: 3,
    approvalTimeout: 48,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
  },
};

// Categories and subcategories will be fetched from database

const affiliatePartnersData = [
  { id: 1, name: "Amazon", domain: "amazon.com.br", status: "active", commission: 5 },
  { id: 2, name: "Mercado Livre", domain: "mercadolivre.com.br", status: "active", commission: 7 },
  { id: 3, name: "Casas Bahia", domain: "casasbahia.com.br", status: "active", commission: 6 },
  { id: 4, name: "Magazine Luiza", domain: "magazineluiza.com.br", status: "pending", commission: 8 },
];

export default function Settings() {
  const [settings, setSettings] = useState(platformSettings);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [affiliatePartners, setAffiliatePartners] = useState(affiliatePartnersData);
  const [newCategory, setNewCategory] = useState({ nome: "", slug: "", descricao: "", icone_url: "" });
  const [newSubcategory, setNewSubcategory] = useState({ name: "", slug: "", category_id: null });
  const [newPartner, setNewPartner] = useState({ name: "", domain: "", commission: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Edit category dialog state
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCategoryData, setEditCategoryData] = useState({ nome: "", slug: "", descricao: "", icone_url: "" });
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch categories and subcategories from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (categoriesError) throw categoriesError;

        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*, categories(nome)')
          .order('sort_order', { ascending: true });

        if (subcategoriesError) throw subcategoriesError;

        setCategories(categoriesData || []);
        setSubcategories(subcategoriesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  const handleAddCategory = async () => {
    if (!newCategory.nome.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          nome: newCategory.nome,
          slug: newCategory.slug || newCategory.nome.toLowerCase().replace(/\s+/g, '-'),
          descricao: newCategory.descricao,
          icone_url: newCategory.icone_url,
          destaque: false
        }])
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data]);
      setNewCategory({ nome: "", slug: "", descricao: "", icone_url: "" });
      toast({
        title: "Categoria adicionada",
        description: `A categoria "${data.nome}" foi criada com sucesso.`,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Erro ao adicionar categoria",
        description: "Não foi possível adicionar a categoria.",
        variant: "destructive"
      });
    }
  };

  const handleAddSubcategory = async (categoryId: number) => {
    if (!newSubcategory.name.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .insert([{
          name: newSubcategory.name,
          slug: newSubcategory.slug || newSubcategory.name.toLowerCase().replace(/\s+/g, '-'),
          category_id: categoryId
        }])
        .select('*, categories(nome)')
        .single();

      if (error) throw error;

      setSubcategories([...subcategories, data]);
      setNewSubcategory({ name: "", slug: "", category_id: null });
      toast({
        title: "Subcategoria adicionada",
        description: `A subcategoria "${data.name}" foi adicionada com sucesso.`,
      });
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast({
        title: "Erro ao adicionar subcategoria",
        description: "Não foi possível adicionar a subcategoria.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveSubcategory = async (subcategoryId: string) => {
    try {
      // Check if subcategory is used anywhere before deleting (raffles or legacy)
      const [rafflesRes, legacyRes] = await Promise.all([
        supabase.from('raffles').select('id', { count: 'exact', head: true }).eq('subcategory_id', subcategoryId),
        supabase.from('ganhaveis_legacy').select('id', { count: 'exact', head: true }).eq('subcategory_id', subcategoryId),
      ]);

      const rafflesCount = (rafflesRes as any)?.count ?? 0;
      const legacyCount = (legacyRes as any)?.count ?? 0;

      // If any query errored with something other than relation not found, surface it
      const fatal = [rafflesRes, legacyRes].find((r: any) => r && r.error && !`${r.error?.message || ''}`.includes('relation') );
      if (fatal) throw (fatal as any).error;

      const totalInUse = (rafflesCount || 0) + (legacyCount || 0);
      if (totalInUse > 0) {
        toast({
          title: 'Subcategoria em uso',
          description: `Esta subcategoria está vinculada a ${totalInUse} ganhavel(is). Reatribua ou arquive antes de remover.`,
          variant: 'destructive'
        });
        return;
      }

      // Safe to delete
      const { error: delError } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId);
      if (delError) throw delError;

      setSubcategories(subcategories.filter(sub => sub.id !== subcategoryId));
      toast({ title: 'Subcategoria removida', description: 'A subcategoria foi removida com sucesso.' });
    } catch (error: any) {
      console.error('Error removing subcategory:', error);
      let description = "Não foi possível remover a subcategoria.";
      if (error?.message?.includes('foreign key') || error?.message?.includes('violates')) {
        description = "Esta subcategoria está em uso e não pode ser removida. Reatribua os ganhaveis primeiro.";
      }
      toast({
        title: "Erro ao remover subcategoria",
        description,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      // Check if category is used by any raffles
      const { count, error: countErr } = await supabase
        .from('raffles')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);
      if (countErr) throw countErr;
      if ((count ?? 0) > 0) {
        toast({
          title: "Categoria em uso",
          description: "Existem rifas vinculadas a esta categoria. Reatribua ou arquive antes de remover.",
          variant: "destructive"
        });
        return;
      }

      // Remove related subcategories first to avoid potential constraints
      const { error: subErr } = await supabase
        .from('subcategories')
        .delete()
        .eq('category_id', id);
      if (subErr) throw subErr;

      // Use the secure admin function to delete category
      const { error: catErr } = await supabase.rpc('admin_delete_category', {
        p_id: id
      });
      if (catErr) throw catErr;

      // Update local state
      setCategories(categories.filter(cat => cat.id !== id));
      setSubcategories(subcategories.filter(sub => sub.category_id !== id));

      toast({
        title: "Categoria removida",
        description: "A categoria foi removida com sucesso.",
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      let description = error?.message || "Não foi possível remover a categoria.";
      if (description.toLowerCase().includes('foreign key')) {
        description = "Não é possível remover: existem registros dependentes vinculados a esta categoria.";
      }
      toast({
        title: "Erro ao remover categoria",
        description,
        variant: "destructive"
      });
    }
  };
  
  const handleStartEditCategory = (category: any) => {
    setEditingCategory(category);
    setEditCategoryData({
      nome: category.nome || "",
      slug: category.slug || "",
      descricao: category.descricao || "",
      icone_url: category.icone_url || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(editCategoryData)
        .eq('id', editingCategory.id)
        .select()
        .single();
      if (error) throw error;

      setCategories(categories.map(cat => cat.id === editingCategory.id ? data : cat));
      setEditingCategory(null);
      setEditDialogOpen(false);
      toast({
        title: "Categoria atualizada",
        description: `A categoria "${data?.nome}" foi atualizada com sucesso.`,
      });
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro ao atualizar categoria",
        description: error?.message || "Não foi possível atualizar a categoria.",
        variant: "destructive"
      });
    }
  };

  const handleAddPartner = () => {
    if (!newPartner.name.trim() || !newPartner.domain.trim()) return;
    
    const partner = {
      id: affiliatePartners.length + 1,
      name: newPartner.name,
      domain: newPartner.domain,
      commission: newPartner.commission,
      status: "pending" as const,
    };
    
    setAffiliatePartners([...affiliatePartners, partner]);
    setNewPartner({ name: "", domain: "", commission: 0 });
    toast({
      title: "Parceiro adicionado",
      description: `O parceiro "${partner.name}" foi adicionado para análise.`,
    });
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="outline" className="text-green-600 border-green-200">Ativo</Badge>
    ) : (
      <Badge variant="outline" className="text-orange-600 border-orange-200">Pendente</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Configure parâmetros gerais da plataforma
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="fees">Taxas</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="partners">Parceiros</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configurações básicas da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nome do Site</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteName: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL do Site</Label>
                  <Input
                    id="siteUrl"
                    value={settings.general.siteUrl}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteUrl: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de Suporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, supportEmail: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, timezone: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                      <SelectItem value="America/Rio_Branco">Acre (UTC-5)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações de Aprovação</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Aprovar automaticamente produtos afiliados</Label>
                      <p className="text-sm text-muted-foreground">
                        Rifas com links de afiliados validados são aprovadas automaticamente
                      </p>
                    </div>
                    <Switch
                      checked={settings.approval.autoApproveAffiliates}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        approval: { ...settings.approval, autoApproveAffiliates: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exigir verificação de documentos</Label>
                      <p className="text-sm text-muted-foreground">
                        Organizadores devem verificar identidade para produtos não afiliados
                      </p>
                    </div>
                    <Switch
                      checked={settings.approval.requireDocumentVerification}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        approval: { ...settings.approval, requireDocumentVerification: checked }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings}>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Settings */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configurações de Taxas
              </CardTitle>
              <CardDescription>
                Configure as taxas e limites da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="institutionalFee">Taxa Institucional (R$)</Label>
                  <Input
                    id="institutionalFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.fees.institutionalFee}
                    onChange={(e) => setSettings({
                      ...settings,
                      fees: { ...settings.fees, institutionalFee: parseFloat(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor fixo cobrado em cada compra (taxa do gateway de pagamento)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentFee">Taxa de Processamento (%)</Label>
                  <Input
                    id="paymentFee"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.fees.paymentProcessingFee}
                    onChange={(e) => setSettings({
                      ...settings,
                      fees: { ...settings.fees, paymentProcessingFee: parseFloat(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual adicionado ao valor do prêmio quando lançar a rifa
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRifaValue">Valor Máximo de Ganhável (R$)</Label>
                  <Input
                    id="maxRifaValue"
                    type="number"
                    min="0"
                    value={settings.fees.maxRifaValue}
                    onChange={(e) => setSettings({
                      ...settings,
                      fees: { ...settings.fees, maxRifaValue: parseFloat(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minRifaValue">Valor Mínimo de Ganhável (R$)</Label>
                  <Input
                    id="minRifaValue"
                    type="number"
                    min="0"
                    value={settings.fees.minRifaValue}
                    onChange={(e) => setSettings({
                      ...settings,
                      fees: { ...settings.fees, minRifaValue: parseFloat(e.target.value) }
                    })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveSettings}>Salvar Taxas</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Settings */}
        <TabsContent value="categories">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Categorias de Ganhaveis
                </CardTitle>
                <CardDescription>
                  Gerencie as categorias disponíveis para ganhaveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Carregando categorias...</div>
                ) : (
                  <div className="space-y-4">
                    {categories.map((category) => {
                      const categorySubcategories = subcategories.filter(sub => sub.category_id === category.id);
                      return (
                        <Card key={category.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{category.nome}</CardTitle>
                                <CardDescription>
                                  {categorySubcategories.length} subcategorias
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-green-600 border-green-200">Ativo</Badge>
                                <Button size="sm" variant="outline" onClick={() => handleStartEditCategory(category)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remover Categoria</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja remover a categoria "{category.nome}"? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                                        Remover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {categorySubcategories.map((sub) => (
                                  <Badge key={sub.id} variant="secondary" className="flex items-center gap-1">
                                    {sub.name}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                      onClick={() => handleRemoveSubcategory(sub.id)}
                                    >
                                      ×
                                    </Button>
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Nova subcategoria..."
                                  value={newSubcategory.name}
                                  onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory(category.id)}
                                />
                                <Button size="sm" onClick={() => handleAddSubcategory(category.id)}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Categoria</DialogTitle>
                      <DialogDescription>Atualize os dados da categoria.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={editCategoryData.nome}
                          onChange={(e) => setEditCategoryData({ ...editCategoryData, nome: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                          value={editCategoryData.slug}
                          onChange={(e) => setEditCategoryData({ ...editCategoryData, slug: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea
                          value={editCategoryData.descricao}
                          onChange={(e) => setEditCategoryData({ ...editCategoryData, descricao: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL do Ícone</Label>
                        <Input
                          value={editCategoryData.icone_url}
                          onChange={(e) => setEditCategoryData({ ...editCategoryData, icone_url: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleUpdateCategory}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Adicionar Nova Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Nome da Categoria</Label>
                      <Input
                        id="categoryName"
                        placeholder="Ex: Esportes"
                        value={newCategory.nome}
                        onChange={(e) => setNewCategory({ ...newCategory, nome: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categorySlug">Slug</Label>
                      <Input
                        id="categorySlug"
                        placeholder="Ex: esportes"
                        value={newCategory.slug}
                        onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryDescription">Descrição</Label>
                    <Textarea
                      id="categoryDescription"
                      placeholder="Descrição da categoria..."
                      value={newCategory.descricao}
                      onChange={(e) => setNewCategory({ ...newCategory, descricao: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryIcon">URL do Ícone</Label>
                    <Input
                      id="categoryIcon"
                      placeholder="https://example.com/icon.png"
                      value={newCategory.icone_url}
                      onChange={(e) => setNewCategory({ ...newCategory, icone_url: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Categoria
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Partners Settings */}
        <TabsContent value="partners">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Parceiros de Afiliados
                </CardTitle>
                <CardDescription>
                  Gerencie os parceiros validados para links de afiliados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Domínio</TableHead>
                      <TableHead>Comissão (%)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliatePartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>{partner.domain}</TableCell>
                        <TableCell>{partner.commission}%</TableCell>
                        <TableCell>{getStatusBadge(partner.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Parceiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="partnerName">Nome do Parceiro</Label>
                    <Input
                      id="partnerName"
                      placeholder="Ex: Shopee"
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerDomain">Domínio</Label>
                    <Input
                      id="partnerDomain"
                      placeholder="Ex: shopee.com.br"
                      value={newPartner.domain}
                      onChange={(e) => setNewPartner({ ...newPartner, domain: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerCommission">Comissão (%)</Label>
                    <Input
                      id="partnerCommission"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Ex: 5"
                      value={newPartner.commission || ""}
                      onChange={(e) => setNewPartner({ ...newPartner, commission: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <Button className="mt-4" onClick={handleAddPartner}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Parceiro
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Configure como e quando enviar notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar emails para eventos importantes
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailNotifications: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar SMS para eventos críticos
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, smsNotifications: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações push no navegador
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, pushNotifications: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Relatórios Semanais</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar resumo semanal por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, weeklyReports: checked }
                    })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveSettings}>Salvar Notificações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}