// controllers/auth.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/generateTokens.js";
import prisma from "../lib/prisma.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if(!name || typeof name !== "string" || name.trim() === "" || !email || typeof email !== "string" || email.trim() === "" || !password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required. Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({where: { email: normalizedEmail },});
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    const tokens = generateTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    return res
      .cookie("accessToken", tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 min
      })
      .cookie("refreshToken", tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      });

  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || typeof email !== "string" || email.trim() === "" || !password || typeof password !== "string" || password === "") {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({where: { email: normalizedEmail }});
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const tokens = generateTokens(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    return res
      .cookie("accessToken", tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 min
      })
      .cookie("refreshToken", tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const user = await prisma.user.findFirst({where: { refreshToken }});
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const tokens = generateTokens(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    return res
      .cookie("accessToken", tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 min
      })
      .cookie("refreshToken", tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        success: true,
        message: "Tokens refreshed successfully",
      });

  } catch (error) {
    console.error("Refresh Token Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const user = await prisma.user.findFirst({where: { refreshToken }});
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User session not found",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    return res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });

  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token is missing",
      });
    }

    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) {
      return res.status(403).json({
        success: false,
        code: "REFRESH_TOKEN_INVALID",
        message: "Invalid refresh token",
      });
    }

    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    } catch {
      return res.status(403).json({
        success: false,
        code: "REFRESH_TOKEN_EXPIRED",
        message: "Refresh token expired",
      });
    }

    const tokens = generateTokens(user.id);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };
    res
      .cookie("accessToken", tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 min
      })

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Me Controller Error:", error);
    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Internal Server Error",
    });
  }
};