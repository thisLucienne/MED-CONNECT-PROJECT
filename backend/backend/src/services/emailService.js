const fs = require('fs').promises;
const path = require('path');
const { createTransporter } = require('../config/email');

class EmailService {
  /**
   * Charger un template d'email
   * @param {string} templateName - Nom du template
   * @returns {Promise<string>} Contenu HTML du template
   */
  static async loadTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
      return await fs.readFile(templatePath, 'utf8');
    } catch (error) {
      console.error(`Erreur chargement template ${templateName}:`, error);
      throw new Error(`Template ${templateName} introuvable`);
    }
  }

  /**
   * Remplacer les variables dans un template
   * @param {string} template - Template HTML
   * @param {Object} variables - Variables à remplacer
   * @returns {string} Template avec variables remplacées
   */
  static replaceTemplateVariables(template, variables) {
    let result = template;
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, variables[key] || '');
    });
    
    return result;
  }

  /**
   * Envoyer un email
   * @param {Object} options - Options d'envoi
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  static async sendEmail({ to, subject, html, text = null }) {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Med Connect <noreply@medconnect.com>',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Fallback text sans HTML
        attachments: [
          {
            filename: 'med-connect.png',
            path: path.join(__dirname, '../../assets/med-connect.png'),
            cid: 'logo' // Utilisé dans les templates avec src="cid:logo"
          }
        ]
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log(`✅ Email envoyé à ${to}: ${subject}`);
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      console.error(`❌ Erreur envoi email à ${to}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envoyer l'email de bienvenue pour un patient
   * @param {Object} user - Données utilisateur
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  static async sendWelcomeEmail(user) {
    try {
      const template = await this.loadTemplate('welcome');
      
      const variables = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        registrationDate: new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      const html = this.replaceTemplateVariables(template, variables);

      return await this.sendEmail({
        to: user.email,
        subject: 'Bienvenue sur Med Connect !',
        html
      });
    } catch (error) {
      console.error('Erreur envoi email bienvenue:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer le code 2FA par email
   * @param {Object} user - Données utilisateur
   * @param {string} code - Code 2FA
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  static async send2FACode(user, code) {
    try {
      const template = await this.loadTemplate('2fa-code');
      
      const now = new Date();
      const expiryMinutes = parseInt(process.env['2FA_CODE_EXPIRY_MINUTES']) || 10;
      
      const variables = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        code: code,
        expiryMinutes: expiryMinutes,
        loginDate: now.toLocaleDateString('fr-FR'),
        loginTime: now.toLocaleTimeString('fr-FR')
      };

      const html = this.replaceTemplateVariables(template, variables);

      return await this.sendEmail({
        to: user.email,
        subject: `Code de vérification Med Connect: ${code}`,
        html
      });
    } catch (error) {
      console.error('Erreur envoi code 2FA:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer l'email de confirmation de candidature médecin
   * @param {Object} doctor - Données du médecin
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  static async sendDoctorApplicationConfirmation(doctor) {
    try {
      const template = await this.loadTemplate('doctor-application');
      
      const variables = {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        specialty: doctor.specialty,
        licenseNumber: doctor.licenseNumber,
        applicationDate: new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      const html = this.replaceTemplateVariables(template, variables);

      return await this.sendEmail({
        to: doctor.email,
        subject: 'Candidature reçue - Med Connect',
        html
      });
    } catch (error) {
      console.error('Erreur envoi confirmation candidature:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer l'email d'approbation de médecin
   * @param {Object} doctor - Données du médecin
   * @param {Object} approver - Données de l'approbateur
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  static async sendDoctorApprovalNotification(doctor, approver) {
    try {
      const template = await this.loadTemplate('doctor-approved');
      
      const variables = {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        specialty: doctor.specialty,
        licenseNumber: doctor.licenseNumber,
        approvalDate: new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        approverName: `${approver.firstName} ${approver.lastName}`
      };

      const html = this.replaceTemplateVariables(template, variables);

      return await this.sendEmail({
        to: doctor.email,
        subject: 'Candidature approuvée - Med Connect',
        html
      });
    } catch (error) {
      console.error('Erreur envoi approbation médecin:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer l'email de rejet de médecin
   * @param {Object} doctor - Données du médecin
   * @param {string} rejectionReason - Raison du rejet
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  static async sendDoctorRejectionNotification(doctor, rejectionReason) {
    try {
      const template = await this.loadTemplate('doctor-rejected');
      
      const variables = {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        rejectionReason: rejectionReason
      };

      const html = this.replaceTemplateVariables(template, variables);

      return await this.sendEmail({
        to: doctor.email,
        subject: 'Candidature non retenue - Med Connect',
        html
      });
    } catch (error) {
      console.error('Erreur envoi rejet médecin:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer une notification aux admins pour nouvelle candidature
   * @param {Object} doctor - Données du médecin
   * @param {Array} adminEmails - Liste des emails d'admins
   * @returns {Promise<Array>} Résultats des envois
   */
  static async sendAdminNotification(doctor, adminEmails) {
    try {
      const template = await this.loadTemplate('admin-notification');
      
      const variables = {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phone: doctor.phone || 'Non renseigné',
        specialty: doctor.specialty,
        licenseNumber: doctor.licenseNumber,
        applicationDate: new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      const html = this.replaceTemplateVariables(template, variables);

      // Envoyer à tous les admins
      const promises = adminEmails.map(adminEmail => 
        this.sendEmail({
          to: adminEmail,
          subject: 'Nouvelle candidature médecin - Action requise',
          html
        })
      );

      const results = await Promise.all(promises);
      
      console.log(`Notifications envoyées à ${adminEmails.length} admin(s)`);
      return results;
    } catch (error) {
      console.error('Erreur envoi notifications admin:', error);
      return [{ success: false, error: error.message }];
    }
  }

  /**
   * Envoyer un email de test
   * @param {string} to - Destinataire
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  static async sendTestEmail(to) {
    try {
      const html = `
        <h2>Test Email - Med Connect</h2>
        <p>Ceci est un email de test pour vérifier la configuration.</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <p><strong>Destinataire:</strong> ${to}</p>
        <p>Si vous recevez cet email, la configuration fonctionne correctement ! ✅</p>
      `;

      return await this.sendEmail({
        to,
        subject: 'Test Email - Med Connect',
        html
      });
    } catch (error) {
      console.error('Erreur envoi email test:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;