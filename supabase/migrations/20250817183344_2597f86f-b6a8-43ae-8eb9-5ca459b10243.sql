-- Fix the Games & Consoles category icon
UPDATE ganhavel_categories 
SET icone_url = '/lovable-uploads/67eff453-d5b1-47f9-a141-e80286a38ba0.png' 
WHERE slug = 'games-consoles' AND icone_url IS NULL;