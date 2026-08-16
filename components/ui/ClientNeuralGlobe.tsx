'use client';

import dynamic from 'next/dynamic';

const NeuralGlobe = dynamic(() => import('./NeuralGlobe'), {
    ssr: false,
    loading: () => null,
});

export default function ClientNeuralGlobe() {
    return <NeuralGlobe />;
}
