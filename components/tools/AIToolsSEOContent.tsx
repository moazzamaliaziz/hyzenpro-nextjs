import React from 'react';
import prisma from '@/lib/prisma';

export default async function AIToolsSEOContent() {
    // 1. Fetch dynamic SEO content from SiteContent collection
    const seoSection = await prisma.siteContent.findUnique({
        where: { sectionId: 'directory-seo' }
    });

    // 2. If disabled or non-existent, don't render
    if (!seoSection || !seoSection.enabled) {
        return null;
    }

    // 3. Extract HTML content
    const content = seoSection.content as { html?: string } | null;
    const html = content?.html;

    if (!html) {
        return null;
    }

    return (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16 border-t border-gray-200">
            <div 
                className="prose prose-lg prose-gray max-w-none
                    prose-headings:font-heading prose-headings:text-black
                    prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                    prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-ul:text-gray-600 prose-li:marker:text-black
                    prose-strong:text-black hover:prose-a:text-gray-600"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </section>
    );
}
