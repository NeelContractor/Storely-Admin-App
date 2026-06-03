// services/authService.ts

import { api } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";
import type { ApiResponse, AuthRegisterParams, LoginParams, User } from "../types/types";

export const register = (data: AuthRegisterParams): Promise<ApiResponse<User>> =>
    api(ENDPOINTS.REGISTER, {
        method: "POST",
        body: data,
    });

export const login = (data: LoginParams): Promise<ApiResponse<User>> =>
    api(ENDPOINTS.LOGIN, {
        method: "POST",
        body: data,
    });

export const logout = () =>
    api(ENDPOINTS.LOGOUT, {
        method: "POST",
        requiresAuth: true,
    });