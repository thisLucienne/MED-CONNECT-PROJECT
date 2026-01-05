const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'med_connect',
    user: 'postgres',
    password: '4096'
});

async function resetAdminPassword() {
    console.log('🔧 Réinitialisation du mot de passe admin...\n');

    try {
        // Nouveau mot de passe
        const newPassword = 'Admin123!@#';
        const saltRounds = 12;
        
        console.log('1. Hachage du nouveau mot de passe...');
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        console.log('✅ Mot de passe haché');

        // Mettre à jour dans la base de données
        console.log('2. Mise à jour dans la base de données...');
        const updateQuery = `
            UPDATE users 
            SET password = $1, 
                login_attempts = 0, 
                locked_until = NULL,
                updated_at = NOW()
            WHERE email = 'admin@medconnect.com'
            RETURNING id, email, first_name, last_name, role, status;
        `;
        
        const result = await pool.query(updateQuery, [hashedPassword]);
        
        if (result.rows.length > 0) {
            console.log('✅ Mot de passe admin mis à jour:', {
                id: result.rows[0].id,
                email: result.rows[0].email,
                firstName: result.rows[0].first_name,
                lastName: result.rows[0].last_name,
                role: result.rows[0].role,
                status: result.rows[0].status
            });
            
            console.log('\n🎉 Identifiants admin:');
            console.log('📧 Email: admin@medconnect.com');
            console.log('🔑 Mot de passe: Admin123!@#');
            
        } else {
            console.log('❌ Aucun admin trouvé avec cet email');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await pool.end();
    }
}

// Exécuter la réinitialisation
resetAdminPassword();