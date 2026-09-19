import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchExpenses, deleteExpense, updateExpense, type Expense } from "../services/expense";
import ThemeToggle from "../components/ThemeToggle";

const chartColors = ["#7c3aed", "#ff6547", "#f5a524", "#20b486", "#5b8def", "#e45aa8"];

const toDateInput = (date: Date) => date.toISOString().split("T")[0];

const getExpenseDate = (expense: Expense) => new Date(expense.createdAt);

export default function ExpenseList() {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(toDateInput(monthStart));
    const [endDate, setEndDate] = useState(toDateInput(today));

    useEffect(() => {
        void loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            setError("");
            setExpenses(await fetchExpenses());
        } catch (err: any) {
            setError(err.response?.data?.msg || "Failed to load expenses. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredExpenses = useMemo(() => {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);
        return expenses.filter((expense) => {
            const date = getExpenseDate(expense);
            return date >= start && date <= end;
        });
    }, [endDate, expenses, startDate]);

    const categoryTotals = useMemo(() => {
        const totals = new Map<string, number>();
        filteredExpenses.forEach((expense) => {
            const name = expense.category?.name || "Other";
            totals.set(name, (totals.get(name) || 0) + expense.amount);
        });
        return Array.from(totals.entries())
            .map(([name, amount], index) => ({ name, amount, color: chartColors[index % chartColors.length] }))
            .sort((first, second) => second.amount - first.amount);
    }, [filteredExpenses]);

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const chartBackground = categoryTotals.length
        ? `conic-gradient(${categoryTotals.map((item, index) => {
            const start = categoryTotals.slice(0, index).reduce((sum, entry) => sum + entry.amount, 0) / totalAmount * 360;
            const end = start + item.amount / totalAmount * 360;
            return `${item.color} ${start}deg ${end}deg`;
        }).join(", ")})`
        : "#e8e6ef";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("authStateChange"));
        navigate("/login", { replace: true });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            setDeleting(id);
            await deleteExpense(id);
            setExpenses((current) => current.filter((expense) => expense.id !== id));
        } catch (err: any) {
            setError(err.response?.data?.msg || "Failed to delete expense");
        } finally {
            setDeleting(null);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingExpense) return;
        try {
            setSavingEdit(true);
            const updated = await updateExpense(
                editingExpense.id,
                editingExpense.amount,
                editingExpense.description,
                editingExpense.createdAt.toString()
            );
            setExpenses((current) => current.map((expense) => expense.id === updated.id ? { ...expense, ...updated } : expense));
            setEditingExpense(null);
        } catch (err: any) {
            setError(err.response?.data?.msg || "Failed to save changes");
        } finally {
            setSavingEdit(false);
        }
    };

    const formatDate = (date: string | Date) => new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="dashboard-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-6xl">
                <header className="mb-7 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg text-white shadow-lg shadow-violet-200 dark:shadow-none">₹</div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">Spendwise</p>
                            <h1 className="text-xl font-bold text-[#252336] dark:text-white sm:text-2xl">Good to see you</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button onClick={handleLogout} className="hidden rounded-xl border border-[#e5e2ed] bg-white px-4 py-3 text-sm font-semibold text-[#4b465e] transition hover:bg-[#faf9fc] dark:border-white/10 dark:bg-[#242235] dark:text-white sm:block">Logout</button>
                        <button onClick={() => navigate("/expenses/add")} className="rounded-xl bg-[#ff6547] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 dark:shadow-none">+ Add</button>
                    </div>
                </header>

                {error && <div className="mb-5 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button onClick={() => void loadExpenses()} className="font-bold underline">Retry</button></div>}

                <section className="mb-6 grid gap-4 md:grid-cols-[1.45fr_1fr]">
                    <div className="relative overflow-hidden rounded-[1.75rem] bg-[#27243e] p-6 text-white shadow-xl shadow-violet-100 dark:shadow-none sm:p-8">
                        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border-[28px] border-violet-400/20" />
                        <div className="relative">
                            <div className="mb-9 flex items-center justify-between"><span className="text-sm text-violet-100">Total spending</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs">Selected range</span></div>
                            <p className="text-4xl font-bold tracking-tight sm:text-5xl">₹{totalAmount.toLocaleString("en-IN")}</p>
                            <p className="mt-3 text-sm text-violet-100">{filteredExpenses.length} {filteredExpenses.length === 1 ? "expense" : "expenses"} from {formatDate(startDate)} to {formatDate(endDate)}</p>
                        </div>
                    </div>
                    <div className="rounded-[1.75rem] bg-gradient-to-br from-violet-500 to-[#7c3aed] p-6 text-white shadow-xl shadow-violet-100 dark:shadow-none sm:p-8">
                        <p className="text-sm text-violet-100">Average expense</p>
                        <p className="mt-4 text-3xl font-bold">₹{filteredExpenses.length ? Math.round(totalAmount / filteredExpenses.length).toLocaleString("en-IN") : "0"}</p>
                        <p className="mt-2 text-sm text-violet-100">Across your selected dates</p>
                        <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full w-2/3 rounded-full bg-white" /></div>
                    </div>
                </section>

                <section className="mb-6 rounded-[1.75rem] border border-[#e9e6f0] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#201e30] sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">Analytics</p><h2 className="text-xl font-bold text-[#252336] dark:text-white">Spending by category</h2></div>
                        <div className="grid grid-cols-2 gap-2 text-sm sm:flex"><label className="text-[#8d889d]">From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#e6e2ed] bg-[#faf9fc] px-3 py-2 text-[#433e54] outline-none focus:border-violet-400 dark:border-white/10 dark:bg-[#29263b] dark:text-white" /></label><label className="text-[#8d889d]">To<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#e6e2ed] bg-[#faf9fc] px-3 py-2 text-[#433e54] outline-none focus:border-violet-400 dark:border-white/10 dark:bg-[#29263b] dark:text-white" /></label></div>
                    </div>
                    <div className="grid items-center gap-6 md:grid-cols-[minmax(210px,0.85fr)_1fr]">
                        <div className="flex justify-center"><div className="relative h-52 w-52 rounded-full" style={{ background: chartBackground }}><div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white text-center dark:bg-[#201e30]"><span className="text-xs text-[#9691a5]">Total</span><strong className="text-xl text-[#252336] dark:text-white">₹{totalAmount.toLocaleString("en-IN")}</strong></div></div></div>
                        <div className="space-y-3">{categoryTotals.length ? categoryTotals.map((item) => <div key={item.name} className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="truncate text-sm font-medium text-[#514c61] dark:text-[#d6d1e3]">{item.name}</span></div><span className="shrink-0 text-sm font-bold text-[#252336] dark:text-white">₹{item.amount.toLocaleString("en-IN")}</span></div>) : <p className="text-center text-sm text-[#9691a5]">No expenses in this date range.</p>}</div>
                    </div>
                </section>

                <section className="rounded-[1.75rem] border border-[#e9e6f0] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#201e30] sm:p-6">
                    <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">Activity</p><h2 className="text-xl font-bold text-[#252336] dark:text-white">Recent expenses</h2></div><button onClick={() => navigate("/expenses/add")} className="text-sm font-bold text-violet-500">View all</button></div>
                    {loading ? <div className="py-12 text-center text-sm text-[#9691a5]">Loading expenses...</div> : expenses.length === 0 ? <div className="py-12 text-center"><p className="mb-3 text-[#9691a5]">No expenses added yet.</p><button onClick={() => navigate("/expenses/add")} className="font-bold text-violet-500">Add your first expense</button></div> : <div className="space-y-2">{filteredExpenses.map((expense) => <div key={expense.id} className="flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-[#faf9fc] dark:hover:bg-[#29263b]"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0ed] font-bold text-[#ff6547] dark:bg-[#442b31]">{(expense.category?.name || "O").charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-[#363143] dark:text-white">{expense.description || expense.category?.name || "Expense"}</p><p className="text-xs text-[#9a95a8]">{expense.category?.name || "Other"} · {formatDate(expense.createdAt)}</p></div><p className="shrink-0 font-bold text-[#252336] dark:text-white">₹{expense.amount.toLocaleString("en-IN")}</p><button onClick={() => setEditingExpense(expense)} className="hidden p-2 text-lg text-[#aaa5b6] hover:text-violet-500 sm:block" title="Edit expense">✎</button><button onClick={() => void handleDelete(expense.id)} disabled={deleting === expense.id} className="p-2 text-lg text-[#aaa5b6] hover:text-red-500" title="Delete expense">{deleting === expense.id ? "..." : "×"}</button></div>)}</div>}
                </section>

                <button onClick={handleLogout} className="mt-5 w-full rounded-xl border border-[#e5e2ed] bg-white py-3 text-sm font-semibold text-[#817b91] dark:border-white/10 dark:bg-[#201e30] dark:text-[#d6d1e3] sm:hidden">Logout</button>
            </div>

            {editingExpense && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 dark:bg-[#201e30] sm:p-7"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-[#252336] dark:text-white">Edit expense</h2><button onClick={() => setEditingExpense(null)} className="text-2xl text-[#9691a5]">×</button></div><div className="space-y-4"><label className="block text-sm font-medium text-[#716b80] dark:text-[#c4bfd4]">Amount<input type="number" value={editingExpense.amount} onChange={(event) => setEditingExpense((current) => current ? { ...current, amount: Number(event.target.value) } : current)} className="mt-1 w-full rounded-xl border border-[#e6e2ed] px-4 py-3 dark:border-white/10 dark:bg-[#29263b] dark:text-white" /></label><label className="block text-sm font-medium text-[#716b80] dark:text-[#c4bfd4]">Description<textarea rows={3} value={editingExpense.description || ""} onChange={(event) => setEditingExpense((current) => current ? { ...current, description: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#e6e2ed] px-4 py-3 dark:border-white/10 dark:bg-[#29263b] dark:text-white" /></label></div><div className="mt-6 flex gap-3"><button onClick={() => setEditingExpense(null)} className="flex-1 rounded-xl border border-[#e6e2ed] py-3 font-semibold dark:border-white/10 dark:text-white">Cancel</button><button onClick={() => void handleSaveEdit()} disabled={savingEdit} className="flex-1 rounded-xl bg-[#ff6547] py-3 font-semibold text-white">{savingEdit ? "Saving..." : "Save"}</button></div></div></div>}
        </div>
    );
}
