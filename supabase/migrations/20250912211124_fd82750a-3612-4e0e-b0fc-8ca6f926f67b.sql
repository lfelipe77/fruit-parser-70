-- Fix corrupted direct purchase links in raffles table
UPDATE raffles 
SET direct_purchase_link = regexp_replace(
  regexp_replace(
    regexp_replace(direct_purchase_link, '^https://ganhavel\.com/compra/p', ''),
    'phttps?://', 'https://'),
  '^https?://https?://', 'https://')
WHERE direct_purchase_link LIKE '%ganhavel.com/compra/p%' 
   OR direct_purchase_link LIKE '%phttps://%'
   OR direct_purchase_link LIKE '%https://https://%';