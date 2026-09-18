import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5001/api/v1",
    withCredentials: true
});

// Request interceptor - attach token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor - handle 401 errors and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Dispatch event to notify App component of auth state change
            window.dispatchEvent(new Event("authStateChange"));
            // Redirect to login page
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;