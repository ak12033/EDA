import axios, { AxiosError } from "axios";

interface ErrorResponse {
    success: boolean;
    code?: string;
    message?: string;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    withCredentials: true,
});

api.interceptors.response.use(
    response => response,
    async (error: AxiosError<ErrorResponse> & { config?: any }) => {
        const originalRequest = error.config;

        const data = error.response?.data;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refresh") &&
            data &&
            ["NO_TOKEN", "TOKEN_EXPIRED", "INVALID_TOKEN"].includes(data.code || "")
        ) {
            originalRequest._retry = true;

            try {
                await api.get("/auth/refresh");
                return api(originalRequest);
            } catch (refreshError) {
                if (typeof window !== "undefined") window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;