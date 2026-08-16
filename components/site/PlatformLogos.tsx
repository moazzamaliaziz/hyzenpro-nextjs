import Image from 'next/image';
import Link from 'next/link';

const platforms = [
    {
        name: 'Product Hunt',
        href: 'https://www.producthunt.com/products/hyzenpro',
        logo: '/images/logos/product-hunt.svg',
        width: 150,
        height: 34,
    },
    {
        name: 'G2',
        href: 'https://www.g2.com/products/hyzenpro/reviews',
        logo: '/images/logos/g2.svg',
        width: 80,
        height: 34,
    },
    {
        name: 'Indie Hackers',
        href: 'https://www.indiehackers.com/product/hyzenpro',
        logo: '/images/logos/indie-hackers.svg',
        width: 140,
        height: 34,
    },
    {
        name: 'Medium',
        href: 'https://medium.com/@ali.malikk',
        logo: '/images/logos/medium.svg',
        width: 120,
        height: 34,
    },
];

interface PlatformLogosProps {
    heading?: string;
    className?: string;
}

export default function PlatformLogos({ heading = 'Listed On', className = '' }: PlatformLogosProps) {
    return (
        <section className={`relative ${className}`} aria-labelledby="platforms-heading">
            <div className="mx-auto max-w-6xl px-6 text-center">
                <p id="platforms-heading" className="text-xs uppercase tracking-widest text-foreground/40">{heading}</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
                    {platforms.map((platform) => (
                        <Link
                            key={platform.name}
                            href={platform.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center opacity-50 transition hover:opacity-100"
                            aria-label={`View HyzenPro on ${platform.name}`}
                        >
                            <Image
                                src={platform.logo}
                                alt={`${platform.name} logo`}
                                width={platform.width}
                                height={platform.height}
                                className="h-8 w-auto object-contain sm:h-9 md:h-10"
                                priority={false}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
