const { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum, integer, date } = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');

// Enums pour les rôles et statuts
const roleEnum = pgEnum('role', ['PATIENT', 'DOCTOR', 'ADMIN']);
const statusEnum = pgEnum('status', ['ACTIVE', 'PENDING', 'APPROVED', 'REJECTED', 'BLOCKED']);

// Table des utilisateurs
const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  dateNaissance: date('date_naissance'),
  profilePicture: varchar('profile_picture', { length: 500 }),
  role: roleEnum('role').notNull(),
  status: statusEnum('status').default('ACTIVE').notNull(),
  isActive2FA: boolean('is_active_2fa').default(false),
  isVerified: boolean('is_verified').default(false),
  loginAttempts: varchar('login_attempts', { length: 10 }).default('0'),
  lockedUntil: timestamp('locked_until'),
  lastConnection: timestamp('last_connection'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Table des médecins (extension des utilisateurs)
const doctors = pgTable('doctors', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  specialty: varchar('specialty', { length: 100 }).notNull(),
  licenseNumber: varchar('license_number', { length: 50 }).notNull().unique(),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Table des codes 2FA
const twoFactorCodes = pgTable('two_factor_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  code: varchar('code', { length: 4 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  attempts: varchar('attempts', { length: 10 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Table des refresh tokens
const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Table des messages
const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  contenu: text('contenu').notNull(),
  expediteur: uuid('expediteur').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  destinataire: uuid('destinataire').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  confirmationLecture: boolean('confirmation_lecture').default(false),
  dateEnvoi: timestamp('date_envoi').defaultNow().notNull(),
  dateModification: timestamp('date_modification'),
  objet: varchar('objet', { length: 200 }),
  type: varchar('type', { length: 20 }).default('MESSAGE')
});

// Table des dossiers médicaux (créés par les patients)
const dossiersMedicaux = pgTable('dossiers_medicaux', {
  id: uuid('id').defaultRandom().primaryKey(),
  idPatient: uuid('id_patient').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  titre: varchar('titre', { length: 200 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 20 }).notNull(),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  dateModification: timestamp('date_modification'),
  statut: varchar('statut', { length: 20 }).default('OUVERT')
});

// Table des accès aux dossiers (patients donnent accès aux médecins)
const accesDossiers = pgTable('acces_dossiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  idDossier: uuid('id_dossier').references(() => dossiersMedicaux.id, { onDelete: 'cascade' }).notNull(),
  idMedecin: uuid('id_medecin').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  dateAutorisation: timestamp('date_autorisation').defaultNow().notNull(),
  statut: varchar('statut', { length: 20 }).default('ACTIF'), // ACTIF, REVOQUE
  typeAcces: varchar('type_acces', { length: 20 }).default('LECTURE') // LECTURE, ECRITURE
});

// Table des ordonnances
const ordonnances = pgTable('ordonnances', {
  id: uuid('id').defaultRandom().primaryKey(),
  idDossier: uuid('id_dossier').references(() => dossiersMedicaux.id, { onDelete: 'cascade' }).notNull(),
  medicament: varchar('medicament', { length: 200 }).notNull(),
  dosage: varchar('dosage', { length: 100 }),
  duree: varchar('duree', { length: 100 }),
  dateCreation: timestamp('date_creation').defaultNow().notNull()
});

// Table des documents médicaux
const documentsMedicaux = pgTable('documents_medicaux', {
  id: uuid('id').defaultRandom().primaryKey(),
  idDossier: uuid('id_dossier').references(() => dossiersMedicaux.id, { onDelete: 'cascade' }).notNull(),
  nom: varchar('nom', { length: 200 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // radio, analyse, rapport
  cheminFichier: varchar('chemin_fichier', { length: 500 }).notNull(),
  dateUpload: timestamp('date_upload').defaultNow().notNull()
});

// Table des allergies
const allergies = pgTable('allergies', {
  id: uuid('id').defaultRandom().primaryKey(),
  idDossier: uuid('id_dossier').references(() => dossiersMedicaux.id, { onDelete: 'cascade' }).notNull(),
  nom: varchar('nom', { length: 100 }).notNull(),
  dateCreation: timestamp('date_creation').defaultNow().notNull()
});

// Table des commentaires (ajoutés par patients ou médecins autorisés)
const commentaires = pgTable('commentaires', {
  id: uuid('id').defaultRandom().primaryKey(),
  idDossier: uuid('id_dossier').references(() => dossiersMedicaux.id, { onDelete: 'cascade' }).notNull(),
  contenu: text('contenu').notNull(),
  auteur: uuid('auteur').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  dateCreation: timestamp('date_creation').defaultNow().notNull()
});

// Table des rendez-vous (organisés par les médecins)
const rendezVous = pgTable('rendez_vous', {
  id: uuid('id').defaultRandom().primaryKey(),
  idPatient: uuid('id_patient').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  idMedecin: uuid('id_medecin').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  dateRendezVous: timestamp('date_rendez_vous').notNull(),
  duree: integer('duree').default(30), // en minutes
  motif: text('motif').notNull(),
  statut: varchar('statut', { length: 20 }).default('PLANIFIE'), // PLANIFIE, CONFIRME, ANNULE, TERMINE
  notes: text('notes'), // Notes du médecin
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  dateModification: timestamp('date_modification')
});

// Table des demandes de connexion (patients vers médecins)
const demandesConnexion = pgTable('demandes_connexion', {
  id: uuid('id').defaultRandom().primaryKey(),
  idPatient: uuid('id_patient').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  idMedecin: uuid('id_medecin').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  statut: varchar('statut', { length: 20 }).default('EN_ATTENTE'), // EN_ATTENTE, ACCEPTEE, REFUSEE
  message: text('message'), // Message du patient
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  dateReponse: timestamp('date_reponse')
});

// Table des paramètres de santé (tableau de bord patient)
const parametresSante = pgTable('parametres_sante', {
  id: uuid('id').defaultRandom().primaryKey(),
  idPatient: uuid('id_patient').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  groupeSanguin: varchar('groupe_sanguin', { length: 5 }),
  poids: varchar('poids', { length: 10 }),
  taille: varchar('taille', { length: 10 }),
  allergiesConnues: text('allergies_connues'),
  medicamentsActuels: text('medicaments_actuels'),
  conditionsMedicales: text('conditions_medicales'),
  contactUrgence: varchar('contact_urgence', { length: 100 }),
  telephoneUrgence: varchar('telephone_urgence', { length: 20 }),
  dateModification: timestamp('date_modification').defaultNow().notNull()
});

// Table des notifications (pour l'admin et système)
const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  destinataire: uuid('destinataire').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  titre: varchar('titre', { length: 200 }).notNull(),
  contenu: text('contenu').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  lu: boolean('lu').default(false),
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  dateModification: timestamp('date_modification')
});

// Relations
const usersRelations = relations(users, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId]
  }),
  twoFactorCodes: many(twoFactorCodes),
  refreshTokens: many(refreshTokens),
  approvedDoctors: many(doctors, {
    relationName: 'approvedBy'
  }),
  messagesEnvoyes: many(messages, {
    relationName: 'expediteur'
  }),
  messagesRecus: many(messages, {
    relationName: 'destinataire'
  }),
  dossiersMedicaux: many(dossiersMedicaux),
  accesDossiers: many(accesDossiers),
  demandesConnexionPatient: many(demandesConnexion, {
    relationName: 'patient'
  }),
  demandesConnexionMedecin: many(demandesConnexion, {
    relationName: 'medecin'
  }),
  parametresSante: many(parametresSante),
  commentaires: many(commentaires),
  rendezVousPatient: many(rendezVous, {
    relationName: 'patient'
  }),
  rendezVousMedecin: many(rendezVous, {
    relationName: 'medecin'
  }),
  notifications: many(notifications)
}));

const doctorsRelations = relations(doctors, ({ one }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id]
  }),
  approver: one(users, {
    fields: [doctors.approvedBy],
    references: [users.id],
    relationName: 'approvedBy'
  })
}));

const messagesRelations = relations(messages, ({ one }) => ({
  expediteur: one(users, {
    fields: [messages.expediteur],
    references: [users.id],
    relationName: 'expediteur'
  }),
  destinataire: one(users, {
    fields: [messages.destinataire],
    references: [users.id],
    relationName: 'destinataire'
  })
}));

const dossiersMedicauxRelations = relations(dossiersMedicaux, ({ one, many }) => ({
  patient: one(users, {
    fields: [dossiersMedicaux.idPatient],
    references: [users.id]
  }),
  acces: many(accesDossiers),
  ordonnances: many(ordonnances),
  documents: many(documentsMedicaux),
  allergies: many(allergies),
  commentaires: many(commentaires)
}));

const accesDossiersRelations = relations(accesDossiers, ({ one }) => ({
  dossier: one(dossiersMedicaux, {
    fields: [accesDossiers.idDossier],
    references: [dossiersMedicaux.id]
  }),
  medecin: one(users, {
    fields: [accesDossiers.idMedecin],
    references: [users.id]
  })
}));

const ordonnancesRelations = relations(ordonnances, ({ one }) => ({
  dossier: one(dossiersMedicaux, {
    fields: [ordonnances.idDossier],
    references: [dossiersMedicaux.id]
  })
}));

const documentsMedicauxRelations = relations(documentsMedicaux, ({ one }) => ({
  dossier: one(dossiersMedicaux, {
    fields: [documentsMedicaux.idDossier],
    references: [dossiersMedicaux.id]
  })
}));

const allergiesRelations = relations(allergies, ({ one }) => ({
  dossier: one(dossiersMedicaux, {
    fields: [allergies.idDossier],
    references: [dossiersMedicaux.id]
  })
}));

const commentairesRelations = relations(commentaires, ({ one }) => ({
  dossier: one(dossiersMedicaux, {
    fields: [commentaires.idDossier],
    references: [dossiersMedicaux.id]
  }),
  auteur: one(users, {
    fields: [commentaires.auteur],
    references: [users.id]
  })
}));

const rendezVousRelations = relations(rendezVous, ({ one }) => ({
  patient: one(users, {
    fields: [rendezVous.idPatient],
    references: [users.id],
    relationName: 'patient'
  }),
  medecin: one(users, {
    fields: [rendezVous.idMedecin],
    references: [users.id],
    relationName: 'medecin'
  })
}));

const demandesConnexionRelations = relations(demandesConnexion, ({ one }) => ({
  patient: one(users, {
    fields: [demandesConnexion.idPatient],
    references: [users.id],
    relationName: 'patient'
  }),
  medecin: one(users, {
    fields: [demandesConnexion.idMedecin],
    references: [users.id],
    relationName: 'medecin'
  })
}));

const parametresSanteRelations = relations(parametresSante, ({ one }) => ({
  patient: one(users, {
    fields: [parametresSante.idPatient],
    references: [users.id]
  })
}));

const notificationsRelations = relations(notifications, ({ one }) => ({
  destinataire: one(users, {
    fields: [notifications.destinataire],
    references: [users.id]
  })
}));

const twoFactorCodesRelations = relations(twoFactorCodes, ({ one }) => ({
  user: one(users, {
    fields: [twoFactorCodes.userId],
    references: [users.id]
  })
}));

const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id]
  })
}));

module.exports = {
  users,
  doctors,
  twoFactorCodes,
  refreshTokens,
  messages,
  dossiersMedicaux,
  accesDossiers,
  demandesConnexion,
  parametresSante,
  ordonnances,
  documentsMedicaux,
  allergies,
  commentaires,
  rendezVous,
  notifications,
  roleEnum,
  statusEnum,

  usersRelations,
  doctorsRelations,
  messagesRelations,
  dossiersMedicauxRelations,
  accesDossiersRelations,
  demandesConnexionRelations,
  parametresSanteRelations,
  ordonnancesRelations,
  documentsMedicauxRelations,
  allergiesRelations,
  commentairesRelations,
  rendezVousRelations,
  notificationsRelations,
  twoFactorCodesRelations,
  refreshTokensRelations
};