'use client';

import dynamic from 'next/dynamic';

const CompareDrawer = dynamic(() => import('./CompareDrawer'), {
    ssr: false,
});

export default function ClientCompareDrawer() {
    return <CompareDrawer />;
}
