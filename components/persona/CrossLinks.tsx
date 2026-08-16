import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CrossLink {
    label: string;
    href: string;
    description?: string;
}

interface CrossLinksProps {
    links: CrossLink[];
}

export default function CrossLinks({ links }: CrossLinksProps) {
    if (!links?.length) return null;

    return (
        <section className="mb-16">
            <h2 className="font-serif text-3xl text-foreground mb-2">
                Also explore <span className="italic text-muted-foreground">other personas</span>
            </h2>
            <p className="text-muted-foreground mb-8">AI tool recommendations tailored for different teams and workflows.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {links.map((link, i) => (
                    <Link key={i} href={link.href}
                        className="group flex items-center justify-between p-5 bg-muted border border-border rounded-2xl hover:bg-card hover:shadow-sm hover:border-foreground/20 transition-all">
                        <div className="pr-4">
                            <h3 className="font-serif text-lg text-foreground group-hover:text-muted-foreground transition-colors">{link.label}</h3>
                            {link.description && (
                                <p className="text-sm text-muted-foreground/60 mt-1 line-clamp-1">{link.description}</p>
                            )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
