// src/utils/slug.ts
import { nanoid } from 'nanoid';

export const generateSlug = (name: string): string => {
    const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return base ? `${base}-${nanoid(8)}` : '';
};