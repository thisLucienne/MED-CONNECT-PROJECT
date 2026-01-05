-- ÉTAPE 2: Après avoir créé la base, se connecter à "med_connect" dans pgAdmin
-- (Clic droit sur "med_connect" → Query Tool)
-- Puis exécuter ces commandes :

-- Donner les privilèges sur le schéma public
GRANT ALL ON SCHEMA public TO med_connect_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO med_connect_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO med_connect_user;

-- Donner les privilèges par défaut pour les futures tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO med_connect_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO med_connect_user;