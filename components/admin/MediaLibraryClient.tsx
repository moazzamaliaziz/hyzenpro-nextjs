'use client';

import { ChangeEvent, DragEvent, useDeferredValue, useEffect, useRef, useState, startTransition, useCallback } from 'react';
import { CheckCircle, Copy, FolderOpen, ImagePlus, LayoutGrid, List, Loader2, RefreshCw, Search, ShieldCheck, Sparkles, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { formatBytes } from '@/lib/media';

interface MediaAsset {
    id: string;
    fileName: string;
    originalFileName?: string;
    contentType: string;
    extension: string;
    size: number;
    width: number | null;
    height: number | null;
    title: string | null;
    altText: string | null;
    caption: string | null;
    description: string | null;
    focusKeyword: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    path: string;
    url: string;
    r2Url?: string | null;
    schema: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

interface MediaUsage {
    references: string[];
    canDelete: boolean;
}

interface MetadataFormState {
    title: string;
    altText: string;
    caption: string;
    description: string;
    focusKeyword: string;
    metaTitle: string;
    metaDescription: string;
}

interface UploadItem {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'done' | 'error';
    error?: string;
}

type SortField = 'date' | 'name' | 'size' | 'type';
type SortDir = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';
type FileTypeFilter = 'all' | 'jpg' | 'png' | 'gif' | 'webp';

const emptyMetadata: MetadataFormState = {
    title: '',
    altText: '',
    caption: '',
    description: '',
    focusKeyword: '',
    metaTitle: '',
    metaDescription: '',
};

const TYPE_FILTERS: { label: string; value: FileTypeFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'JPG', value: 'jpg' },
    { label: 'PNG', value: 'png' },
    { label: 'GIF', value: 'gif' },
    { label: 'WebP', value: 'webp' },
];

function formatDateTime(value: string) {
    return new Date(value).toLocaleString();
}

function toMetadataForm(asset: MediaAsset | null): MetadataFormState {
    if (!asset) return emptyMetadata;
    return {
        title: asset.title || '',
        altText: asset.altText || '',
        caption: asset.caption || '',
        description: asset.description || '',
        focusKeyword: asset.focusKeyword || '',
        metaTitle: asset.metaTitle || '',
        metaDescription: asset.metaDescription || '',
    };
}

function buildLiveSchema(asset: MediaAsset, form: MetadataFormState) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: form.metaTitle || form.title || asset.fileName.replace(/\.[^.]+$/, ''),
        description: form.metaDescription || form.description || form.caption || form.altText || undefined,
        caption: form.caption || undefined,
        contentUrl: asset.url,
        url: asset.url,
        encodingFormat: asset.contentType,
        uploadDate: new Date(asset.createdAt).toISOString(),
        width: asset.width || undefined,
        height: asset.height || undefined,
        keywords: form.focusKeyword || undefined,
    };
}

function buildImageSnippet(asset: MediaAsset, form: MetadataFormState) {
    return [
        `<img src="${asset.url}"`,
        `alt="${form.altText || form.title || asset.fileName.replace(/\.[^.]+$/, '')}"`,
        form.title ? `title="${form.title}"` : '',
        asset.width ? `width="${asset.width}"` : '',
        asset.height ? `height="${asset.height}"` : '',
        'loading="lazy"',
        'decoding="async"',
        '/>',
    ]
        .filter(Boolean)
        .join(' ');
}

async function getImageDimensions(file: File) {
    const objectUrl = URL.createObjectURL(file);
    try {
        const image = new window.Image();
        image.decoding = 'async';
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
            image.onerror = () => reject(new Error(`Failed to read ${file.name}`));
            image.src = objectUrl;
        });
        return dimensions;
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export default function MediaLibraryClient() {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [items, setItems] = useState<MediaAsset[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedUsage, setSelectedUsage] = useState<MediaUsage | null>(null);
    const [metadata, setMetadata] = useState<MetadataFormState>(emptyMetadata);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploadConfig, setUploadConfig] = useState({ maxSizeLabel: '4 MB', accept: 'image/jpeg,image/png,image/webp,image/avif,image/gif' });

    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [typeFilter, setTypeFilter] = useState<FileTypeFilter>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const deferredSearch = useDeferredValue(search);
    const selectedAsset = items.find((item) => item.id === selectedId) || null;

    const setMessage = (message: string) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 2500);
    };

    const loadMedia = async (searchTerm = '') => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            if (typeFilter !== 'all') params.set('type', typeFilter);
            params.set('sortField', sortField);
            params.set('sortDir', sortDir);
            const qs = params.toString();
            const response = await fetch(`/api/admin/media${qs ? '?' + qs : ''}`, { credentials: 'include' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load the media library.');
            setItems(data.items || []);
            if (data.upload) setUploadConfig(data.upload);
            if (data.items?.length) {
                const activeId = data.items.some((item: MediaAsset) => item.id === selectedId)
                    ? selectedId : data.items[0].id;
                startTransition(() => setSelectedId(activeId));
            } else {
                setSelectedId(null);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load the media library.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void loadMedia(deferredSearch); }, [deferredSearch, sortField, sortDir, typeFilter]);

    useEffect(() => { setMetadata(toMetadataForm(selectedAsset)); }, [selectedAsset]);

    useEffect(() => {
        if (!selectedId) { setSelectedUsage(null); return; }
        let canceled = false;
        async function loadDetails() {
            try {
                const response = await fetch(`/api/admin/media/${selectedId}`, { credentials: 'include' });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to load media details.');
                if (canceled) return;
                setSelectedUsage(data.usage || null);
                setMetadata(toMetadataForm(data.item));
                setItems((currentItems) => currentItems.map((item) => (item.id === data.item.id ? data.item : item)));
            } catch (err: any) {
                if (!canceled) setError(err.message || 'Failed to load media details.');
            }
        }
        void loadDetails();
        return () => { canceled = true; };
    }, [selectedId]);

    const copyToClipboard = useCallback(async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const selectAll = useCallback(() => setSelectedIds(new Set(items.map((a) => a.id))), [items]);
    const deselectAll = useCallback(() => setSelectedIds(new Set()), []);

    const allSelected = items.length > 0 && selectedIds.size === items.length;

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.size} selected image${selectedIds.size > 1 ? 's' : ''}?`)) return;
        setDeleting(true);
        setError('');
        try {
            const response = await fetch('/api/admin/media/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Bulk delete failed.');
            setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
            setSelectedId(null);
            setSelectedIds(new Set());
            setMessage(`${selectedIds.size} image${selectedIds.size > 1 ? 's' : ''} deleted.`);
        } catch (err: any) {
            setError(err.message || 'Bulk delete failed.');
        } finally {
            setDeleting(false);
        }
    };

    async function uploadFiles(fileList: FileList | File[]) {
        const files = Array.from(fileList);
        if (!files.length) return;
        setUploading(true);
        setError('');

        const queue: UploadItem[] = files.map((file) => ({ file, progress: 0, status: 'pending' }));
        setUploadQueue((prev) => [...prev, ...queue]);

        const uploadedItems: MediaAsset[] = [];

        for (let i = 0; i < files.length; i++) {
            setUploadQueue((prev) => prev.map((item, idx) =>
                item.file === files[i] ? { ...item, status: 'uploading' as const, progress: 10 } : item
            ));

            try {
                const { width, height } = await getImageDimensions(files[i]);
                const formData = new FormData();
                formData.append('file', files[i]);
                formData.append('width', String(width));
                formData.append('height', String(height));

                const response = await fetch('/api/admin/media', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });
                const data = await response.json();
                if (!response.ok) throw new Error(`${files[i].name}: ${data.error || 'Upload failed.'}`);
                uploadedItems.unshift(data.item);

                setUploadQueue((prev) => prev.map((item) =>
                    item.file === files[i] ? { ...item, status: 'done' as const, progress: 100 } : item
                ));
            } catch (err: any) {
                setUploadQueue((prev) => prev.map((item) =>
                    item.file === files[i] ? { ...item, status: 'error' as const, error: String(err.message || err) } : item
                ));
            }
        }

        setItems((currentItems) => [...uploadedItems, ...currentItems]);
        if (uploadedItems[0]) startTransition(() => setSelectedId(uploadedItems[0].id));
        setMessage(`${uploadedItems.length} image${uploadedItems.length === 1 ? '' : 's'} uploaded successfully.`);
        setUploading(false);
        setTimeout(() => setUploadQueue((prev) => prev.filter((q) => q.status === 'uploading')), 3000);
        if (inputRef.current) inputRef.current.value = '';
    }

    const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.length) await uploadFiles(event.target.files);
    };

    const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
        if (event.dataTransfer.files?.length) await uploadFiles(event.dataTransfer.files);
    };

    const handleSaveMetadata = async () => {
        if (!selectedAsset) return;
        setSaving(true);
        setError('');
        try {
            const response = await fetch(`/api/admin/media/${selectedAsset.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metadata),
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save metadata.');
            setItems((currentItems) => currentItems.map((item) => (item.id === data.item.id ? data.item : item)));
            setMetadata(toMetadataForm(data.item));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to save metadata.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedAsset || !confirm('Delete this image from the media library?')) return;
        setDeleting(true);
        setError('');
        try {
            const response = await fetch(`/api/admin/media/${selectedAsset.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) {
                const detail = data.usage?.references?.length ? ` In use: ${data.usage.references.join(', ')}.` : '';
                throw new Error((data.error || 'Delete failed.') + detail);
            }
            const remainingItems = items.filter((item) => item.id !== selectedAsset.id);
            setItems(remainingItems);
            setSelectedId(remainingItems[0]?.id || null);
            setMessage('Image deleted from the library.');
        } catch (err: any) {
            setError(err.message || 'Failed to delete image.');
        } finally {
            setDeleting(false);
        }
    };

    const liveSchema = selectedAsset ? buildLiveSchema(selectedAsset, metadata) : null;
    const liveImageSnippet = selectedAsset ? buildImageSnippet(selectedAsset, metadata) : '';

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Free Media Library
                    </div>
                    <h1 className="font-heading text-4xl text-white">Admin Media</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
                        Upload images once, get a permanent HyzenPro URL, and manage alt text, captions, SEO fields,
                        and ImageObject schema without paying for a separate media service.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void loadMedia(deferredSearch)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Library
                </button>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
            )}
            {success && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>
            )}

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_380px]">
                <section className="space-y-6">
                    <div
                        onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(event) => void handleDrop(event)}
                        className={`rounded-3xl border p-6 transition-colors ${dragActive ? 'border-accent/40 bg-accent/10' : 'border-white/10 bg-white/[0.03]'}`}
                    >
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                                    <UploadCloud className="h-7 w-7" />
                                </div>
                                <div>
                                    <h2 className="font-heading text-2xl text-white">Upload Images</h2>
                                    <p className="mt-2 text-sm leading-6 text-white/50">
                                        Drag images here or pick files from your device. Supported: JPG, PNG, WebP, AVIF, GIF. Max {uploadConfig.maxSizeLabel}. Images are auto-compressed on upload.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <input ref={inputRef} type="file" accept={uploadConfig.accept} multiple onChange={(event) => void handleFileInput(event)} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    disabled={uploading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                                    {uploading ? 'Uploading...' : 'Choose Images'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid area with drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={(e) => { if ((e.target as HTMLElement).parentElement === e.currentTarget) setDragActive(false); }}
                        onDrop={(event) => void handleDrop(event)}
                        className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                    >
                        {dragActive && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-black/60 backdrop-blur-sm pointer-events-none">
                                <div className="text-center">
                                    <UploadCloud className="w-12 h-12 text-accent mx-auto mb-3" />
                                    <p className="text-lg font-medium text-white">Drop images to upload</p>
                                    <p className="text-sm text-white/50">PNG, JPG, WebP, GIF supported</p>
                                </div>
                            </div>
                        )}

                        {/* Toolbar: search + sort + view toggle */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative w-full md:max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search titles, alt text, captions, keywords..."
                                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-accent/40 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/35">
                                <span>{items.length} assets loaded</span>
                                <select
                                    value={`${sortField}:${sortDir}`}
                                    onChange={(e) => {
                                        const [f, d] = e.target.value.split(':') as [SortField, SortDir];
                                        setSortField(f);
                                        setSortDir(d);
                                    }}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70"
                                >
                                    <option value="date:desc">Newest First</option>
                                    <option value="date:asc">Oldest First</option>
                                    <option value="name:asc">Name A–Z</option>
                                    <option value="name:desc">Name Z–A</option>
                                    <option value="size:desc">Largest First</option>
                                    <option value="size:asc">Smallest First</option>
                                </select>
                                <div className="flex items-center gap-1 border border-white/10 rounded-lg p-1">
                                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                                        <List className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filter pills */}
                        <div className="flex items-center gap-1 flex-wrap mt-3">
                            {TYPE_FILTERS.map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setTypeFilter(f.value)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        typeFilter === f.value ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Bulk action bar */}
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl mt-4">
                                <button onClick={allSelected ? deselectAll : selectAll} className="text-xs text-white/60 hover:text-white">
                                    {allSelected ? 'Deselect All' : 'Select All'}
                                </button>
                                <span className="text-xs text-white/40">{selectedIds.size} selected</span>
                                <div className="ml-auto flex gap-2">
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={deleting}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition disabled:opacity-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete {selectedIds.size}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        {loading ? (
                            <div className="flex min-h-[280px] items-center justify-center mt-6">
                                <Loader2 className="h-8 w-8 animate-spin text-white/30" />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 text-center mt-6">
                                <FolderOpen className="mb-4 h-10 w-10 text-white/25" />
                                <h3 className="text-lg font-semibold text-white">No images yet</h3>
                                <p className="mt-2 max-w-md text-sm text-white/45">
                                    Upload your first image and this library will generate a reusable site URL plus SEO-ready metadata fields for it.
                                </p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`overflow-hidden rounded-2xl border text-left transition-all cursor-pointer ${
                                            selectedId === item.id
                                                ? 'border-accent/50 bg-accent/10 shadow-[0_0_0_1px_rgba(24,242,255,0.18)]'
                                                : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]'
                                        }`}
                                        onClick={() => startTransition(() => setSelectedId(item.id))}
                                    >
                                        <div className="aspect-[4/3] w-full overflow-hidden bg-white/5">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.url}
                                                alt={item.altText || item.title || item.fileName}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    const img = e.currentTarget;
                                                    const path = item.path || `/media/${item.id}/${item.fileName}`;
                                                    if (img.src !== path) img.src = path;
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-3 p-4">
                                            <div className="flex items-start gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="mt-1 rounded accent-accent"
                                                />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-white">
                                                        {item.title || item.fileName}
                                                    </div>
                                                    <div className="mt-1 truncate text-xs text-white/40">{item.fileName}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-[11px] text-white/40">
                                                <span className="rounded-full border border-white/10 px-2 py-1">{item.extension.toUpperCase()}</span>
                                                <span className="rounded-full border border-white/10 px-2 py-1">{formatBytes(item.size)}</span>
                                                {item.width && item.height && (
                                                    <span className="rounded-full border border-white/10 px-2 py-1">{item.width} x {item.height}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 divide-y divide-white/5">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center gap-4 px-4 py-3 hover:bg-white/5 cursor-pointer transition ${selectedId === item.id ? 'bg-white/10' : ''}`}
                                        onClick={() => startTransition(() => setSelectedId(item.id))}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="rounded accent-accent shrink-0"
                                        />
                                        <div className="w-10 h-10 rounded overflow-hidden bg-white/5 shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{item.title || item.fileName}</p>
                                            <p className="text-xs text-white/40 truncate">{item.fileName}</p>
                                        </div>
                                        <span className="text-xs text-white/30 w-20 text-right">{item.extension.toUpperCase()}</span>
                                        <span className="text-xs text-white/30 w-16 text-right">{formatBytes(item.size)}</span>
                                        <span className="text-xs text-white/30 w-24 text-right">
                                            {item.width && item.height ? `${item.width}—${item.height}` : '—'}
                                        </span>
                                        <span className="text-xs text-white/30 w-28 text-right">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <aside className="space-y-6">
                    {!selectedAsset ? (
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white/50">
                            Select an uploaded image to edit SEO fields, copy the URL, or grab schema markup.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                                <div className="aspect-[4/3] bg-black/30">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={selectedAsset.url}
                                        alt={metadata.altText || metadata.title || selectedAsset.fileName}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            const img = e.currentTarget;
                                            const path = selectedAsset.path || `/media/${selectedAsset.id}/${selectedAsset.fileName}`;
                                            if (img.src !== path) img.src = path;
                                        }}
                                    />
                                </div>
                                <div className="space-y-4 p-5">
                                    <div>
                                        <div className="text-lg font-semibold text-white">
                                            {metadata.title || selectedAsset.fileName}
                                        </div>
                                        <div className="mt-1 text-xs text-white/40">
                                            Uploaded {formatDateTime(selectedAsset.createdAt)}
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(selectedAsset.r2Url || selectedAsset.url, `url-${selectedAsset.id}`)}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.04] hover:text-white"
                                        >
                                            {copiedId === `url-${selectedAsset.id}` ? (
                                                <><CheckCircle className="h-4 w-4 text-green-400" /> Copied!</>
                                            ) : (
                                                <><Copy className="h-4 w-4" /> Copy URL</>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(selectedAsset.path || `/media/${selectedAsset.id}/${selectedAsset.fileName}`, `path-${selectedAsset.id}`)}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.04] hover:text-white"
                                        >
                                            {copiedId === `path-${selectedAsset.id}` ? (
                                                <><CheckCircle className="h-4 w-4 text-green-400" /> Copied!</>
                                            ) : (
                                                <><Copy className="h-4 w-4" /> Copy Path</>
                                            )}
                                        </button>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/50">
                                        <div className="mb-2 font-semibold uppercase tracking-[0.18em] text-white/35">File facts</div>
                                        <div>{selectedAsset.fileName}</div>
                                        <div>{selectedAsset.contentType}</div>
                                        <div>{formatBytes(selectedAsset.size)}</div>
                                        {selectedAsset.width && selectedAsset.height && (
                                            <div>{selectedAsset.width} x {selectedAsset.height}px</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="font-heading text-xl text-white">SEO Metadata</h2>
                                    <button
                                        type="button"
                                        onClick={handleSaveMetadata}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        ['title', 'Title', 'text'] as const,
                                        ['altText', 'Alt Text', 'text'] as const,
                                        ['caption', 'Caption', 'text'] as const,
                                        ['focusKeyword', 'Focus Keyword', 'text'] as const,
                                        ['metaTitle', 'Meta Title', 'text'] as const,
                                    ].map(([key, label, type]) => (
                                        <label className="block" key={key}>
                                            <span className="mb-1.5 block text-sm text-white/60">{label}</span>
                                            <input
                                                type={type}
                                                value={metadata[key]}
                                                onChange={(event) => setMetadata({ ...metadata, [key]: event.target.value })}
                                                onBlur={handleSaveMetadata}
                                                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-accent/40 focus:outline-none"
                                                placeholder={`${label.toLowerCase()} for SEO`}
                                            />
                                        </label>
                                    ))}
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm text-white/60">Description</span>
                                        <textarea
                                            rows={3}
                                            value={metadata.description}
                                            onChange={(event) => setMetadata({ ...metadata, description: event.target.value })}
                                            onBlur={handleSaveMetadata}
                                            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-accent/40 focus:outline-none"
                                            placeholder="Image description for SEO"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm text-white/60">Meta Description</span>
                                        <textarea
                                            rows={3}
                                            value={metadata.metaDescription}
                                            onChange={(event) => setMetadata({ ...metadata, metaDescription: event.target.value })}
                                            onBlur={handleSaveMetadata}
                                            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-accent/40 focus:outline-none"
                                            placeholder="Meta description for search engines"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="font-heading text-xl text-white">Schema + Embed</h2>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(JSON.stringify(liveSchema, null, 2), `schema-${selectedAsset.id}`)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/[0.04] hover:text-white"
                                        >
                                            {copiedId === `schema-${selectedAsset.id}` ? (
                                                <><CheckCircle className="h-3.5 w-3.5 text-green-400" /> Copied!</>
                                            ) : (
                                                <><Copy className="h-3.5 w-3.5" /> Copy Schema</>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(liveImageSnippet, `html-${selectedAsset.id}`)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/[0.04] hover:text-white"
                                        >
                                            {copiedId === `html-${selectedAsset.id}` ? (
                                                <><CheckCircle className="h-3.5 w-3.5 text-green-400" /> Copied!</>
                                            ) : (
                                                <><Copy className="h-3.5 w-3.5" /> Copy HTML</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Image HTML</div>
                                        <textarea readOnly rows={4} value={liveImageSnippet} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/75 focus:outline-none" />
                                    </div>
                                    <div>
                                        <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">ImageObject JSON-LD</div>
                                        <textarea readOnly rows={10} value={JSON.stringify(liveSchema, null, 2)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-white/75 focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="mb-3 text-sm font-semibold text-white">Usage Guard</div>
                                <p className="mb-4 text-sm text-white/50">
                                    Delete is blocked automatically if this image is already being used in posts, tools, authors, or editable site content.
                                </p>
                                {selectedUsage?.references?.length ? (
                                    <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                                        {selectedUsage.references.join(' • ')}
                                    </div>
                                ) : (
                                    <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                        No current references found.
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting || Boolean(selectedUsage && !selectedUsage.canDelete)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    {deleting ? 'Deleting...' : 'Delete Image'}
                                </button>
                            </div>
                        </>
                    )}
                </aside>
            </div>

            {/* Upload progress notifications */}
            {uploadQueue.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50 w-80 space-y-2">
                    {uploadQueue.map((queueItem, i) => (
                        <div key={i} className="bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-white/70 truncate max-w-[200px]">{queueItem.file.name}</span>
                                {queueItem.status === 'done' && <CheckCircle className="w-4 h-4 text-green-400" />}
                                {queueItem.status === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        queueItem.status === 'error' ? 'bg-red-500' :
                                        queueItem.status === 'done' ? 'bg-green-500' : 'bg-accent'
                                    }`}
                                    style={{ width: `${queueItem.progress}%` }}
                                />
                            </div>
                            {queueItem.error && (
                                <p className="text-xs text-red-400 mt-1 truncate">{queueItem.error}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}