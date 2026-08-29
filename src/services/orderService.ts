// src/services/orderService.ts

import { ApiResponse, Order, GetAllOrders, GetOrdersParams } from "@/types";
import { api } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

const PAGE_SIZE = 10;

// GET /rest/stores/{username}/orders?page=1&pageSize=10&status=...&paymentStatus=...&search=...
export const getOrders = (
    username: string,
    filters?: GetOrdersParams
): Promise<ApiResponse<GetAllOrders>> => {
    const params = new URLSearchParams();
    params.set("page", String(filters?.page ?? 1));
    params.set("pageSize", String(filters?.pageSize ?? PAGE_SIZE));
    if (filters?.status) params.set("status", filters.status);
    if (filters?.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);

    return api(`${ENDPOINTS.GET_ORDERS(username)}?${params.toString()}`, {
        method: "GET",
        requiresAuth: true,
    });
};

// GET /rest/stores/{username}/orders/{orderId}
export const getOrder = (
    username: string,
    orderId: string
): Promise<ApiResponse<Order>> =>
    api(ENDPOINTS.GET_ORDER(username, orderId), {
        method: "GET",
        requiresAuth: true,
    });

// PUT /rest/stores/{username}/orders/{orderId}
export const updateOrder = (
    username: string,
    orderId: string,
    data: Partial<Order>
): Promise<ApiResponse<Order>> =>
    api(ENDPOINTS.UPDATE_ORDER(username, orderId), {
        method: "PUT",
        requiresAuth: true,
        body: data,
    });

// DELETE /rest/stores/{username}/orders/{orderId}
export const deleteOrder = (
    username: string,
    orderId: string
): Promise<ApiResponse<void>> =>
    api(ENDPOINTS.DELETE_ORDER(username, orderId), {
        method: "DELETE",
        requiresAuth: true,
    });