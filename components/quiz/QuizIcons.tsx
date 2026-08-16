import {
  Captions,
  Code2,
  Image as ImageIcon,
  PenSquare,
  Search,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  captions: Captions,
  'code-2': Code2,
  image: ImageIcon,
  'pen-square': PenSquare,
  search: Search,
  sparkles: Sparkles,
  zap: Zap,
};

export function getQuizIcon(name: string): LucideIcon {
  return ICONS[name] ?? Sparkles;
}
