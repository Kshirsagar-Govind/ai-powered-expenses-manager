import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitExpenseAI, updateExpense, type Expense } from '../services/expense';
import { fetchCategories, type ExpenseCategory } from '../services/categories';
import ThemeToggle from "../components/ThemeToggle";

interface ParsedExpense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    categoryId?: string;
}

type ExpenseResponse = Omit<Expense, "categoryId"> & {
    categoryId: string | { name?: string; _id?: string };
};

export default function AddExpense() {
    const navigate = useNavigate();
    const [inputText, setInputText] = useState("");
    const [parsedExpense, setParsedExpense] = useState<ParsedExpense | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aiUnavailable, setAIUnavailable] = useState(false);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const cats = await fetchCategories();
            setCategories(cats);
        } catch (err) {
            console.error("Failed to load categories:", err);
        }
    };

    const handleEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (parsedExpense) {
            setParsedExpense((prev) => prev ? {
                ...prev,
                [name]: name === "amount" ? Number(value) || 0 : value
            } : null);
        }
    };

    const submitForm = async () => {
        try {
            setError("");
            setSuccess("");
            if (inputText.trim().length < 5) {
                setError("Please provide a meaningful expense description");
                return;
            }
            setLoading(true);
            const res = await submitExpenseAI(inputText);
            if (!res.success) {
                setIsEditing(true);
                setAIUnavailable(true);
            }
            const expense = res.data as ExpenseResponse;
            const categoryName = typeof expense.categoryId === "object"
                ? (expense.categoryId?.name || expense.categoryId?._id?.toString() || "")
                : expense.categoryId;
            const existingCategory = categories.find(cat => cat.id === categoryName);

            setParsedExpense({
                id: expense.id,
                amount: expense.amount,
                category: existingCategory?.name || (typeof categoryName === "string" ? categoryName : "Unknown"),
                description: expense.description || "",
                date: new Date(expense.createdAt).toISOString().split("T")[0],
                categoryId: existingCategory?.id || (typeof expense.categoryId === "object" ? expense.categoryId?._id : expense.categoryId)
            });
            setIsEditing(false);
            setInputText("");

        } catch (err: any) {
            setError(err.response?.data?.msg || "Failed to parse expense. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdits = async () => {
        try {
            if (!parsedExpense) return;
            setError("");
            setLoading(true);

            // Update the expense with edited data
            await updateExpense(
                parsedExpense.id,
                parsedExpense.amount,
                parsedExpense.description,
                parsedExpense.date
            );

            setSuccess("✓ Expense updated successfully!");
            setTimeout(() => {
                setParsedExpense(null);
                setIsEditing(false);
                setSuccess("");
            }, 2000);
            setAIUnavailable(false);
        } catch (err: any) {
            setError(err.response?.data?.msg || "Failed to save changes. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMore = () => {
        setParsedExpense(null);
        setInputText("");
        setError("");
        setSuccess("");
        setAIUnavailable(false);
    };

    const handleBack = () => {
        navigate("/expenses");
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#151421] flex items-start sm:items-center justify-center px-3 py-4 sm:px-4 sm:py-8">

            <div className="w-full max-w-md bg-white dark:bg-[#201e30] rounded-2xl shadow-lg p-4 sm:p-6 max-h-[calc(100vh-2rem)] sm:max-h-[85vh] overflow-y-auto">

                {/* Title */}
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="min-h-11 min-w-11 px-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                        aria-label="Back to expenses"
                    >
                        ←
                    </button>
                    <h1 className="flex-1 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white text-center mr-11">
                        Add Expense
                    </h1>
                    <ThemeToggle />
                </div>
                {
                    aiUnavailable &&
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-900 mb-2">! AI Feature Unavailable </p>
                        <p className="text-xs text-red-800">
                            Please expense form so You can add your expense manualy
                        </p>
                    </div>
                }

                {/* Error Alert */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Success Alert */}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                        {success}
                    </div>
                )}

                {/* Step 1: Input */}
                {!parsedExpense && (
                    <div>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2 font-medium">
                                Describe your expense
                            </label>
                            <textarea
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                placeholder="e.g., spent 100 on bike fueling or bought groceries for 500"
                                rows={4}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Use natural language - AI will parse the details automatically
                            </p>
                        </div>

                        <button
                            onClick={submitForm}
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "Parsing..." : "Parse with AI"}
                        </button>
                    </div>
                )}

                {/* Step 2: Verify & Edit */}
                {parsedExpense && (
                    <div>
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium text-green-900 mb-2">✓ Expense Added</p>
                            <p className="text-xs text-green-800">
                                You can edit added expense if needed
                            </p>
                        </div>

                        {!isEditing ? (
                            <>
                                {/* Display Parsed Data */}
                                <div className="space-y-3 mb-6">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Amount</p>
                                        <p className="text-lg font-bold text-gray-900">₹ {parsedExpense.amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Category</p>
                                        <p className="text-base text-gray-800 capitalize">{parsedExpense.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Description</p>
                                        <p className="text-base text-gray-800">{parsedExpense.description || "(no description)"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                                        <p className="text-base text-gray-800">{parsedExpense.date}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => navigate("/expenses")}
                                        className="bg-black text-white py-3 min-h-12 rounded-xl font-medium hover:bg-gray-900 transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="border border-gray-300 text-gray-900 py-3 min-h-12 rounded-xl font-medium hover:bg-gray-50 transition"
                                    >
                                        Edit
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddMore}
                                    className="w-full border border-gray-200 text-gray-700 py-3 min-h-12 mt-3 rounded-xl font-medium hover:bg-gray-50 transition"
                                >
                                    + Add More
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Edit Form */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1 font-medium">
                                            Amount
                                        </label>
                                        <input
                                            name="amount"
                                            type="number"
                                            placeholder="₹ 0.00"
                                            value={parsedExpense.amount || ""}
                                            onChange={handleEdit}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1 font-medium">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={parsedExpense.category}
                                            onChange={handleEdit}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1 font-medium">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            placeholder="Optional description"
                                            rows={3}
                                            value={parsedExpense.description}
                                            onChange={handleEdit}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1 font-medium">
                                            Date
                                        </label>
                                        <input
                                            name="date"
                                            type="date"
                                            value={parsedExpense.date}
                                            onChange={handleEdit}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 border border-gray-300 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdits}
                                        disabled={loading}
                                        className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
