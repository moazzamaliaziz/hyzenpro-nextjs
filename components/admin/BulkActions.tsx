'use client';

import { useState, useCallback } from 'react';
import { Trash2, Edit, Eye, MoreHorizontal, Check, X } from 'lucide-react';

interface BulkAction<T> {
    label: string;
    icon: React.ReactNode;
    action: (items: T[]) => Promise<void> | void;
    variant?: 'default' | 'danger';
    confirm?: string;
}

interface BulkActionsProps<T> {
    selectedIds: string[];
    totalCount: number;
    actions: BulkAction<T>[];
    onSelectionChange: (ids: string[]) => void;
    getItems?: (ids: string[]) => T[];
    renderItemActions?: (item: T) => React.ReactNode;
}

export function BulkActions<T extends { id: string }>({
    selectedIds,
    totalCount,
    actions,
    onSelectionChange,
    getItems,
    renderItemActions,
}: BulkActionsProps<T>) {
    const [showConfirm, setShowConfirm] = useState<{ action: BulkAction<T>; items: T[] } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const allSelected = selectedIds.length === totalCount && totalCount > 0;
    const someSelected = selectedIds.length > 0 && !allSelected;

    const handleSelectAll = useCallback(() => {
        if (allSelected) {
            onSelectionChange([]);
        } else {
            onSelectionChange(selectedIds.length === totalCount ? [] : selectedIds);
        }
    }, [allSelected, onSelectionChange, selectedIds, totalCount]);

    const handleItemSelect = useCallback((id: string, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedIds, id]);
        } else {
            onSelectionChange(selectedIds.filter((x) => x !== id));
        }
    }, [onSelectionChange, selectedIds]);

    const handleBulkAction = useCallback(async (action: BulkAction<T>) => {
        const items = getItems ? getItems(selectedIds) : [];
        if (action.confirm) {
            setShowConfirm({ action, items });
        } else {
            setIsProcessing(true);
            try {
                await action.action(items);
            } finally {
                setIsProcessing(false);
            }
        }
    }, [selectedIds, getItems]);

    const handleConfirm = useCallback(async () => {
        if (!showConfirm) return;
        setIsProcessing(true);
        try {
            await showConfirm.action.action(showConfirm.items);
            onSelectionChange([]);
        } finally {
            setIsProcessing(false);
            setShowConfirm(null);
        }
    }, [showConfirm, onSelectionChange]);

    if (selectedIds.length === 0) return null;

    return (
        <>
            <div className="fixed bottom-4 right-4 z-40 animate-in slide-in-from-bottom-4">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 flex items-center gap-4 min-w-[320px] max-w-md">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleBulkAction(action)}
                                disabled={isProcessing}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                                    action.variant === 'danger'
                                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                } disabled:opacity-50`}
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                        <button
                            onClick={() => onSelectionChange([])}
                            className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowConfirm(null)}>
                    <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            {showConfirm.action.confirm}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            This will affect {showConfirm.items.length} item{showConfirm.items.length !== 1 ? 's' : ''}.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(null)}
                                disabled={isProcessing}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isProcessing}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                                    showConfirm.action.variant === 'danger'
                                        ? 'text-white bg-red-600 hover:bg-red-700'
                                        : 'text-white bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {isProcessing ? 'Processing...' : showConfirm.action.label}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function BulkActionCheckbox({ checked, onChange, disabled, indeterminate }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    indeterminate?: boolean;
}) {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            aria-label={indeterminate ? 'Select all' : 'Select item'}
        />
    );
}