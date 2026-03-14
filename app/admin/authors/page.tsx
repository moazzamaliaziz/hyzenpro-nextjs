'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import Image from 'next/image';

interface Author {
    id: string;
    name: string;
    slug: string;
    role: string | null;
    bio: string | null;
    image: string | null;
    socialLinks: { twitter?: string; linkedin?: string; website?: string } | null;
}

export default function AdminAuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        role: '',
        bio: '',
        image: '',
        twitter: '',
        linkedin: '',
        website: ''
    });

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            const res = await fetch('/api/admin/authors');
            if (res.ok) {
                const data = await res.json();
                setAuthors(data);
            }
        } catch (error) {
            console.error('Failed to fetch authors', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setFormData(prev => ({
            ...prev,
            name: newName,
            slug: !editingAuthor ? generateSlug(newName) : prev.slug
        }));
    };

    const openModal = (author?: Author) => {
        if (author) {
            setEditingAuthor(author);
            setFormData({
                name: author.name,
                slug: author.slug,
                role: author.role || '',
                bio: author.bio || '',
                image: author.image || '',
                twitter: author.socialLinks?.twitter || '',
                linkedin: author.socialLinks?.linkedin || '',
                website: author.socialLinks?.website || ''
            });
        } else {
            setEditingAuthor(null);
            setFormData({ name: '', slug: '', role: '', bio: '', image: '', twitter: '', linkedin: '', website: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            slug: formData.slug,
            role: formData.role,
            bio: formData.bio,
            image: formData.image,
            socialLinks: {
                twitter: formData.twitter,
                linkedin: formData.linkedin,
                website: formData.website
            }
        };

        const url = editingAuthor ? `/api/admin/authors/${editingAuthor.id}` : '/api/admin/authors';
        const method = editingAuthor ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchAuthors();
                setIsModalOpen(false);
            } else {
                const err = await res.text();
                alert(err || 'Failed to save author');
            }
        } catch (error) {
            console.error('Error saving author:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this author? Any associated posts must be reassigned first.')) return;

        try {
            const res = await fetch(`/api/admin/authors/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchAuthors();
            } else {
                const err = await res.text();
                alert(err || 'Failed to delete. Make sure they have no posts assigned.');
            }
        } catch (error) {
            console.error('Error deleting author', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Author Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage blog authors, roles, and biographies.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Author
                </button>
            </div>

            {isLoading ? (
                <div className="h-48 flex items-center justify-center text-gray-500">Loading authors...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {authors.map(author => (
                        <div key={author.id} className="bg-white border border-gray-200 rounded-xl p-6 relative group">
                            <div className="flex items-start gap-4">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                    {author.image ? (
                                        <Image src={author.image} alt={author.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl uppercase">
                                            {author.name.slice(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{author.name}</h3>
                                    <p className="text-sm text-blue-600 truncate">{author.role || 'Contributor'}</p>
                                    <p className="text-xs text-gray-500 truncate mt-1">/{author.slug}</p>
                                </div>
                            </div>
                            
                            <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                                {author.bio || 'No bio provided.'}
                            </p>

                            <div className="mt-6 flex items-center gap-2">
                                <button
                                    onClick={() => openModal(author)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(author.id)}
                                    className="p-2 border border-gray-200 rounded-lg hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors text-gray-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingAuthor ? 'Edit Author' : 'Add New Author'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            
                            {/* Profile Info */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Profile Matrix</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={handleNameChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.slug}
                                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono text-gray-600"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role / Job Title</label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                            placeholder="e.g. AI Analyst"
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                                        <input
                                            type="url"
                                            value={formData.image}
                                            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                                    <textarea
                                        rows={4}
                                        value={formData.bio}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                        placeholder="Write a compelling author biography..."
                                    />
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Social Nexus</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-600 w-20">Twitter</span>
                                        <input
                                            type="url"
                                            value={formData.twitter}
                                            onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                                            placeholder="https://twitter.com/username"
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-600 w-20">LinkedIn</span>
                                        <input
                                            type="url"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                                            placeholder="https://linkedin.com/in/username"
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-600 w-20">Website</span>
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                            placeholder="https://..."
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    {editingAuthor ? 'Save Changes' : 'Create Author'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
