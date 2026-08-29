// src/services/categoryService.ts

import { api } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";
import type { Category, CreateCategoryBody, UpdateCategoryBody } from "../types/types";

export const getCategories = (storeUsername: string) =>
    api<Category[]>(ENDPOINTS.GET_CATEGORIES(storeUsername));

export const createCategory = (storeUsername: string, data: CreateCategoryBody) =>
    api<Category>(ENDPOINTS.CREATE_CATEGORY(storeUsername), {
        method: "POST",
        requiresAuth: true,
        body: data,
    });

export const updateCategory = (id: number, data: UpdateCategoryBody) =>
    api<Category>(ENDPOINTS.UPDATE_CATEGORY(id), {
        method: "PUT",
        requiresAuth: true,
        body: data,
    });

export const activateCategory = (id: number) =>
    api<Category>(ENDPOINTS.ACTIVATE_CATEGORY(id), {
        method: "PATCH",
        requiresAuth: true,
    });

export const deactivateCategory = (id: number) =>
    api<Category>(ENDPOINTS.DEACTIVATE_CATEGORY(id), {
        method: "PATCH",
        requiresAuth: true,
    });

export const deleteCategory = (id: number) =>
    api<void>(ENDPOINTS.UPDATE_CATEGORY(id), {
        method: "DELETE",
        requiresAuth: true,
    });