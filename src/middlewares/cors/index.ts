import cors from "cors";

export const corsMiddleware =()=>{
    return cors({
  origin:  "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
})};


