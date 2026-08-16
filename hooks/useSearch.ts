'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useAdminSearch(delay = 300) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [inputValue, setInputValue] = useState(searchParams.get('search') ?? '');

    const updateSearch = useCallback(
        (value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set('search', value);
            } else {
                params.delete('search');
            }
            params.delete('page');
            router.replace(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    useEffect(() => {
        const timeout = setTimeout(() => updateSearch(inputValue), delay);
        return () => clearTimeout(timeout);
    }, [inputValue, updateSearch, delay]);

    return { inputValue, setInputValue };
}
