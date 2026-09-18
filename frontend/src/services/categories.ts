import api from "../config/axios";

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
}

/**
 * Fetch all expense categories/types for the logged-in user
 */
export const fetchCategories = async (): Promise<ExpenseCategory[]> => {
  try {
    const response = await api.get("/expense/types/");
    return response.data.expense_categories || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

/**
 * Create a new expense category
 */
export const createCategory = async (
  name: string,
  color: string
): Promise<ExpenseCategory> => {
  try {
    const response = await api.post("/expense/types/", { name, color });
    return response.data.category;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
};

/**
 * Update an existing expense category
 */
export const updateCategory = async (
  id: string,
  name: string,
  color: string
): Promise<ExpenseCategory> => {
  try {
    const response = await api.patch("/expense/types/", { id, name, color });
    return response.data.category;
  } catch (error) {
    console.error("Failed to update category:", error);
    throw error;
  }
};

/**
 * Delete an expense category
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await api.delete("/expense/types/", { data: { id } });
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw error;
  }
};
