import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchExpenses, deleteExpense, updateExpense, type Expense } from "../services/expense";
import { fetchCategories, type ExpenseCategory } from "../services/categories";

// interface expI{
//   id:string,
// category:{name:string, color:string},
// createdAt:string
// amount:string
// description:string
// }

export default function ExpenseList() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to load expenses. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      setDeleting(id);
      await deleteExpense(id);
      setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to delete expense");
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (exp: Expense) => {
    setEditingExpense(exp);
  };

  const handleSaveEdit = async () => {
    if (!editingExpense) return;
    try {
      setSavingEdit(true);
      const updated = await updateExpense(
        editingExpense.id,
        editingExpense.amount,
        editingExpense.description,
        (editingExpense.createdAt as any) || undefined
      );
      setExpenses((prev) => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
      setEditingExpense(null);
    } catch (err) {
      console.error("Failed to save edit:", err);
      setError((err as any).response?.data?.msg || "Failed to save changes");
    } finally {
      setSavingEdit(false);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex mb-6 justify-between items-center">
          <h1 className="text-2xl font-semibold text-black">Expenses</h1>
          <button
            onClick={() => navigate("/expenses/add")}
            className="bg-black text-white py-2 px-4 rounded-xl font-medium hover:bg-gray-900 transition"
          >
            + Add Expense
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button
              onClick={loadExpenses}
              className="ml-2 text-red-600 font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
            <p className="text-gray-500 mt-4">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No expenses added yet.</p>
            <button
              onClick={() => navigate("/expenses/add")}
              className="text-black font-medium hover:underline"
            >
              Add your first expense
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-600">Total Spending</p>
              <p className="text-2xl font-bold text-black">
                ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
              </p>
            </div>

            {/* List */}
            <div className="space-y-3 p-5 bg-stone-100 border-none border rounded-md max-h-[70vh] overflow-y-auto">
              {expenses.map((exp:any) => (
                <div
                  key={exp.id}
                  className="
                  flex 
                  items-center 
                  justify-between 
                  bg-gray-50 
                  border border-gray-200 
                  rounded-xl p-4 hover:shadow-md transition"
                >
                  {/* Left - Category Badge & Details */}
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                      style={{
                        backgroundColor: exp.category?.color || "#808080",
                      }}
                    >
                      {exp.category?.name?.charAt(0).toUpperCase() || "E"}
                    </div>
                    <div className="flex-1">
                      <p className="text-black font-medium">
                        {exp.description || exp.category?.name || "Expense"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {exp.category?.name && `${exp.category.name} • `}
                        {formatDate(exp.createdAt)} • {exp.category.name}
                      </p>
                    </div>
                  </div>

                  {/* Right - Amount & Delete */}
                  <div className="flex items-center gap-4">
                    <p className="text-black font-semibold text-lg">₹{exp.amount}</p>
                    <button
                      onClick={() => openEdit(exp)}
                      className="text-gray-400 hover:text-black transition font-bold text-lg mr-2"
                      title="Edit expense"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deleting === exp.id}
                      className="text-gray-400 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                      title="Delete expense"
                    >
                      {deleting === exp.id ? "..." : "✕"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {/* Edit Modal */}
        {editingExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setEditingExpense(null)} />
            <div className="relative bg-white w-full max-w-lg rounded-xl shadow-lg p-6 z-10">
              <h2 className="text-lg font-semibold mb-4">Edit Expense</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Amount</label>
                  <input
                    type="number"
                    value={editingExpense.amount}
                    onChange={e => setEditingExpense(prev => prev ? { ...prev, amount: Number(e.target.value) } : prev)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category</label>
                  <select
                    value={editingExpense.category?.id || editingExpense.categoryId}
                    onChange={e => {
                      const selected = categories.find(c => c.id === e.target.value);
                      setEditingExpense(prev => prev ? { ...prev, category: selected ? { id: selected.id, name: selected.name } : prev.category, categoryId: e.target.value } : prev);
                    }}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingExpense.description}
                    onChange={e => setEditingExpense(prev => prev ? { ...prev, description: e.target.value } : prev)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={new Date(editingExpense.createdAt).toISOString().split('T')[0]}
                    onChange={e => setEditingExpense(prev => prev ? { ...prev, createdAt: new Date(e.target.value) } : prev)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={() => setEditingExpense(null)} className="flex-1 border border-gray-300 py-2 rounded-xl">Cancel</button>
                <button onClick={handleSaveEdit} disabled={savingEdit} className="flex-1 bg-black text-white py-2 rounded-xl">{savingEdit ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
