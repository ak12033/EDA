// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/express.js";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        code: "NO_TOKEN",
        message: "Access token is missing",
      });
    }

    try {
      const decoded: any = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      );

      req.user = { userId: decoded.userId };
      next();
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Access token has expired",
        });
      }

      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Access token is invalid",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Internal Server Error",
    });
  }
};