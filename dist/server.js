"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const url_route_1 = __importDefault(require("./routes/url-route"));
const cors_1 = require("./middlewares/cors");
const redis_1 = require("./config/redis");
// Load .env variables
dotenv_1.default.config();
// Initialize express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Keep reference to the HTTP server for graceful shutdown
let server = null;
// Middleware to parse JSON
app.use(express_1.default.json());
// Middleware to enable CORS
app.use((0, cors_1.corsMiddleware)());
// Health check route
app.get("/health-check", (req, res) => {
    res.send({ message: "Server is healthy", status: "OK" });
});
// Use URL routes
app.use("/", url_route_1.default);
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: "Something went wrong!" });
});
// --- Startup ---
(async () => {
    try {
        await (0, db_1.connectDB)();
        await (0, redis_1.getRedisClient)();
        server = app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Startup failure:", error);
        process.exit(1);
    }
})();
// --- Graceful shutdown ---
const gracefulShutdown = async (signal) => {
    console.log(`\n🔻 ${signal} received. Starting graceful shutdown…`);
    try {
        // 1) Stop accepting new connections
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((err) => {
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
        await (0, redis_1.disconnectRedis)();
        console.log("👋 Shutdown complete. Exiting process.");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Error during graceful shutdown:", err);
        process.exit(1);
    }
};
// Handle termination signals
["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => gracefulShutdown(signal));
});
