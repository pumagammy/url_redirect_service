import express, { Application, NextFunction } from "express";
import dotenv from "dotenv";
import http from "http"; // if no esModuleInterop, use: import * as http from "http";

import { connectDB } from "./config/db";
import urlRoutes from "./routes/url-route";
import { corsMiddleware } from "./middlewares/cors";
import { getRedisClient, disconnectRedis } from "./config/redis";

// Load .env variables
dotenv.config();

// Initialize express
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Keep reference to the HTTP server for graceful shutdown
let server: http.Server | null = null;

// Middleware to parse JSON
app.use(express.json());

// Middleware to enable CORS
app.use(corsMiddleware());

// Health check route
app.get("/health-check", (req, res) => {
  res.send({ message: "Server is healthy", status: "OK" });
});

// Use URL routes
app.use("/", urlRoutes);

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send({ error: "Something went wrong!" });
  }
);

// --- Startup ---
(async () => {
  try {
    await connectDB();
    await getRedisClient();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error:any) {
    console.error("❌ Startup failure:", error);
    process.exit(1);
  }
})();

// --- Graceful shutdown ---
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🔻 ${signal} received. Starting graceful shutdown…`);

  try {
    // 1) Stop accepting new connections
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => {
          if (err) {
            console.error("❌ Error closing HTTP server:", err);
            return reject(err);
          }
          console.log("✅ HTTP server closed.");
          resolve();
        });
      });
    }

    // 2) Disconnect Redis
    await disconnectRedis();

    console.log("👋 Shutdown complete. Exiting process.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during graceful shutdown:", err);
    process.exit(1);
  }
};

// Handle termination signals
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal as NodeJS.Signals, () => gracefulShutdown(signal));
});
