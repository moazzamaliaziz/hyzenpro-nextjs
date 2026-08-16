'use client';

import { useState, useCallback, useRef } from 'react';
import { GripVertical, ArrowUpDown } from 'lucide-react';

interface SortableItem<T> {
    id: string;
    content: React.ReactNode;
    data?: T;
}

interface SortableListProps<T> {
    items: SortableItem<T>[];
    onReorder: (items: SortableItem<T>[]) => void;
    renderItem?: (item: SortableItem<T>, index: number, isDragging: boolean) => React.ReactNode;
    className?: string;
    itemClassName?: string;
    handleClassName?: string;
}

export function SortableList<T>({
    items,
    onReorder,
    renderItem,
    className = '',
    itemClassName = '',
    handleClassName = '',
}: SortableListProps<T>) {
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const itemsRef = useRef<HTMLDivElement[]>([]);

    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedId(null);
        setDragOverId(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverId(id);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverId(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedId = e.dataTransfer.getData('text/plain');

        if (droppedId && droppedId !== dragOverId) {
            const newItems = [...items];
            const fromIndex = newItems.findIndex((item) => item.id === droppedId);
            const toIndex = newItems.findIndex((item) => item.id === dragOverId);

            if (fromIndex !== -1 && toIndex !== -1) {
                const [removed] = newItems.splice(fromIndex, 1);
                newItems.splice(toIndex, 0, removed);
                onReorder(newItems);
            }
        }

        setDraggedId(null);
        setDragOverId(null);
    }, [items, dragOverId, onReorder]);

    const defaultRenderItem = (item: SortableItem<T>, index: number, isDragging: boolean) => (
        <div
            className={`flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg transition-all duration-200 ${
                isDragging ? 'opacity-50 shadow-lg rotate-1 scale-102' : ''
            } ${dragOverId === item.id ? 'border-indigo-300 bg-indigo-50' : ''} ${itemClassName}`}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ userSelect: 'none' }}
        >
            <button
                type="button"
                className={`flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing ${handleClassName}`}
                aria-label="Drag to reorder"
            >
                <GripVertical className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">{item.content}</div>
        </div>
    );

    return (
        <div className={`space-y-2 ${className}`} role="list" aria-label="Sortable list">
            {items.map((item, index) => {
                const isDragging = draggedId === item.id;
                return (
                    <div
                        key={item.id}
                        ref={(el) => { if (el) itemsRef.current[index] = el; }}
                        role="listitem"
                        aria-grabbed={isDragging}
                    >
                        {renderItem ? renderItem(item, index, isDragging) : defaultRenderItem(item, index, isDragging)}
                    </div>
                );
            })}
        </div>
    );
}