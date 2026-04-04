// controllers/task.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { AuthRequest } from "../types/express.js";

// GET /tasks?status=&search=&page=&limit=
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be greater than 0",
      });
    }

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    const totalTasks = await prisma.task.count({ where });

    const tasks = await prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
      meta: {
        total: totalTasks,
        page,
        limit,
        totalPages: Math.ceil(totalTasks / limit),
      },
    });

  } catch (error) {
    console.error("Get Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { title, description } = req.body;
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title is required and must be a non-empty string",
      });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        userId,
        status: "pending", 
      },
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });

  } catch (error) {
    console.error("Create Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const taskId = Number(req.params.id);
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const { title, description } = req.body;
    if (title === undefined && description === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (title or description) is required",
      });
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });

  } catch (error) {
    console.error("Update Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const taskId = Number(req.params.id);
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const existingTask = await prisma.task.findFirst({where: { id: taskId, userId }});
    if(!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });

  } catch (error) {
    console.error("Delete Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const toggleTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const taskId = Number(req.params.id);
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const existingTask = await prisma.task.findFirst({where: { id: taskId, userId }});
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const newStatus = existingTask.status === "pending" ? "completed" : "pending";
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: updatedTask,
    });

  } catch (error) {
    console.error("Toggle Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};