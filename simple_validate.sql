-- Script simple pour valider le médecin
-- Exécutez dans pgAdmin sur la base "med_connect"

-- 1. Voir tous les utilisateurs
SELECT * FROM users WHERE email LIKE '%paul.martin%';

-- 2. Valider le médecin (changer PENDING en APPROVED)
UPDATE users 
SET status = 'APPROVED' 
WHERE email = 'paul.martin.1767333625123@test.com';

-- 3. Vérifier le changement
SELECT id, email, status, first_name, last_name FROM users 
WHERE email = 'paul.martin.1767333625123@test.com';