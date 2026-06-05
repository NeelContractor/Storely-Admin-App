// src/utils/cloudinaryUpload.ts
import { cloudinarySignature } from '../services/imageService';

export const uploadImageToCloudinary = async (uri: string): Promise<string> => {
  const sigRes = await cloudinarySignature();

  // Handle both { data: { apiKey, ... } } and flat { apiKey, ... } response shapes
  const payload = sigRes?.data ?? (sigRes as any);
  const { apiKey, cloudName, folder, signature, timestamp } = payload;

  if (!apiKey || !cloudName || !signature) {
    console.error('[Cloudinary] Unexpected signature response:', sigRes);
    throw new Error('Invalid signature response from server.');
  }

  const formData = new FormData();
  const filename = uri.split('/').pop() ?? 'photo.jpg';
  const ext      = /\.(\w+)$/.exec(filename)?.[1] ?? 'jpeg';

  formData.append('file', { uri, name: filename, type: `image/${ext}` } as any);
  formData.append('api_key',   apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  if (folder) formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as any)?.error?.message ?? `Cloudinary upload failed (${response.status})`
    );
  }

  const data = await response.json();
  return data.secure_url as string;
};