import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, User, ExternalLink, Plus, Heart, Home, Award, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AvatarCropper from '@/components/AvatarCropper';
import { fileToDataUrl } from '@/lib/cropImage';
import { useProfileSave, handleAvatarSave } from '@/hooks/useProfileSave';
import { getAvatarSrc } from '@/lib/avatarUtils';
import { useProfileStatsSafe } from '@/hooks/useProfileStatsSafe';

export default function Profile() {
  const { profile, loading, updateProfile, refreshProfile, invalidateQueries } = useMyProfile();
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { save: saveProfile, saving: savingProfile, error: saveError } = useProfileSave();
  const { stats, loading: statsLoading } = useProfileStatsSafe(profile?.id || '', true);
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
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  

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

  // Debug auth session
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      console.log("[AUTH] user at profile", data?.user?.id, error);
    });
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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


  const handleSave = async () => {
    try {
      const result = await saveProfile({
        updates: formData,
        avatarFile: croppedBlob ? new File([croppedBlob], 'avatar.webp', { type: 'image/webp' }) : null
      });

      if (result) {
        // Invalidate queries to refresh all profile data
        invalidateQueries(['my-profile']);
        invalidateQueries(['profiles-list']);
        
        // Refresh profile data
        refreshProfile();
        
        toast({
          title: 'Perfil atualizado',
          description: 'Suas informações foram salvas com sucesso.',
        });
        
        // Clear avatar state after successful save
        setCroppedBlob(null);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Erro',
        description: saveError || 'Erro ao salvar perfil.',
        variant: 'destructive',
      });
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
    <div className="container mx-auto py-8 max-w-4xl" data-testid="profile-page">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        
        {/* Call to Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Início
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/perfil/${profile?.username || profile?.id}`} className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Ver Perfil Público
            </Link>
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
                <AvatarImage src={getAvatarSrc(profile, profile?.id)} data-testid="profile-avatar" />
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
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Plus className="h-4 w-4 text-blue-500" />
                  <span className="text-xl font-bold text-primary">{statsLoading ? '—' : stats.launched}</span>
                </div>
                <div className="text-xs text-muted-foreground">Lançados</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-green-500" />
                  <span className="text-xl font-bold text-primary">{statsLoading ? '—' : stats.completed}</span>
                </div>
                <div className="text-xs text-muted-foreground">Completos</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-xl font-bold text-primary">{statsLoading ? '—' : stats.awarded}</span>
                </div>
                <div className="text-xs text-muted-foreground">Premiados</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-xl font-bold text-primary">{statsLoading ? '—' : (stats.participated !== null ? stats.participated : '—')}</span>
                </div>
                <div className="text-xs text-muted-foreground">Participou</div>
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
                  <AvatarImage src={getAvatarSrc(profile, profile?.id)} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={uploading}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  data-testid="avatar-upload-button"
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

            <Button onClick={handleSave} disabled={savingProfile} className="w-full" data-testid="save-profile">
              {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            
            {/* Show preview of cropped avatar if available */}
            {croppedBlob && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Avatar pronto para salvar:</p>
                <Avatar className="w-16 h-16">
                  <AvatarImage src={URL.createObjectURL(croppedBlob)} data-testid="avatar-preview" />
                  <AvatarFallback><User className="w-6 h-6" /></AvatarFallback>
                </Avatar>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      <AvatarCropper
        src={cropSrc ?? ""}
        open={cropOpen}
        onClose={() => {
          setCropOpen(false);
          setCroppedBlob(null);
        }}
        onCropped={async (blob) => {
          try {
            setSavingAvatar(true);
            // Use drop-in handler for immediate upload and save
            await handleAvatarSave(blob, (updater) => {
              setFormData(updater);
            });
            await refreshProfile();
            setCropOpen(false);
            toast({
              title: 'Avatar atualizado',
              description: 'Seu avatar foi atualizado com sucesso.',
            });
          } catch (error: any) {
            console.error('Avatar save error:', error);
            toast({
              title: 'Erro',
              description: error.message || 'Erro ao atualizar avatar.',
              variant: 'destructive',
            });
          } finally {
            setSavingAvatar(false);
          }
        }}
      />
    </div>
  );
}