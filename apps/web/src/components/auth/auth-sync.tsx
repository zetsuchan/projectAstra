'use client';

import { useAuth } from '@/lib/auth';

export function AuthSync() {
    useAuth();
    return null;
}
