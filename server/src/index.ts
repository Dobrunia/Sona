import "dotenv/config";
import http from "http";
import express, { type Request } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs, resolvers } from "@graphql/schema.js";
import { buildContext } from "@auth/context.js";
import { attachPresenceServer } from "@ws/ws.js";
import { config, assertConfig } from "@core/config.js";
import { prisma } from "./db/prisma.js";
import { formatGraphQLError } from "@core/errors.js";
import { checkS3Connection } from "@storage/storage.js";
import { logError, logInfo, logWarn } from "@core/logger.js";

const PORT = config.port;

async function checkDependencies() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logInfo("MySQL connected");
  } catch (error) {
    logError("MySQL connection failed", error);
    throw error;
  }

  try {
    await checkS3Connection();
    logInfo("S3 connected");
  } catch (error) {
    logError("S3 connection failed", error);
    throw error;
  }

  if (!config.jwtSecret || !config.googleClientId) {
    logWarn("Auth config missing; login may not work");
  }
}

async function start() {
  assertConfig();
  await checkDependencies();

  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.get("/health", (_req, res) => res.status(200).send("ok"));

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: formatGraphQLError
  });

  await apollo.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(apollo, {
      context: async ({ req }: { req: Request }) => buildContext(req)
    })
  );

  attachPresenceServer(server, prisma);

  server.listen(PORT, () => {
    logInfo(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  logError("Failed to start server", error);
  process.exit(1);
});
