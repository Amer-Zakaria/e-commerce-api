import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";
import { logger } from "..";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API Docs",
      description: `
    An interactive API reference where you could send requests with premade examples and login
    App description: An E-commerce API that includes various technologies, tools, and real-world cases. It's made for the sake of practice.
    To be logged in:
    1- Obtain the token: 
      Pick one rule and send its content throught the Auth route:
      Customer: { "email": "logged_in@example.com", "password": "StringPassword123!" }
      Admin: { "email": "admin@example.com", "password": "StringPassword123!" }
      or you could register throught (POST /api/user) as customer
    2- Inject the token in the requests' headers
      copy the token that you've obtain from the response
      click on the Authorize button on the top-right corner then paste it in field and click Authorize
          `,
      version,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          name: "x-auth-token",
          type: "apiKey",
          in: "header",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts", "./src/utils/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
  /* START - this for development sake (inject the toke programmatically) */
  const swaggerOptions =
    process.env.NODE_ENV === "development"
      ? {
          swaggerOptions: {
            requestInterceptor: (req: any) => {
              req.headers["x-auth-token"] =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjZjMmU2ZTg2YWE1YWY1ZGQ4NGRiZGMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpc0FkbWluIjp0cnVlLCJuYW1lIjoiSmFuZSBEb2UiLCJpYXQiOjE3MTgzNzk0MjN9.oK5jSaiCbnP91Jnr7Im98MVD8h9PH5vi60ZH5_MmjVE";
              return req;
            },
          },
        }
      : {};
  /* END */

  // Swagger page
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerOptions)
  );

  // Docs in JSON format
  /* app.get("/docs.json", (req: Request, res: Response) => {
    res.send(swaggerSpec);
  }); */

  logger.info(`Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;
