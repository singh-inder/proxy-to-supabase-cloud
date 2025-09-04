import fastify from "fastify";
import proxy from "@fastify/http-proxy";
import cors from "@fastify/cors";

const server = fastify({ logger: process.env.ENABLE_LOGGING === "true" });

server.register(cors, {
  origin: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  maxAge: 86400
});

const upstream = process.env.SUPABASE_URL;
if (!upstream) throw new Error("SUPABASE_URL not provided");

const paths = ["/rest/v1", "/auth/v1", "/realtime/v1", "/functions/v1", "/storage/v1"];

for (const path of paths) {
  server.register(proxy, {
    upstream,
    prefix: path,
    rewritePrefix: path,
    websocket: path === "/realtime/v1"
  });
}

// PORT will be provided by render
server
  .listen({ port: process.env.PORT || 3000, host: "0.0.0.0" })
  .then(val => console.log("Running :", val));
