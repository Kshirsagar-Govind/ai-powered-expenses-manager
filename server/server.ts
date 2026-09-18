import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routerUser from "./src/routes/user.routes";
import routerExpense from "./src/routes/expenses.routes";
import routerExpenseType from "./src/routes/expenseTypes.routes";
import { connectDatabase } from "./src/config/db";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors({
    origin: ["http://localhost:5173", "https://expense-app-frontend-rdlg0wcbf-kshirsagargovinds-projects.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => { console.log("REQ:", req.method, req.path); next(); });

app.get("/health", (_req: Request, res: Response) => res.status(201).json({ msg: "++ SERVER UP AND RUNNING" }));
app.get("/ping", (_req: Request, res: Response) => res.status(201).json({ msg: "++ SERVER UP AND RUNNING" }));
app.use("/api/v1/user", routerUser);
app.use("/api/v1/expenses", routerExpense);
app.use("/api/v1/expense/types", routerExpenseType);

export { app };

async function startServer() {
    try {
        await connectDatabase();
        app.listen(PORT, () => console.log(`SERVER IS RUNNING ON PORT ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

if (require.main === module) startServer();
