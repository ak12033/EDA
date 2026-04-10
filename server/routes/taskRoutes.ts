import express from "express";
import { getTasks, createTask, updateTask, deleteTask, toggleTask, getTaskStats } from "../controllers/taskController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const taskRouter = express.Router();

taskRouter.use(authenticate);

taskRouter.get("/stats", getTaskStats);
taskRouter.get("/", getTasks);
taskRouter.post("/", createTask);
taskRouter.patch("/:id", updateTask);
taskRouter.delete("/:id", deleteTask);
taskRouter.patch("/:id/toggle", toggleTask);

export default taskRouter;