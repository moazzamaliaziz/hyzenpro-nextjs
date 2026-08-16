import ToolLogo from '@/components/ui/ToolLogo';

interface ToolPageLogoProps {
    logo?: string | null;
    name: string;
    size?: 'hero' | 'compact';
    accent: string;
    className?: string;
}

export default function ToolPageLogo({
    logo,
    name,
    size = 'hero',
    accent,
    className,
}: ToolPageLogoProps) {
    return (
        <ToolLogo
            logo={logo}
            name={name}
            size={size === 'hero' ? 'xl' : 'lg'}
            containerClassName={className}
        />
    );
}