import { Router } from "express";
import { runNightlyTasks, verifyCronSecret } from "../controllers/cron.controller.js";

const cronRouter = Router();

// Secure the route with cron secret
cronRouter.post("/nightly", verifyCronSecret, runNightlyTasks);

export default cronRouter;
