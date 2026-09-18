import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middlewares/verifyToken";
import ExpenseCategory from "../models/expenseCategory.model";

export const AddExpenseType = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Authentication required" });
        const { name, color } = req.body;
        if (!name) return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Category name is required" });
        const category = await ExpenseCategory.create({ name, color, userId });
        return res.status(StatusCodes.OK).json({ msg: "All expenses", expense_category: category });
    } catch (error: any) {
        if (error?.code === 11000) return res.status(StatusCodes.CONFLICT).json({ msg: "Category already exists" });
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
    }
};

export const AllExpenseTypes = async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Authentication required" });
    const categories = await ExpenseCategory.find({ userId: req.user.id }).sort({ name: 1 });
    return res.status(StatusCodes.CREATED).json({ msg: "Fetched expenses categories", expense_categories: categories });
};

export const RemoveExpenseType = async (_req: AuthRequest, res: Response) => res.status(StatusCodes.OK).json({ msg: "Expense detail updated!" });
export const UpdateExpenseType = async (_req: AuthRequest, res: Response) => res.status(StatusCodes.OK).json({ msg: "Expense deleted!" });
