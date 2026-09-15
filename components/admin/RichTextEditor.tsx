'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { useCallback, useEffect, useState } from 'react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3, Heading4,
    List, ListOrdered, Quote, Code, CodeSquare,
    Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
    Table as TableIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Undo, Redo, Minus, Highlighter, Type, Pilcrow, ListChecks,
    Plus, Trash2, RowsIcon, Columns, ArrowUp, ArrowDown,
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const [showSource, setShowSource] = useState(false);
    const [showTableMenu, setShowTableMenu] = useState(false);
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                codeBlock: { HTMLAttributes: { class: 'hljs' } },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-accent underline', rel: 'noopener noreferrer' },
            }),
            Image.configure({
                HTMLAttributes: { class: 'rounded-lg max-w-full my-4' },
            }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({
                placeholder: placeholder || 'Start writing your content...',
            }),
            CharacterCount,
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            Youtube.configure({
                HTMLAttributes: { class: 'rounded-xl overflow-hidden my-6' },
                width: 640,
                height: 360,
            }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'admin-rich-text-editor min-h-[400px] p-6 max-w-none outline-none',
            },
        },
    });

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', false);
        }
    }, [value]);

    const insertLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = prompt('Enter URL:', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const insertImage = useCallback(() => {
        if (!editor) return;
        const url = prompt('Enter Image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const insertYoutube = useCallback(() => {
        if (!editor) return;
        const url = prompt('Enter YouTube URL:');
        if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    }, [editor]);

    const insertTable = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        setShowTableMenu(false);
    }, [editor]);

    if (!editor) return null;

    const chars = editor.storage.characterCount.characters();
    const words = editor.storage.characterCount.words();

    const ToolbarButton = ({ onClick, active, title, children, danger }: {
        onClick: () => void; active?: boolean; title: string; children: React.ReactNode; danger?: boolean;
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded-md transition-all duration-150 ${active
                ? 'bg-accent/20 text-accent shadow-sm'
                : danger
                    ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-px h-6 bg-white/10 mx-0.5" />;

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
            {/* Toolbar Row 1 — Text Formatting */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/10 bg-white/[0.03] flex-wrap">
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <Redo className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* Heading dropdown */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => { setShowHeadingMenu(!showHeadingMenu); setShowTableMenu(false); }}
                        active={editor.isActive('heading')}
                        title="Headings"
                    >
                        <div className="flex items-center gap-1">
                            <Type className="w-4 h-4" />
                            <span className="text-[10px]">▾</span>
                        </div>
                    </ToolbarButton>
                    {showHeadingMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 py-1 min-w-[140px]">
                            <button type="button" onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false); }}
                                className="w-full text-left px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 flex items-center gap-2">
                                <Pilcrow className="w-3.5 h-3.5" /> Paragraph
                            </button>
                            {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                                <button key={level} type="button"
                                    onClick={() => { editor.chain().focus().toggleHeading({ level }).run(); setShowHeadingMenu(false); }}
                                    className={`w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2 ${editor.isActive('heading', { level }) ? 'text-accent' : 'text-white/70'}`}
                                    style={{ fontSize: `${18 - level * 1.5}px`, fontWeight: 'bold' }}
                                >
                                    H{level}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Divider />

                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
                    <UnderlineIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                    <Strikethrough className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
                    <Highlighter className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                    <Quote className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
                    <Code className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
                    <CodeSquare className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
                    <AlignLeft className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
                    <AlignCenter className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
                    <AlignRight className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
                    <AlignJustify className="w-4 h-4" />
                </ToolbarButton>
            </div>

            {/* Toolbar Row 2 — Insert & Media */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/10 bg-white/[0.02] flex-wrap">
                <ToolbarButton onClick={insertLink} active={editor.isActive('link')} title="Insert Link">
                    <LinkIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={insertImage} title="Insert Image">
                    <ImageIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={insertYoutube} title="Embed YouTube Video">
                    <YoutubeIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                    <Minus className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                {/* Table controls */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => { setShowTableMenu(!showTableMenu); setShowHeadingMenu(false); }}
                        active={editor.isActive('table')}
                        title="Table"
                    >
                        <div className="flex items-center gap-1">
                            <TableIcon className="w-4 h-4" />
                            <span className="text-[10px]">▾</span>
                        </div>
                    </ToolbarButton>
                    {showTableMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 py-1 min-w-[180px]">
                            {!editor.isActive('table') ? (
                                <button type="button" onClick={insertTable}
                                    className="w-full text-left px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 flex items-center gap-2">
                                    <Plus className="w-3.5 h-3.5" /> Insert Table (3—3)
                                </button>
                            ) : (
                                <>
                                    <button type="button" onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }}
                                        className="w-full text-left px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 flex items-center gap-2">
                                        <Columns className="w-3.5 h-3.5" /> Add Column After
                                    </button>
                                    <button type="button" onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }}
                                        className="w-full text-left px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 flex items-center gap-2">
                                        <RowsIcon className="w-3.5 h-3.5" /> Add Row After
                                    </button>
                                    <button type="button" onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }}
                                        className="w-full text-left px-3 py-1.5 text-sm text-red-400/70 hover:bg-red-500/10 flex items-center gap-2">
                                        <Columns className="w-3.5 h-3.5" /> Delete Column
                                    </button>
                                    <button type="button" onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }}
                                        className="w-full text-left px-3 py-1.5 text-sm text-red-400/70 hover:bg-red-500/10 flex items-center gap-2">
                                        <RowsIcon className="w-3.5 h-3.5" /> Delete Row
                                    </button>
                                    <div className="h-px bg-white/10 my-1" />
                                    <button type="button" onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }}
                                        className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Table
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1" />

                {/* Word/Character count */}
                <div className="flex items-center gap-3 text-[11px] text-white/30 mr-2">
                    <span>{words} words</span>
                    <span>{chars} chars</span>
                    <span>~{Math.max(1, Math.ceil(words / 200))} min read</span>
                </div>

                {/* Source toggle */}
                <button
                    type="button"
                    onClick={() => setShowSource(!showSource)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${showSource ? 'bg-accent/20 text-accent' : 'text-white/40 hover:text-white/60'}`}
                >
                    {showSource ? 'Visual' : 'HTML'}
                </button>
            </div>

            {/* Editor Area */}
            {showSource ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full min-h-[400px] p-6 bg-[#0a0c10] text-gray-100 text-sm font-mono resize-y outline-none border-t border-white/10"
                    placeholder={placeholder || 'Write your content here...'}
                />
            ) : (
                <div onClick={() => { setShowTableMenu(false); setShowHeadingMenu(false); }}>
                    <EditorContent editor={editor} />
                </div>
            )}
        </div>
    );
}
