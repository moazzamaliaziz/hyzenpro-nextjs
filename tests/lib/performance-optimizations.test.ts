import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { directoryCategorySelect, directoryToolSelect } from '@/lib/directory-data';
import { getSavedToolIds, parseToolIds, MAX_SAVED_TOOL_BATCH_SIZE } from '@/lib/saved-tool-ids';

describe('directory performance boundaries', () => {
  it('keeps the public directory projection limited to card and filter fields', () => {
    expect(Object.keys(directoryToolSelect)).toEqual([
      'id',
      'name',
      'slug',
      'shortDescription',
      'logo',
      'pricingType',
      'rating',
      'primaryCategory',
      'views',
      'featured',
      'categoryIds',
      'features',
    ]);
    expect(directoryToolSelect).not.toHaveProperty('longDescription');
    expect(directoryToolSelect).not.toHaveProperty('meta');
    expect(directoryToolSelect).not.toHaveProperty('seo');
    expect(Object.keys(directoryCategorySelect)).toEqual(['id', 'name', 'slug', 'toolCount']);
  });

  it('deduplicates and bounds batch saved-tool IDs', () => {
    const ids = Array.from({ length: MAX_SAVED_TOOL_BATCH_SIZE + 1 }, (_, index) =>
      index.toString(16).padStart(24, '0'),
    );
    const parsed = parseToolIds(`${ids.join(',')},${ids[0]},not-an-object-id`);

    expect(parsed).toHaveLength(MAX_SAVED_TOOL_BATCH_SIZE);
    expect(parsed[0]).toBe(ids[0]);
    expect(parseToolIds(null)).toEqual([]);
    expect(getSavedToolIds([ids[0], ids[1], 'other'], [ids[1], ids[2]])).toEqual([ids[1]]);
  });

  it('avoids per-card animation and eager prefetch in the directory surface', () => {
    const panel = readFileSync(
      resolve(process.cwd(), 'components/tools/UnifiedFilterPanel.tsx'),
      'utf8',
    );
    const card = readFileSync(resolve(process.cwd(), 'components/tools/ToolCard.tsx'), 'utf8');

    expect(panel).not.toContain("from 'framer-motion'");
    expect(panel).toContain('/api/user/saved-tools?toolIds=');
    expect(panel).toContain('const INITIAL_VISIBLE_TOOLS = 24');
    expect(panel).toContain('const VISIBLE_TOOLS_INCREMENT = 24');
    expect(panel).toContain('const visibleTools = useMemo');
    expect(panel).toContain('setVisibleCount(INITIAL_VISIBLE_TOOLS)');
    expect(panel).toContain('Load more tools');
    expect(panel.match(/sortedTools\.slice\(0, visibleCount\)/g)).toHaveLength(1);
    expect(panel.match(/visibleTools\.map\(/g)).toHaveLength(2);
    expect(panel.match(/visibleTools\.length < sortedTools\.length/g)).toHaveLength(2);
    expect(card).toContain('prefetch={priority}');
  });
});
