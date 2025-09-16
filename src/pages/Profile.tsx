import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, User, ExternalLink, Plus, Search, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfileSave } from '@/hooks/useProfileSave';
import { getAvatarSrc } from '@/lib/avatarUtils';
import { useUnifiedProfile } from '@/hooks/useUnifiedProfile';
import { useProfileStats } from '@/hooks/useProfileStats';
import { ProfileStats } from '@/components/ProfileStats';

export default function Profile() {
  const { profile, isLoading: loading, error, updateProfile, refreshProfile } = useUnifiedProfile();
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useProfileStats(profile?.id);
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { save: saveProfile, saving: savingProfile, error: saveError } = useProfileSave();
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: ''
  });
  const [uploading, setUploading] = useState(false);

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

    console.log('[Avatar] File selected:', file.name, file.size, file.type);

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('[Avatar] File too large:', file.size);
      toast({
        title: 'Erro',
        description: 'Imagem muito grande (máx. 5MB).',
        variant: 'destructive',
      });
      return;
    }

    // Direct upload without cropping
    console.log('[Avatar] Direct upload started');
    event.target.value = "";
    setUploading(true);
    
    try {
      const result = await saveProfile({
        updates: formData,
        avatarFile: file
      });
      
      if (result) {
        await refreshProfile();
        toast({
          title: 'Avatar atualizado',
          description: 'Sua imagem foi salva com sucesso.',
        });
      }
    } catch (error) {
      console.error('[Avatar] Upload error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload da imagem.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };


  const handleSave = async () => {
    console.log('[Profile] handleSave called');
    try {
      console.log('[Profile] Starting save...', { 
        hasFormChanges: JSON.stringify(formData) !== JSON.stringify({
          full_name: profile?.full_name || '',
          username: profile?.username || '',
          bio: profile?.bio || '',
          location: profile?.location || ''
        })
      });

      const result = await saveProfile({
        updates: formData
      });

      console.log('[Profile] Save result:', result);

      if (result) {
        // Refresh profile data
        console.log('[Profile] Refreshing profile data...');
        await refreshProfile();
        
        toast({
          title: 'Perfil atualizado',
          description: 'Suas informações foram salvas com sucesso.',
        });
        
        console.log('[Profile] Save completed successfully');
      }
    } catch (error) {
      console.error('[Profile] Error saving profile:', error);
      toast({
        title: 'Erro',
        description: saveError || error?.message || 'Erro ao salvar perfil.',
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
          <Button variant="outline" onClick={() => navigate('/descobrir')}>
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
            {(console.debug('[ProfileStats] rpc', stats), null)}
            <ProfileStats 
              stats={{
                launched: stats?.launched ?? 0,
                participated: stats?.participating ?? 0,
                // completed: omitted temporarily (feature flag controlled)
                won: stats?.wins ?? 0,
              }}
              isLoading={statsLoading}
              error={statsError}
              onRetry={refetchStats}
            />
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

            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log('[Profile] Save button clicked!');
                console.log('[Profile] Button disabled?', savingProfile);
                console.log('[Profile] Form data:', formData);
                
                handleSave();
              }} 
              disabled={savingProfile} 
              className="w-full" 
              data-testid="save-profile"
            >
              {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}