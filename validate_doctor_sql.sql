-- Script SQL pour valider le médecin dans pgAdmin
-- Exécutez ces commandes dans l'ordre sur la base de données "med_connect"

-- 1. Vérifier l'état actuel du médecin
SELECT u.id, u.email, u.status, u."firstName", u."lastName", d.specialty, d."licenseNumber"
FROM users u 
LEFT JOIN doctors d ON u.id = d."userId"
WHERE u.email = 'marie.test.1767332808070@test.com';

-- 2. Valider le médecin (changer le statut à APPROVED)
UPDATE users 
SET status = 'APPROVED' 
WHERE email = 'marie.test.1767332808070@test.com';

-- 3. Mettre à jour la date d'approbation du médecin
UPDATE doctors 
SET "approvedAt" = NOW() 
WHERE "userId" IN (
  SELECT id FROM users WHERE email = 'marie.test.1767332808070@test.com'
);

-- 4. Vérifier que les changements ont été appliqués
SELECT u.id, u.email, u.status, u."firstName", u."lastName", d.specialty, d."approvedAt"
FROM users u 
LEFT JOIN doctors d ON u.id = d."userId"
WHERE u.email = 'marie.test.1767332808070@test.com';