// src/utils/slug.ts
import { customAlphabet } from 'nanoid';

// lowercase letters + digits only — no uppercase, no underscore, no hyphen
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

export const generateSlug = (name: string): string => {
    const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return base ? `${base}-${nanoid()}` : '';
};