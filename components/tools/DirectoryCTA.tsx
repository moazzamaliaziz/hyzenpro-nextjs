import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function DirectoryCTA() {
    const ctaSection = await prisma.siteContent.findUnique({
        where: { sectionId: 'directory-cta' }
    });

    if (!ctaSection || !ctaSection.enabled) return null;

    const title = ctaSection.title || 'Ready to Scale?';
    const subtitle = ctaSection.subtitle || 'Use our free comparison engine.';
    const content = ctaSection.content as { buttonText?: string; buttonUrl?: string } | null;
    
    const buttonText = content?.buttonText || 'Get Started Now';
    const buttonUrl = content?.buttonUrl || '/';

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground/90 to-foreground rounded-3xl p-8 md:p-12 shadow-2xl border border-foreground/20 flex flex-col items-center text-center">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-sky rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-peach rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

                <div className="w-16 h-16 bg-background/10 rounded-2xl flex items-center justify-center mb-6 border border-background/20 backdrop-blur-sm relative z-10">
                    <Sparkles className="w-8 h-8 text-background" />
                </div>

                <h2 className="text-3xl md:text-5xl font-heading text-background mb-4 relative z-10">
                    {title}
                </h2>
                
                <p className="text-background/60 text-lg max-w-2xl mx-auto mb-8 relative z-10">
                    {subtitle}
                </p>

                <div className="relative z-10">
                    <Link
                        href={buttonUrl}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-background text-foreground text-sm lg:text-base font-bold rounded-full hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        {buttonText}
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
