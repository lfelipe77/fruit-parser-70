-- Additional cleanup for remaining malformed URLs
UPDATE raffles 
SET direct_purchase_link = regexp_replace(direct_purchase_link, 'htmlropriedades-.*$', 'html')
WHERE direct_purchase_link LIKE '%htmlropriedades-%';