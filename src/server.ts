import { connectDB } from './config/db';
import express ,{ Application, NextFunction } from "express";
import dotenv from "dotenv";
import urlRoutes from "./routes/url-route";
import { corsMiddleware } from './middlewares/cors';

//load .env variables
dotenv.config();

// initialize express
const app: Application = express();
const PORT = process.env.PORT || 5000;

//middleware to parse json
app.use(express.json());
//middleware to enable CORS
app.use(corsMiddleware());

//health check route
app.get("/health-check", (req, res) => {
  res.send({message:'Server is healthy',status: 'OK'});
}   );



//use url routes
app.use('/',urlRoutes)

//global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});



//first connct to db then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });   }).catch((error) => {
  console.error("Failed to connect to the database", error);
});                                       


