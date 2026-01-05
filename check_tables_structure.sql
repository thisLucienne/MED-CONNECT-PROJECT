-- Script pour vérifier la structure des tables
-- Exécutez dans pgAdmin sur la base "med_connect"

-- 1. Voir la structure de la table users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Voir la structure de la table doctors
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'doctors' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;