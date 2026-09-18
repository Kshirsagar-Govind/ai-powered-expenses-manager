import { Router } from "express";
import { AddExpenseType, AllExpenseTypes, RemoveExpenseType, UpdateExpenseType } from "../controllers/expenseTypes.controller";
import { authenticateUser } from "../middlewares/verifyToken";

const router = Router();
router.get("/", authenticateUser, AllExpenseTypes);
router.post("/", authenticateUser, AddExpenseType);
router.patch("/", authenticateUser, RemoveExpenseType);
router.delete("/", authenticateUser, UpdateExpenseType);
export default router;
