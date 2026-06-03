// src/services/imageService.ts

import { api } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";
import { ApiResponse, CloudiaryResponseBody } from "../types/types";

// // GET /cloudinary/signature
// export const cloudinarySignature = (): Promise<ApiResponse<CloudiaryResponseBody>> =>
//     api(ENDPOINTS.CLOUDINARY_SIGNATURE(), {
//         method: "POST",
//         requiresAuth: true,
//     });


// ─── Signature ────────────────────────────────────────────────────────────────
// GET /cloudinary/signature
export const cloudinarySignature = (): Promise<ApiResponse<CloudiaryResponseBody>> =>
    api(ENDPOINTS.CLOUDINARY_SIGNATURE(), {
        method: "POST",
        requiresAuth: true,
    });

// ─── Full upload flow ─────────────────────────────────────────────────────────

export type CloudinaryUploadResult = {
    /** The CDN URL of the uploaded image, e.g. https://res.cloudinary.com/… */
    url: string;
    /** Public ID assigned by Cloudinary */
    publicId: string;
    /** Original filename */
    originalFilename: string;
};

/**
 * Fetches a signed upload credential from your backend, then POSTs the file
 * directly to Cloudinary. Returns a `CloudinaryUploadResult` on success.
 *
 * Usage:
 *   const result = await uploadToCloudinary(file);
 *   console.log(result.url); // → https://res.cloudinary.com/…
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
    // 1. Get signature from your backend
    const sigResponse = await cloudinarySignature();
    const { apiKey, cloudName, folder, signature, timestamp } = sigResponse.data;

    // 2. Build multipart form
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    if (folder) {
        formData.append("folder", folder);
    }

    // 3. POST to Cloudinary (no Authorization header — uses signed params)
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
    );

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
            (err as any)?.error?.message ?? `Cloudinary upload failed (${response.status})`
        );
    }

    const data = await response.json();

    return {
        url:              data.secure_url   as string,
        publicId:         data.public_id    as string,
        originalFilename: data.original_filename as string,
    };
}