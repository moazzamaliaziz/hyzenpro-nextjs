import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

describe('ConfirmDialog', () => {
    it('renders title and description', () => {
        render(
            <ConfirmDialog
                isOpen={true}
                title="Delete Item"
                description="Are you sure?"
                onConfirm={vi.fn()}
                onClose={vi.fn()}
            />
        );
        expect(screen.getByText('Delete Item')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('uses custom button text', () => {
        render(
            <ConfirmDialog
                isOpen={true}
                title="Remove"
                description="This cannot be undone."
                confirmText="Yes, remove"
                cancelText="No, keep it"
                onConfirm={vi.fn()}
                onClose={vi.fn()}
            />
        );
        expect(screen.getByText('Yes, remove')).toBeInTheDocument();
        expect(screen.getByText('No, keep it')).toBeInTheDocument();
    });

    it('calls onConfirm when confirm clicked', () => {
        const onConfirm = vi.fn();
        render(
            <ConfirmDialog
                isOpen={true}
                title="Delete"
                description="Sure?"
                onConfirm={onConfirm}
                onClose={vi.fn()}
            />
        );
        fireEvent.click(screen.getByText('Confirm'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel clicked', () => {
        const onClose = vi.fn();
        render(
            <ConfirmDialog
                isOpen={true}
                title="Delete"
                description="Sure?"
                onConfirm={vi.fn()}
                onClose={onClose}
            />
        );
        fireEvent.click(screen.getByText('Cancel'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('shows Processing... when loading', () => {
        render(
            <ConfirmDialog
                isOpen={true}
                title="Deleting"
                description="Please wait..."
                onConfirm={vi.fn()}
                onClose={vi.fn()}
                loading={true}
            />
        );
        expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('renders nothing when not open', () => {
        const { container } = render(
            <ConfirmDialog
                isOpen={false}
                title="Hidden"
                description="Should not show"
                onConfirm={vi.fn()}
                onClose={vi.fn()}
            />
        );
        expect(container.firstChild).toBeNull();
    });
});