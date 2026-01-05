-- Réinitialiser le verrouillage du compte admin
UPDATE users 
SET login_attempts = 0, 
    locked_until = NULL 
WHERE email = 'admin@medconnect.com';

-- Vérifier le statut de l'admin
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    status,
    login_attempts,
    locked_until,
    created_at
FROM users 
WHERE email = 'admin@medconnect.com';