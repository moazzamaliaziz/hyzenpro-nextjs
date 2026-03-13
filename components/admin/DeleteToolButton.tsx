'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteToolButton({ toolId, toolName }: { toolId: string; toolName: string }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to permanently delete "${toolName}"? This action cannot be undone.`)) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/tools/${toolId}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete tool. Please try again.');
            }
        } catch {
            alert('Network error. Please try again.');
        }
        setDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Delete tool"
        >
            <Trash2 className={`w-4 h-4 ${deleting ? 'animate-spin' : ''}`} />
        </button>
    );
}
