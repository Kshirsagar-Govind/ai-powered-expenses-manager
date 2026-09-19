import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routerUser from "./src/routes/user.routes";
import routerExpense from "./src/routes/expenses.routes";
import routerExpenseType from "./src/routes/expenseTypes.routes";
import { connectDatabase } from "./src/config/db";
import path from "path";
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;
const frontendPath = path.join(__dirname, "../../frontend/dist");
const allowedOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGINS || "").split(","),
    "http://localhost:5173",
].map((origin) => origin?.trim()).filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => { console.log("REQ:", req.method, req.path); next(); });

app.get("/health", (_req: Request, res: Response) => res.status(200).json({ status: "ok" }));
app.get("/ping", (_req: Request, res: Response) => res.status(200).json({ status: "ok" }));
app.use("/api/v1/user", routerUser);
app.use("/api/v1/expenses", routerExpense);
app.use("/api/v1/expense/types", routerExpenseType);

app.use(express.static(frontendPath));
if (process.env.NODE_ENV == 'production') {
    app.get("*", (_req: Request, res: Response) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    });
}

export { app };

async function startServer() {
    try {
        await connectDatabase();
        app.listen(PORT, "0.0.0.0", () => console.log(`✅ SERVER (${process.env.NODE_ENV || "production"}) IS RUNNING ON PORT ${PORT}`));
    } catch (error) {
        console.error("❌ Failed to start server:", error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

if (require.main === module) startServer();
