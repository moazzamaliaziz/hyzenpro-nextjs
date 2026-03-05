'use client';

import { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Link, Image, Code, Quote, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const [showSource, setShowSource] = useState(false);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        // Get updated content from the editor
        const editor = document.getElementById('editor-content');
        if (editor) {
            onChange(editor.innerHTML);
        }
    };

    const insertLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    const insertImage = () => {
        const url = prompt('Enter Image URL:');
        if (url) {
            execCommand('insertImage', url);
        }
    };

    const toolbarButtons = [
        { icon: Bold, action: () => execCommand('bold'), title: 'Bold' },
        { icon: Italic, action: () => execCommand('italic'), title: 'Italic' },
        { type: 'divider' },
        { icon: Heading2, action: () => execCommand('formatBlock', 'h2'), title: 'Heading 2' },
        { icon: Heading3, action: () => execCommand('formatBlock', 'h3'), title: 'Heading 3' },
        { type: 'divider' },
        { icon: List, action: () => execCommand('insertUnorderedList'), title: 'Bullet List' },
        { icon: ListOrdered, action: () => execCommand('insertOrderedList'), title: 'Numbered List' },
        { type: 'divider' },
        { icon: Link, action: insertLink, title: 'Insert Link' },
        { icon: Image, action: insertImage, title: 'Insert Image' },
        { icon: Quote, action: () => execCommand('formatBlock', 'blockquote'), title: 'Quote' },
        { icon: Code, action: () => execCommand('formatBlock', 'pre'), title: 'Code Block' },
        { type: 'divider' },
        { icon: Undo, action: () => execCommand('undo'), title: 'Undo' },
        { icon: Redo, action: () => execCommand('redo'), title: 'Redo' },
    ];

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-white/[0.03] flex-wrap">
                {toolbarButtons.map((btn, i) =>
                    btn.type === 'divider' ? (
                        <div key={i} className="w-px h-6 bg-white/10 mx-1" />
                    ) : (
                        <button
                            key={i}
                            type="button"
                            onClick={btn.action}
                            title={btn.title}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                            {btn.icon && <btn.icon className="w-4 h-4" />}
                        </button>
                    )
                )}

                <div className="flex-1" />
                <button
                    type="button"
                    onClick={() => setShowSource(!showSource)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${showSource ? 'bg-accent/20 text-accent' : 'text-white/40 hover:text-white/60'
                        }`}
                >
                    {showSource ? 'Visual' : 'HTML'}
                </button>
            </div>

            {/* Editor */}
            {showSource ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full min-h-[400px] p-4 bg-transparent text-white/90 text-sm font-mono resize-y outline-none"
                    placeholder={placeholder || 'Write your content here...'}
                />
            ) : (
                <div
                    id="editor-content"
                    contentEditable
                    suppressContentEditableWarning
                    className="min-h-[400px] p-4 text-white/90 prose prose-invert max-w-none outline-none
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
            [&_p]:mb-3 [&_p]:leading-relaxed
            [&_a]:text-accent [&_a]:underline
            [&_blockquote]:border-l-4 [&_blockquote]:border-accent/50 [&_blockquote]:pl-4 [&_blockquote]:italic
            [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-sm
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3
            [&_li]:mb-1
            [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4"
                    onInput={(e) => onChange((e.target as HTMLElement).innerHTML)}
                    dangerouslySetInnerHTML={{ __html: value || '' }}
                    data-placeholder={placeholder || 'Write your content here...'}
                />
            )}
        </div>
    );
}
