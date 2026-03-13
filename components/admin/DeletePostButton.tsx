'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeletePostButton({ postId, postTitle }: { postId: string; postTitle: string }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to permanently delete "${postTitle}"? This action cannot be undone.`)) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete post. Please try again.');
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
            title="Delete post"
        >
            <Trash2 className={`w-4 h-4 ${deleting ? 'animate-spin' : ''}`} />
        </button>
    );
}
