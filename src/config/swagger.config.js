const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drakz API',
      version: '1.0.0',
      description: 'API documentation for the Drakz project',
    },
    servers: [
      {
        url: `${BACKEND_URL}/api`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Local server',
      },
      {
        url: "http://localhost:3001/api",
        description: "Local Development Server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
