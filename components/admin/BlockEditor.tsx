'use client';

import { useState, useRef, useCallback } from 'react';
import {
    Plus, GripVertical, Trash2, Copy, ChevronUp, ChevronDown,
    Type, Image, Code, Quote, List, Table, Minus, Heading1, Heading2, Heading3,
    Youtube, Layout, AlertTriangle
} from 'lucide-react';

export interface Block {
    id: string;
    type: 'paragraph' | 'heading' | 'image' | 'code' | 'quote' | 'list' | 'table' | 'separator' | 'button' | 'video' | 'callout' | 'html';
    content: string;
    level?: number; // for headings
    language?: string; // for code
    items?: string[]; // for lists
    src?: string; // for images/videos
    alt?: string; // for images
    caption?: string; // for images
    style?: 'info' | 'warning' | 'tip' | 'danger'; // for callouts
    href?: string; // for buttons
    buttonText?: string; // for buttons
    alignment?: 'left' | 'center' | 'right';
}

const BLOCK_TYPES = [
    { type: 'paragraph', label: 'Paragraph', icon: Type },
    { type: 'heading', label: 'Heading', icon: Heading1 },
    { type: 'image', label: 'Image', icon: Image },
    { type: 'code', label: 'Code', icon: Code },
    { type: 'quote', label: 'Quote', icon: Quote },
    { type: 'list', label: 'List', icon: List },
    { type: 'table', label: 'Table', icon: Table },
    { type: 'separator', label: 'Separator', icon: Minus },
    { type: 'button', label: 'Button', icon: Layout },
    { type: 'video', label: 'Video', icon: Youtube },
    { type: 'callout', label: 'Callout', icon: AlertTriangle },
    { type: 'html', label: 'HTML', icon: Code },
] as const;

function generateId() {
    return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (blocks: Block[]) => void }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showInserter, setShowInserter] = useState(false);
    const [insertIndex, setInsertIndex] = useState<number>(0);

    const addBlock = useCallback((type: Block['type'], index?: number) => {
        const newBlock: Block = {
            id: generateId(),
            type,
            content: '',
            ...(type === 'heading' ? { level: 2 } : {}),
            ...(type === 'list' ? { items: [''] } : {}),
            ...(type === 'callout' ? { style: 'info' } : {}),
        };
        const idx = index !== undefined ? index : blocks.length;
        const updated = [...blocks];
        updated.splice(idx, 0, newBlock);
        onChange(updated);
        setSelectedId(newBlock.id);
        setShowInserter(false);
    }, [blocks, onChange]);

    const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
        onChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    }, [blocks, onChange]);

    const deleteBlock = useCallback((id: string) => {
        onChange(blocks.filter(b => b.id !== id));
        if (selectedId === id) setSelectedId(null);
    }, [blocks, onChange, selectedId]);

    const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
        const idx = blocks.findIndex(b => b.id === id);
        if (idx === -1) return;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= blocks.length) return;
        const updated = [...blocks];
        [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
        onChange(updated);
    }, [blocks, onChange]);

    const duplicateBlock = useCallback((id: string) => {
        const block = blocks.find(b => b.id === id);
        if (!block) return;
        const idx = blocks.findIndex(b => b.id === id);
        const newBlock = { ...block, id: generateId() };
        const updated = [...blocks];
        updated.splice(idx + 1, 0, newBlock);
        onChange(updated);
    }, [blocks, onChange]);

    return (
        <div className="space-y-2">
            {/* Block list */}
            {blocks.map((block, index) => (
                <div
                    key={block.id}
                    className={`group relative border rounded-xl transition-all ${selectedId === block.id
                        ? 'border-accent/50 bg-accent/5'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
                        }`}
                    onClick={() => setSelectedId(block.id)}
                >
                    {/* Block toolbar */}
                    <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.04]">
                        <GripVertical className="w-4 h-4 text-white/20 cursor-grab" />
                        <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
                            {block.type}
                            {block.type === 'heading' && block.level ? ` H${block.level}` : ''}
                        </span>
                        <div className="flex-1" />
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                            className="p-1 text-white/20 hover:text-white/60 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronUp className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                            className="p-1 text-white/20 hover:text-white/60 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
                            className="p-1 text-white/20 hover:text-white/60 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                            className="p-1 text-white/20 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Block content */}
                    <div className="p-3">
                        <BlockContent block={block} onChange={(updates) => updateBlock(block.id, updates)} />
                    </div>
                </div>
            ))}

            {/* Add block button */}
            <div className="relative">
                <button
                    onClick={() => { setInsertIndex(blocks.length); setShowInserter(!showInserter); }}
                    className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-white/30 text-sm hover:border-accent/30 hover:text-accent/60 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Block
                </button>

                {/* Block inserter */}
                {showInserter && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-950 border border-white/10 rounded-xl p-3 z-20 shadow-xl">
                        <div className="grid grid-cols-4 gap-2">
                            {BLOCK_TYPES.map(bt => (
                                <button
                                    key={bt.type}
                                    onClick={() => addBlock(bt.type as Block['type'], insertIndex)}
                                    className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <bt.icon className="w-5 h-5 text-white/40" />
                                    <span className="text-[10px] text-white/40">{bt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function BlockContent({ block, onChange }: { block: Block; onChange: (updates: Partial<Block>) => void }) {
    switch (block.type) {
        case 'paragraph':
            return (
                <textarea
                    value={block.content}
                    onChange={(e) => onChange({ content: e.target.value })}
                    rows={3}
                    placeholder="Write your paragraph..."
                    className="w-full bg-transparent text-white/80 text-sm leading-relaxed resize-none focus:outline-none placeholder:text-white/20"
                />
            );

        case 'heading':
            return (
                <div className="flex items-center gap-2">
                    <select
                        value={block.level || 2}
                        onChange={(e) => onChange({ level: parseInt(e.target.value) })}
                        className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                    >
                        <option value={1}>H1</option>
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                        <option value={4}>H4</option>
                        <option value={5}>H5</option>
                    </select>
                    <input
                        type="text"
                        value={block.content}
                        onChange={(e) => onChange({ content: e.target.value })}
                        placeholder="Heading text..."
                        className="flex-1 bg-transparent text-white font-heading text-lg focus:outline-none placeholder:text-white/20"
                    />
                </div>
            );

        case 'image':
            return (
                <div className="space-y-2">
                    <input
                        type="url"
                        value={block.src || ''}
                        onChange={(e) => onChange({ src: e.target.value })}
                        placeholder="Image URL..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={block.alt || ''}
                        onChange={(e) => onChange({ alt: e.target.value })}
                        placeholder="Alt text..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none"
                    />
                    {block.src && (
                        <img src={block.src} alt={block.alt || ''} className="max-h-48 rounded-lg object-cover" />
                    )}
                </div>
            );

        case 'code':
            return (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={block.language || ''}
                        onChange={(e) => onChange({ language: e.target.value })}
                        placeholder="Language (e.g., javascript, python)..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-accent/50 focus:outline-none"
                    />
                    <textarea
                        value={block.content}
                        onChange={(e) => onChange({ content: e.target.value })}
                        rows={6}
                        placeholder="Code..."
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-green-400 text-xs font-mono focus:outline-none resize-none"
                    />
                </div>
            );

        case 'quote':
            return (
                <div className="border-l-4 border-accent/50 pl-4 space-y-2">
                    <textarea
                        value={block.content}
                        onChange={(e) => onChange({ content: e.target.value })}
                        rows={2}
                        placeholder="Quote text..."
                        className="w-full bg-transparent text-white/70 italic text-sm resize-none focus:outline-none placeholder:text-white/20"
                    />
                    <input
                        type="text"
                        value={block.caption || ''}
                        onChange={(e) => onChange({ caption: e.target.value })}
                        placeholder="— Attribution"
                        className="w-full bg-transparent text-white/40 text-xs focus:outline-none placeholder:text-white/20"
                    />
                </div>
            );

        case 'list':
            return (
                <div className="space-y-1">
                    {(block.items || ['']).map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-white/30 text-sm">•</span>
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                    const items = [...(block.items || [])];
                                    items[i] = e.target.value;
                                    onChange({ items });
                                }}
                                placeholder="List item..."
                                className="flex-1 bg-transparent text-white/80 text-sm focus:outline-none placeholder:text-white/20"
                            />
                            <button
                                onClick={() => {
                                    const items = [...(block.items || [])];
                                    items.splice(i, 1);
                                    onChange({ items });
                                }}
                                className="p-1 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => onChange({ items: [...(block.items || []), ''] })}
                        className="text-xs text-accent/60 hover:text-accent mt-1"
                    >
                        + Add item
                    </button>
                </div>
            );

        case 'separator':
            return <hr className="border-white/10 my-2" />;

        case 'button':
            return (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={block.buttonText || ''}
                        onChange={(e) => onChange({ buttonText: e.target.value })}
                        placeholder="Button text..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none"
                    />
                    <input
                        type="url"
                        value={block.href || ''}
                        onChange={(e) => onChange({ href: e.target.value })}
                        placeholder="Button URL..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none"
                    />
                    <select
                        value={block.alignment || 'left'}
                        onChange={(e) => onChange({ alignment: e.target.value as any })}
                        className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                    >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </div>
            );

        case 'video':
            return (
                <input
                    type="url"
                    value={block.src || ''}
                    onChange={(e) => onChange({ src: e.target.value })}
                    placeholder="YouTube or video URL..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none"
                />
            );

        case 'callout':
            return (
                <div className="space-y-2">
                    <select
                        value={block.style || 'info'}
                        onChange={(e) => onChange({ style: e.target.value as any })}
                        className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                    >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="tip">Tip</option>
                        <option value="danger">Danger</option>
                    </select>
                    <textarea
                        value={block.content}
                        onChange={(e) => onChange({ content: e.target.value })}
                        rows={2}
                        placeholder="Callout text..."
                        className="w-full bg-transparent text-white/80 text-sm resize-none focus:outline-none placeholder:text-white/20"
                    />
                </div>
            );

        case 'html':
            return (
                <textarea
                    value={block.content}
                    onChange={(e) => onChange({ content: e.target.value })}
                    rows={4}
                    placeholder="Raw HTML..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-green-400 text-xs font-mono focus:outline-none resize-none"
                />
            );

        default:
            return <p className="text-white/30 text-sm">Unknown block type</p>;
    }
}

export function blocksToHtml(blocks: Block[]): string {
    return blocks.map(block => {
        switch (block.type) {
            case 'paragraph':
                return `<p>${block.content}</p>`;
            case 'heading':
                return `<h${block.level || 2}>${block.content}</h${block.level || 2}>`;
            case 'image':
                return `<figure><img src="${block.src || ''}" alt="${block.alt || ''}" />${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}</figure>`;
            case 'code':
                return `<pre><code class="language-${block.language || ''}">${block.content}</code></pre>`;
            case 'quote':
                return `<blockquote><p>${block.content}</p>${block.caption ? `<footer>${block.caption}</footer>` : ''}</blockquote>`;
            case 'list':
                return `<ul>${(block.items || []).map(item => `<li>${item}</li>`).join('')}</ul>`;
            case 'separator':
                return '<hr />';
            case 'button':
                return `<div style="text-align: ${block.alignment || 'left'}"><a href="${block.href || '#'}" class="button">${block.buttonText || 'Click here'}</a></div>`;
            case 'video':
                return `<div class="video-embed"><iframe src="${block.src || ''}" allowfullscreen></iframe></div>`;
            case 'callout':
                return `<div class="callout callout-${block.style || 'info'}">${block.content}</div>`;
            case 'html':
                return block.content;
            default:
                return '';
        }
    }).join('\n');
}

export function htmlToBlocks(html: string): Block[] {
    const blocks: Block[] = [];
    const div = document.createElement('div');
    div.innerHTML = html;

    const processElement = (el: Element) => {
        const tag = el.tagName.toLowerCase();

        if (tag === 'p') {
            blocks.push({ id: generateId(), type: 'paragraph', content: el.innerHTML });
        } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
            blocks.push({ id: generateId(), type: 'heading', content: el.textContent || '', level: parseInt(tag.charAt(1)) });
        } else if (tag === 'img') {
            blocks.push({ id: generateId(), type: 'image', content: '', src: el.getAttribute('src') || '', alt: el.getAttribute('alt') || '' });
        } else if (tag === 'pre') {
            const code = el.querySelector('code');
            const lang = code?.className?.replace('language-', '') || '';
            blocks.push({ id: generateId(), type: 'code', content: code?.textContent || '', language: lang });
        } else if (tag === 'blockquote') {
            blocks.push({ id: generateId(), type: 'quote', content: el.textContent || '' });
        } else if (tag === 'ul' || tag === 'ol') {
            const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '');
            blocks.push({ id: generateId(), type: 'list', content: '', items });
        } else if (tag === 'hr') {
            blocks.push({ id: generateId(), type: 'separator', content: '' });
        } else {
            // Process children
            Array.from(el.children).forEach(processElement);
        }
    };

    Array.from(div.children).forEach(processElement);
    return blocks;
}

export default BlockEditor;
