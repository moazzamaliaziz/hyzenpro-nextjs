interface PersonaHeroProps {
    title: string;
    subtitle: string;
    image?: string | null;
    baseUrl: string;
}

export default function PersonaHero({ title, subtitle, image, baseUrl }: PersonaHeroProps) {
    return (
        <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">AI Tools For</p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
                {title}
            </h1>
            {subtitle && (
                <div className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed whitespace-pre-line">
                    {subtitle}
                </div>
            )}
            {image && (
                <div className="mt-8 max-w-2xl mx-auto">
                    <img src={image} alt={title} className="w-full rounded-2xl shadow-sm" />
                </div>
            )}
        </div>
    );
}
