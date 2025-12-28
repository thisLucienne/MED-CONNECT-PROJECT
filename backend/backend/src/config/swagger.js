const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Med Connect API',
      version: '1.0.0',
      description: 'API REST pour la plateforme Med Connect - Gestion de dossiers médicaux et communication patient-médecin',
      contact: {
        name: 'Support Med Connect',
        email: 'support@medconnect.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de développement'
      },
      {
        url: 'http://194.238.25.170:5000',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via /api/auth/login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'ERROR_CODE'
                },
                message: {
                  type: 'string',
                  example: 'Message d\'erreur descriptif'
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Opération réussie'
            },
            data: {
              type: 'object'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            phone: {
              type: 'string',
              example: '6 12 34 56 78'
            },
            profilePicture: {
              type: 'string',
              format: 'uri',
              nullable: true
            },
            role: {
              type: 'string',
              enum: ['PATIENT', 'DOCTOR', 'ADMIN'],
              example: 'PATIENT'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'PENDING', 'APPROVED', 'REJECTED', 'BLOCKED'],
              example: 'ACTIVE'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            contenu: {
              type: 'string',
              example: 'Bonjour, j\'aimerais prendre rendez-vous.'
            },
            objet: {
              type: 'string',
              example: 'Demande de rendez-vous'
            },
            expediteur: {
              $ref: '#/components/schemas/User'
            },
            destinataire: {
              $ref: '#/components/schemas/User'
            },
            dateEnvoi: {
              type: 'string',
              format: 'date-time'
            },
            confirmationLecture: {
              type: 'boolean',
              example: false
            }
          }
        },
        DossierMedical: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            titre: {
              type: 'string',
              example: 'Consultation cardiologie'
            },
            description: {
              type: 'string',
              example: 'Suivi cardiaque régulier'
            },
            type: {
              type: 'string',
              enum: ['CONSULTATION', 'URGENCE', 'SUIVI', 'AUTRE'],
              example: 'CONSULTATION'
            },
            statut: {
              type: 'string',
              enum: ['OUVERT', 'FERME', 'ARCHIVE'],
              example: 'OUVERT'
            },
            dateCreation: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
    path.join(__dirname, '../../server.js')
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

