import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Upload, Shield } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface Raffle {
  id: string;
  title: string;
  description: string;
  product_name: string;
  product_value: number;
  total_tickets: number;
  ticket_price: number;
  image_url: string;
  status: string;
  created_at: string;
  user_id: string;
}

interface RaffleFormData {
  title: string;
  description: string;
  product_name: string;
  product_value: string;
  total_tickets: string;
  ticket_price: string;
  status: string;
}

export default function AdminRaffles() {
  const { user } = useAuth();
  const { isAdmin, loading: profileLoading } = useMyProfile();
  const { toast } = useToast();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [formData, setFormData] = useState<RaffleFormData>({
    title: '',
    description: '',
    product_name: '',
    product_value: '',
    total_tickets: '',
    ticket_price: '',
      status: 'pending'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const openEditorById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data) {
        handleEdit(data as Raffle);
      }
    } catch (error) {
      console.error('Erro ao carregar rifa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir a rifa para edição.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!profileLoading && isAdmin) {
      fetchRaffles();
    }
  }, [isAdmin, profileLoading]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      openEditorById(editId);
      setDialogOpen(true);
    }
  }, [searchParams]);

  const fetchRaffles = async () => {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRaffles(data || []);
    } catch (error) {
      console.error('Error fetching raffles:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar rifas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('raffles')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('raffles')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload da imagem.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      let imageUrl = editingRaffle?.image_url || null;
      
      if (imageFile) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) {
          setSaving(false);
          return;
        }
      }

      const raffleData = {
        title: formData.title,
        description: formData.description,
        product_name: formData.product_name,
        product_value: parseFloat(formData.product_value) * 100, // Convert to cents
        total_tickets: parseInt(formData.total_tickets),
        ticket_price: parseFloat(formData.ticket_price) * 100, // Convert to cents
        status: formData.status,
        image_url: imageUrl,
        user_id: user.id
      };

      if (editingRaffle) {
        const { error } = await supabase
          .from('raffles')
          .update(raffleData)
          .eq('id', editingRaffle.id);

        if (error) throw error;

        toast({
          title: 'Rifa atualizada',
          description: 'Rifa foi atualizada com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('raffles')
          .insert([raffleData]);

        if (error) throw error;

        toast({
          title: 'Rifa criada',
          description: 'Nova rifa foi criada com sucesso. Status: Pendente.',
        });
      }

      setDialogOpen(false);
      setEditingRaffle(null);
      resetForm();
      fetchRaffles();
    } catch (error) {
      console.error('Error saving raffle:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar rifa.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (raffle: Raffle) => {
    setEditingRaffle(raffle);
    setFormData({
      title: raffle.title || '',
      description: raffle.description || '',
      product_name: raffle.product_name || '',
      product_value: ((raffle.product_value || 0) / 100).toString(),
      total_tickets: (raffle.total_tickets || 0).toString(),
      ticket_price: ((raffle.ticket_price || 0) / 100).toString(),
      status: raffle.status || 'draft'
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta rifa?')) return;

    try {
      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Rifa excluída',
        description: 'Rifa foi excluída com sucesso.',
      });
      fetchRaffles();
    } catch (error) {
      console.error('Error deleting raffle:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir rifa.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      product_name: '',
      product_value: '',
      total_tickets: '',
      ticket_price: '',
      status: 'draft'
    });
    setImageFile(null);
    setEditingRaffle(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'closed': return 'secondary';
      case 'pending': return 'outline';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'closed': return 'Fechada';
      case 'pending': return 'Pendente';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Acesso Negado</h3>
            <p className="text-muted-foreground text-center">
              Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar rifas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Rifas</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            const sp = new URLSearchParams(searchParams);
            sp.delete('edit');
            navigate({ pathname: '/admin/rifas', search: sp.toString() ? `?${sp.toString()}` : '' });
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Rifa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRaffle ? 'Editar Rifa' : 'Nova Rifa'}
              </DialogTitle>
              <DialogDescription>
                {editingRaffle ? 'Edite as informações da rifa.' : 'Crie uma nova rifa preenchendo as informações abaixo.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da rifa"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="product_name">Nome do Produto</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="Ex: iPhone 15 Pro"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da rifa"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="product_value">Valor do Prêmio (R$)</Label>
                  <Input
                    id="product_value"
                    type="number"
                    step="0.01"
                    value={formData.product_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_value: e.target.value }))}
                    placeholder="999.99"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ticket_price">Preço do Ticket (R$)</Label>
                  <Input
                    id="ticket_price"
                    type="number"
                    step="0.01"
                    value={formData.ticket_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, ticket_price: e.target.value }))}
                    placeholder="10.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="total_tickets">Total de Tickets</Label>
                  <Input
                    id="total_tickets"
                    type="number"
                    value={formData.total_tickets}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_tickets: e.target.value }))}
                    placeholder="1000"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="closed">Fechada</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Imagem</Label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving || uploading}>
                  {saving ? 'Salvando...' : uploading ? 'Enviando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Rifas</CardTitle>
            <CardDescription>
              Gerencie todas as rifas do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {raffles.map((raffle) => (
                  <TableRow key={raffle.id}>
                    <TableCell className="font-medium">{raffle.title}</TableCell>
                    <TableCell>{raffle.product_name}</TableCell>
                    <TableCell>{formatCurrency(raffle.ticket_price || 0)}</TableCell>
                    <TableCell>{raffle.total_tickets}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(raffle.status)}>
                        {getStatusLabel(raffle.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(raffle)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(raffle.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {raffles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma rifa encontrada. Crie a primeira rifa!
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}