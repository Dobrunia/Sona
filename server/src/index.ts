import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schema.js";
import { buildContext } from "./context.js";
import { attachPresenceServer } from "./ws.js";

const PORT = Number(process.env.PORT ?? 4000);

async function start() {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.get("/health", (_req, res) => res.status(200).send("ok"));

  const apollo = new ApolloServer({
    typeDefs,
    resolvers
  });

  await apollo.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(apollo, {
      context: async ({ req }) => buildContext(req)
    })
  );

  attachPresenceServer(server);

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
