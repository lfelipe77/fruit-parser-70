-- Create ganhaveis storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ganhaveis', 'ganhaveis', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for ganhaveis bucket
CREATE POLICY "Public read access for ganhaveis images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ganhaveis');

CREATE POLICY "Authenticated users can upload ganhaveis images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ganhaveis' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their ganhaveis images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ganhaveis' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their ganhaveis images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ganhaveis' AND auth.uid() IS NOT NULL);