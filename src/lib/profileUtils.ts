import { supabase } from '@/integrations/supabase/client';
import { validateProfile, validatePublicProfile, type Profile, type PublicProfile } from './profileValidation';

// Get current user's full profile (private data)
export async function getMyProfile(): Promise<Profile> {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching my profile:', error);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!data) {
    throw new Error('Profile not found');
  }

  const validation = validateProfile(data);
  if (!validation.success) {
    console.error('Profile validation failed:', (validation as any).error);
    throw new Error('Invalid profile data received');
  }

  return validation.data;
}

// Get public profile by user ID or username
export async function getPublicProfile(identifier: string): Promise<PublicProfile> {
  if (!identifier) {
    throw new Error('User identifier required');
  }

  // Try to find by username first, then by ID
  let { data, error } = await supabase
    .from('user_profiles_public')
    .select('id,username,full_name,avatar_url,bio,location,website_url,instagram,twitter,facebook,youtube,tiktok,whatsapp,telegram')
    .eq('username', identifier)
    .maybeSingle();
    
  if (!data && error?.code === 'PGRST116') {
    // Not found by username, try by ID
    const { data: dataById, error: errorById } = await supabase
      .from('user_profiles_public')
      .select('id,username,full_name,avatar_url,bio,location,website_url,instagram,twitter,facebook,youtube,tiktok,whatsapp,telegram')
      .eq('id', identifier)
      .maybeSingle();
      
    data = dataById;
    error = errorById;
  }
  
  if (error) {
    console.error('Error fetching public profile:', error);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!data) {
    throw new Error('Profile not found');
  }

  const validation = validatePublicProfile(data);
  if (!validation.success) {
    console.error('Public profile validation failed:', (validation as any).error);
    throw new Error('Invalid profile data received');
  }

  return validation.data;
}

// Update current user's profile
export async function updateMyProfile(updates: Partial<Profile>): Promise<Profile> {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  const validation = validateProfile(data);
  if (!validation.success) {
    console.error('Updated profile validation failed:', (validation as any).error);
    throw new Error('Invalid profile data received after update');
  }

  return validation.data;
}