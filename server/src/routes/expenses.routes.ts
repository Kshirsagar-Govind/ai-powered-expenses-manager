import { Router } from "express";
import { AddExpenses, AddExpensesAI, AllExpenses, ExpenseAIAnalyser, RemoveExpenses, UpdateExpenses } from "../controllers/expenses.controller";
import { authenticateUser } from "../middlewares/verifyToken";

const router = Router();
router.get("/", authenticateUser, AllExpenses);
router.post("/", authenticateUser, AddExpenses);
router.post("/AI", authenticateUser, AddExpensesAI);
router.post("/AI/analyse-expense", authenticateUser, ExpenseAIAnalyser);
router.patch("/:id", authenticateUser, UpdateExpenses);
router.delete("/:id", authenticateUser, RemoveExpenses);
export default router;
