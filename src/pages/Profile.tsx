import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, User, ExternalLink, Plus, Search, Users, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AvatarCropper from '@/components/AvatarCropper';
import { fileToDataUrl } from '@/lib/cropImage';

export default function Profile() {
  const { profile, loading, updateProfile } = useMyProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: ''
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [pendingFileExt, setPendingFileExt] = useState<string>("webp");

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || ''
      });
    }
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'Erro',
        description: 'Imagem muito grande (máx. 5MB).',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Open cropper
      const dataUrl = await fileToDataUrl(file);
      setPendingFileExt("webp"); // we will export to webp
      setCropSrc(dataUrl);
      setCropOpen(true);
      // Clear file input
      event.target.value = "";
    } catch (error) {
      console.error('Error preparing file for crop:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao preparar imagem para corte.',
        variant: 'destructive',
      });
    }
  };

  const uploadCroppedBlob = async (blob: Blob) => {
    if (!profile) return;
    
    const uid = profile.id;
    const path = `${uid}/avatar.webp`;

    setUploading(true);
    try {

      // 1) upload (overwrite same path)
      const upRes = await supabase.storage
        .from("avatars")
        .upload(path, blob, {
          upsert: true,
          cacheControl: "0",
          contentType: "image/webp",
        });
      if (upRes.error) throw upRes.error;

      // 2) public URL
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      if (!pub?.publicUrl) throw new Error("Falha ao obter URL pública");
      const baseUrl = pub.publicUrl;

      // 3) try UPDATE first
      const updRes = await supabase
        .from("user_profiles")
        .update({ avatar_url: baseUrl })
        .eq("id", uid)
        .select("id");
      if (updRes.error) throw updRes.error;

      // 4) if no row was updated, INSERT (RLS needs the policy from Step 1)
      if (!updRes.data || updRes.data.length === 0) {
        const insRes = await supabase
          .from("user_profiles")
          .insert({ id: uid, avatar_url: baseUrl })
          .select("id");
        if (insRes.error) throw insRes.error;
      }

      // 5) cache‑bust locally so it refreshes immediately
      const bust = `${baseUrl}?t=${Date.now()}`;
      await updateProfile({ avatar_url: bust });

      toast({
        title: 'Avatar atualizado',
        description: 'Seu avatar foi atualizado com sucesso.',
      });
    } catch (e: any) {
      console.error("[avatar upload/save] error:", e);
      // show the actual Supabase error message if present
      const msg = e?.message || e?.error_description || "Erro ao enviar avatar.";
      toast({
        title: 'Erro',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile(formData);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar perfil.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        
        {/* Call to Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to={`/perfil/${profile?.username || profile?.id}`} className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Ver Perfil Público
            </Link>
          </Button>
          <Button variant="outline" onClick={() => navigate('/raffles')}>
            <Search className="w-4 h-4 mr-2" />
            Explorar Ganhaveis
          </Button>
          <Button onClick={() => navigate('/lance-seu-ganhavel')}>
            <Plus className="w-4 h-4 mr-2" />
            Lançar Ganhavel
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Stats Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">
              {profile?.full_name || 'Nome não definido'}
            </CardTitle>
            <CardDescription>
              @{profile?.username || 'username'}
            </CardDescription>
            {profile?.bio && (
              <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
            )}
            {profile?.location && (
              <p className="text-sm text-muted-foreground">{profile.location}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" />
                  Seguidores
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Seguindo
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-lg font-semibold">{profile?.total_ganhaveis || 0}</p>
                <p className="text-sm text-muted-foreground">Ganhaveis Criados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Editar Informações</CardTitle>
            <CardDescription>
              Atualize suas informações de perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="space-y-2">
              <Label>Avatar do Perfil</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={uploading}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Alterar Avatar'}
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                JPG, PNG ou GIF. Máximo 5MB.
              </p>
            </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="@seuusername"
              />
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Sua cidade, estado"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Conte um pouco sobre você..."
                rows={4}
              />
            </div>
          </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>

      <AvatarCropper
        src={cropSrc ?? ""}
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        onCropped={(blob) => uploadCroppedBlob(blob)}
      />
    </div>
  );
}