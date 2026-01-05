-- Valider le nouveau médecin Paul Martin
-- Exécutez dans pgAdmin sur la base "med_connect"

-- 1. Vérifier le médecin
SELECT u.id, u.email, u.status, u.first_name, u.last_name, d.specialty 
FROM users u 
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.email = 'paul.martin.1767333625123@test.com';

-- 2. Valider le médecin
UPDATE users 
SET status = 'APPROVED' 
WHERE email = 'paul.martin.1767333625123@test.com';

-- 3. Mettre à jour la date d'approbation
UPDATE doctors 
SET approved_at = NOW() 
WHERE user_id = 'ecc9c214-ddee-4121-bb81-2550e530739d';

-- 4. Vérifier les changements
SELECT u.id, u.email, u.status, u.first_name, u.last_name, d.specialty, d.approved_at
FROM users u 
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.email = 'paul.martin.1767333625123@test.com';