import api from "../config/axios";
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Expense {
  id: string;
  amount: number;
  description?: string;
  categoryId: string;
  userId: string;
  source: "ai" | "manual";
  createdAt: Date;
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
}

/**
 * Fetch all expenses for the logged-in user
 */
export const fetchExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await api.get("/expenses/");
    return response.data.expenses || [];
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    throw error;
  }
};

/**
 * Submit a manual expense
 */
export const submitExpense = async (
  amount: number,
  categoryId: string,
  description?: string
): Promise<Expense> => {
  try {
    const response = await api.post("/expenses/", {
      amount,
      categoryId,
      description,
    });
    return response.data.expense;
  } catch (error) {
    console.error("Failed to submit expense:", error);
    throw error;
  }
};

/**
 * Submit an expense using AI parsing from raw text
 * Example: "Spent $50 on groceries at Whole Foods"
 */
export const submitExpenseAI = async (rawExpense: string): Promise<ApiResponse<Expense>> => {
  try {
    const response = await api.post("/expenses/AI", {
      rawExpense,
    });
    return response.data || {data:null, success:false};
  
  } catch (error) {
    console.error("Failed to submit expense via AI:", error);
    throw error;
  }
};

/**
 * Update an existing expense
 */
export const updateExpense = async (
  id: string,
  amount?: number,
  description?: string,
  date?:string
): Promise<Expense> => {
  try {
    const response = await api.patch(`/expenses/${id}`, {
      id,
      amount,
      description,
      date
    });
    return response.data.expense;
  } catch (error) {
    console.error("Failed to update expense:", error);
    throw error;
  }
};

/**
 * Delete an expense
 */
export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await api.delete(`/expenses/${id}`);
  } catch (error) {
    console.error("Failed to delete expense:", error);
    throw error;
  }
};
