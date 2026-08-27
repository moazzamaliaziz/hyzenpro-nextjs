const MAX_BATCH_IDS = 200;

export function parseToolIds(value: string | null): string[] {
    if (!value) return [];

    return Array.from(
        new Set(
            value
                .split(',')
                .map((id) => id.trim())
                .filter((id) => /^[a-f0-9]{24}$/i.test(id)),
        ),
    ).slice(0, MAX_BATCH_IDS);
}

export function getSavedToolIds(savedToolIds: string[], requestedIds: string[]): string[] {
    if (requestedIds.length === 0) return [];
    const requested = new Set(requestedIds);
    return savedToolIds.filter((id) => requested.has(id));
}

export const MAX_SAVED_TOOL_BATCH_SIZE = MAX_BATCH_IDS;
