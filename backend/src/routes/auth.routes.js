import { Router } from "express";
import { googleSignIn } from "../controllers/googleAuth.controller.js";

const authRouter = Router();

authRouter.post("/google", googleSignIn);

export default authRouter;
