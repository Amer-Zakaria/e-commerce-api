import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";
import { logger } from "..";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API Docs",
      version,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
  // Swagger page
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  /* app.get("/docs.json", (req: Request, res: Response) => {
    res.send(swaggerSpec);
  }); */

  logger.info(`Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;
