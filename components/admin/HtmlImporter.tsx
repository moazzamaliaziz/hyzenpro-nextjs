'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Check, AlertCircle, X, Link, Image, Heading } from 'lucide-react';

interface ImportResult {
    title: string;
    content: string;
    excerpt: string;
    featuredImage: string;
    headings: Array<{ level: number; text: string; id: string }>;
    links: Array<{ text: string; href: string; isInternal: boolean }>;
    images: Array<{ src: string; alt: string }>;
    metadata: Record<string, string>;
}

interface HtmlImporterProps {
    onImport: (data: {
        title: string;
        content: string;
        excerpt: string;
        featuredImage: string;
    }) => void;
}

export default function HtmlImporter({ onImport }: HtmlImporterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<ImportResult | null>(null);
    const [url, setUrl] = useState('');
    const [pasteMode, setPasteMode] = useState<'file' | 'url' | 'paste'>('file');
    const [pasteHtml, setPasteHtml] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        setLoading(true);
        setError('');
        try {
            const html = await file.text();
            await parseHtml(html);
        } catch {
            setError('Failed to read file');
        } finally {
            setLoading(false);
        }
    };

    const handleUrlFetch = async () => {
        if (!url) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(url);
            const html = await res.text();
            await parseHtml(html);
        } catch {
            setError('Failed to fetch URL');
        } finally {
            setLoading(false);
        }
    };

    const handlePasteImport = async () => {
        if (!pasteHtml.trim()) return;
        setLoading(true);
        setError('');
        try {
            await parseHtml(pasteHtml);
        } catch {
            setError('Failed to parse HTML');
        } finally {
            setLoading(false);
        }
    };

    const parseHtml = async (html: string) => {
        const res = await fetch('/api/posts/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html, url: url || undefined }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Import failed');
        }

        const data: ImportResult = await res.json();
        setResult(data);
    };

    const handleApply = () => {
        if (!result) return;
        onImport({
            title: result.title,
            content: result.content,
            excerpt: result.excerpt,
            featuredImage: result.featuredImage,
        });
        setIsOpen(false);
        setResult(null);
    };

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors text-sm"
            >
                <Upload className="w-4 h-4" /> Import HTML
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="font-heading text-xl text-white">Import HTML Content</h2>
                    <button onClick={() => { setIsOpen(false); setResult(null); }} className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Mode tabs */}
                    <div className="flex gap-2">
                        {(['file', 'url', 'paste'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setPasteMode(mode)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pasteMode === mode
                                    ? 'bg-accent/10 text-accent border border-accent/20'
                                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                {mode === 'file' ? 'Upload File' : mode === 'url' ? 'Fetch URL' : 'Paste HTML'}
                            </button>
                        ))}
                    </div>

                    {/* File upload mode */}
                    {pasteMode === 'file' && (
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-accent/30 hover:bg-accent/5 transition-all"
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".html,.htm"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            />
                            <FileText className="w-10 h-10 mx-auto mb-3 text-white/20" />
                            <p className="text-white/60 text-sm">Click to upload an HTML file</p>
                            <p className="text-white/30 text-xs mt-1">.html or .htm files</p>
                        </div>
                    )}

                    {/* URL mode */}
                    {pasteMode === 'url' && (
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/article"
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none"
                            />
                            <button
                                onClick={handleUrlFetch}
                                disabled={loading || !url}
                                className="px-6 py-2.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
                            </button>
                        </div>
                    )}

                    {/* Paste mode */}
                    {pasteMode === 'paste' && (
                        <div className="space-y-3">
                            <textarea
                                value={pasteHtml}
                                onChange={(e) => setPasteHtml(e.target.value)}
                                rows={8}
                                placeholder="Paste your HTML content here..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:border-accent/50 focus:outline-none resize-none"
                            />
                            <button
                                onClick={handlePasteImport}
                                disabled={loading || !pasteHtml.trim()}
                                className="px-6 py-2.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Parse HTML'}
                            </button>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
                            <p className="text-white/40 text-sm mt-2">Parsing HTML content...</p>
                        </div>
                    )}

                    {/* Result preview */}
                    {result && !loading && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                <Check className="w-4 h-4" /> Content parsed successfully
                            </div>

                            {/* Title */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Title</label>
                                <p className="text-white font-medium">{result.title || 'No title found'}</p>
                            </div>

                            {/* Excerpt */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Excerpt</label>
                                <p className="text-white/70 text-sm">{result.excerpt || 'No excerpt found'}</p>
                            </div>

                            {/* Featured Image */}
                            {result.featuredImage && (
                                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block flex items-center gap-1">
                                        <Image className="w-3 h-3" /> Featured Image
                                    </label>
                                    <p className="text-white/70 text-sm truncate">{result.featuredImage}</p>
                                </div>
                            )}

                            {/* Headings */}
                            {result.headings.length > 0 && (
                                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                        <Heading className="w-3 h-3" /> Headings ({result.headings.length})
                                    </label>
                                    <div className="space-y-1">
                                        {result.headings.slice(0, 8).map((h, i) => (
                                            <p key={i} className="text-white/60 text-sm" style={{ paddingLeft: `${(h.level - 1) * 16}px` }}>
                                                H{h.level}: {h.text}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Links */}
                            {result.links.length > 0 && (
                                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                        <Link className="w-3 h-3" /> Links ({result.links.length})
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">
                                            {result.links.filter(l => l.isInternal).length} internal
                                        </span>
                                        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded text-xs">
                                            {result.links.filter(l => !l.isInternal).length} external
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Content preview */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Content Preview</label>
                                <div
                                    className="text-white/60 text-sm max-h-40 overflow-y-auto prose prose-invert prose-sm"
                                    dangerouslySetInnerHTML={{ __html: result.content.slice(0, 2000) + (result.content.length > 2000 ? '...' : '') }}
                                />
                            </div>

                            {/* Apply button */}
                            <button
                                onClick={handleApply}
                                className="w-full py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors"
                            >
                                Apply to Editor
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
