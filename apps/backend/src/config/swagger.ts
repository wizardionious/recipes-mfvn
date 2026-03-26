import type { FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import type { FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: "Recipes API",
      description: "API for managing recipes",
      version: "0.1.0",
    },
    servers: [{ url: "http://localhost:3000", description: "Development" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
  },
};
