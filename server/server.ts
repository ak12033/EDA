import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true // <--- allow cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use('/api/auth',authRouter);
app.use('/api/task',taskRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});