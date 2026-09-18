import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middlewares/verifyToken";
import Expense from "../models/expense.model";
import ExpenseCategory from "../models/expenseCategory.model";
import groq from "../config/groq";
import { expenseAnalyserPrompt, expensePrompt } from "../promts/expense.promt";

const serializeExpense = (expense: any) => {
    const value = expense.toJSON ? expense.toJSON() : expense;
    if (value.categoryId && typeof value.categoryId === "object") {
        value.category = value.categoryId;
        value.categoryId = value.categoryId.id || value.categoryId._id;
    }
    return value;
};

export const AllExpenses = async (req: AuthRequest, res: Response) => {
    try {
        const expenses = await Expense.find({ userId: req.user?.id })
            .populate({ path: "categoryId", select: "name color" })
            .sort({ createdAt: -1 });
        return res.status(StatusCodes.OK).json({ msg: "Fetched all expenses.", expenses: expenses.map(serializeExpense) });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to fetch expenses" });
    }
};

export const AddExpensesAI = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { rawExpense } = req.body;
        if (!userId || !rawExpense) return res.status(StatusCodes.BAD_REQUEST).json({ msg: userId ? "rawExpense text required" : "Invalid request" });

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [{ role: "user", content: expensePrompt(rawExpense) }],
            temperature: 0,
            response_format: { type: "json_object" }   // stops markdown-fenced JSON breaking JSON.parse
        });
        const parsed = JSON.parse(completion.choices[0].message.content || "{}");
        if (!parsed.category || typeof parsed.amount !== "number") throw new Error("Invalid AI expense response");

        const categoryName = String(parsed.category).toLowerCase();
        let category = await ExpenseCategory.findOne({ userId, name: categoryName });
        if (!category) category = await ExpenseCategory.create({ userId, name: categoryName });

        const expense = await Expense.create({
            amount: parsed.amount,
            description: parsed.description || "",
            categoryId: category._id,
            userId,
            source: "ai",
            createdAt: parsed.date ? new Date(parsed.date) : new Date()
        });
        return res.status(StatusCodes.OK).json({ success: true, data: serializeExpense(expense) });
    } catch (error: any) {
        console.error("AI Expense Error:", error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, msg: "AI parsing failed" + error.message });
    }
};

export const ExpenseAIAnalyser = async (req: AuthRequest, res: Response) => {
    try {
        const expenses = await Expense.find({ userId: req.user?.id }).populate({ path: "categoryId", select: "name" });
        if (expenses.length < 1) return res.status(StatusCodes.OK).json({ msg: "No expense added" });
        const result = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: expenseAnalyserPrompt(JSON.stringify(expenses.map(serializeExpense))) }],
            temperature: 0
        });
        const match = (result.choices[0].message.content || "").match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Invalid AI JSON");
        return res.status(StatusCodes.OK).json({ msg: "Expense analysis completed", result: JSON.parse(match[0]) });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "AI expense analysis failed" });
    }
};

export const AddExpenses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { amount, description, categoryId } = req.body;
        if (!userId) return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid request" });
        if (amount === undefined || amount === null || !categoryId) return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Amount and expense type are required" });
        const expense = await Expense.create({ amount, description, categoryId, userId, source: "manual" });
        return res.status(StatusCodes.CREATED).json({ msg: "New expense added", expense: serializeExpense(expense) });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to add expense" });
    }
};

export const UpdateExpenses = async (req: AuthRequest, res: Response) => {
    try {
        const updates: Record<string, unknown> = {};
        if (req.body.amount !== undefined) updates.amount = req.body.amount;
        if (req.body.description !== undefined) updates.description = req.body.description;
        if (req.body.date !== undefined) updates.createdAt = new Date(req.body.date);
        const expense = await Expense.findOneAndUpdate({ _id: req.params.id, userId: req.user?.id }, updates, { new: true, runValidators: true });
        if (!expense) return res.status(StatusCodes.NOT_FOUND).json({ msg: "Expense not found" });
        return res.status(StatusCodes.OK).json({ msg: "Expense detail updated!", expense: serializeExpense(expense) });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to update expense" });
    }
};

export const RemoveExpenses = async (req: AuthRequest, res: Response) => {
    try {
        const deleted = await Expense.deleteOne({ _id: req.params.id, userId: req.user?.id });
        if (!deleted.deletedCount) return res.status(StatusCodes.NOT_FOUND).json({ msg: "Expense not found" });
        return res.status(StatusCodes.OK).json({ msg: "Expense deleted!" });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to delete expense" });
    }
};
