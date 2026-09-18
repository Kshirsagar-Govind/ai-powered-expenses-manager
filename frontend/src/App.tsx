import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/login";
import Register from "./pages/register";
import AddExpense from "./pages/addExpenses";
import ExpenseList from "./pages/expensesList";

function AppContent() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    // Check authentication on mount and when location changes
    checkAuth();

    // Listen for storage changes (e.g., when token is set/removed in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    // Listen for custom auth state change event (e.g., after login)
    const handleAuthStateChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChange", handleAuthStateChange);
    
    // Also check on focus (in case token was set in another tab)
    window.addEventListener("focus", checkAuth);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChange", handleAuthStateChange);
      window.removeEventListener("focus", checkAuth);
    };
  }, [location]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/expenses" replace />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/expenses" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/expenses" replace /> : <Register />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/expenses"
        element={ <ExpenseList />
        }
        // element={
        //   isAuthenticated ? <ExpenseList /> : <Navigate to="/login" replace />
        // }
      />
      <Route
        path="/expenses/add"
        element={<AddExpense /> }
        // element={
        //   isAuthenticated ? <AddExpense /> : <Navigate to="/login" replace />
        // }
      />

      {/* Fallback */}
      <Route path="*" element={<div className="p-4">Page Not Found</div>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
