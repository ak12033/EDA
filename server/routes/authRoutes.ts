import express from "express";
import { register, login, refreshToken, logout, me } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/refresh", refreshToken);
authRouter.post("/logout", logout);
authRouter.get("/me", me);

export default authRouter;