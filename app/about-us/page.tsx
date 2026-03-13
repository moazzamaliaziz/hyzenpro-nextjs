import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, Shield, Microscope, Palette, Brain, Target, Users, Layers, Search, GitMerge, TrendingUp, Bookmark } from 'lucide-react';

export const metadata: Metadata = {
    title: 'About Us — The People Behind HyzenPro',
    description: 'Meet the team behind HyzenPro. We audit, review, and curate the best AI tools so creators, developers, and businesses can make informed decisions.',
    openGraph: {
        title: 'About Us — HyzenPro',
        description: 'Real humans behind the intelligence. Meet the team that builds the internet\'s most trusted AI tools directory.',
    },
    alternates: {
        canonical: '/about-us/',
    },
};

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen bg-white">

                {/* Hero */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <Breadcrumbs items={[{ label: 'About Us' }]} className="mb-10" />

                    <div className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">About HyzenPro</p>
                        <h1 className="font-heading text-5xl md:text-7xl text-black leading-[0.95] mb-6">
                            Real Human<br />
                            Behind The<br />
                            Intelligence<span className="text-gray-300">®</span>
                        </h1>
                        <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
                            Helping creators and brands navigate the noise. We audit tools and interfaces that attract, build trust across the modern AI ecosystem, and deliver reviews that solve real problems.
                        </p>
                    </div>
                </section>

                {/* Team Section */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Ali Malik */}
                        <div className="bg-gray-50 rounded-3xl p-8 md:p-10 border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 mb-6 overflow-hidden relative">
                                    <Image
                                        src="https://hyzenpro.com/wp-content/uploads/2025/06/wmremove-transformed.jpeg"
                                        alt="Ali Malik"
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                </div>
                                <h2 className="font-heading text-2xl text-black mb-1">Ali Malik</h2>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Founder & Lead Strategist</p>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                    Ali leads the vision for HyzenPro, bridging the gap between technical complexity and user utility. He specializes in vetting large-scale generative workflows and ethical AI scaling.
                                </p>
                                <a
                                    href="mailto:alimalik@hyzenpro.com"
                                    className="inline-flex items-center gap-2 text-sm text-black font-medium hover:underline"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    alimalik@hyzenpro.com
                                </a>
                            </div>
                        </div>

                        {/* Rana Aqib */}
                        <div className="bg-gray-50 rounded-3xl p-8 md:p-10 border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 mb-6 overflow-hidden relative">
                                    <Image
                                        src="https://hyzenpro.com/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-25-at-12.24.30-AM.jpeg"
                                        alt="Rana Aqib"
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                </div>
                                <h2 className="font-heading text-2xl text-black mb-1">Rana Aqib</h2>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Head of Research & QA</p>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                    Rana oversees the rigorous &ldquo;HyzenPro Gold Standard&rdquo; protocol. His background in algorithmic research ensures our verification data remains the most trusted in the industry.
                                </p>
                                <a
                                    href="mailto:ranaaqib@hyzenpro.com"
                                    className="inline-flex items-center gap-2 text-sm text-black font-medium hover:underline"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    ranaaqib@hyzenpro.com
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Expertise Grid */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">Our Expertise</p>
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="border border-gray-200 rounded-2xl p-6 hover:border-black transition-colors duration-300">
                            <Brain className="w-6 h-6 text-black mb-4" />
                            <h3 className="font-bold text-black text-sm mb-2">Prompt Engineering</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Specialized in chain-of-thought and few-shot prompting for complex automation workflows.
                            </p>
                        </div>
                        <div className="border border-gray-200 rounded-2xl p-6 hover:border-black transition-colors duration-300">
                            <Microscope className="w-6 h-6 text-black mb-4" />
                            <h3 className="font-bold text-black text-sm mb-2">LLM Auditing</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Stress-testing models for bias, latency, and real-world utility before we recommend them.
                            </p>
                        </div>
                        <div className="border border-gray-200 rounded-2xl p-6 hover:border-black transition-colors duration-300">
                            <Palette className="w-6 h-6 text-black mb-4" />
                            <h3 className="font-bold text-black text-sm mb-2">AI UX Design</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Crafting interfaces that make artificial intelligence feel natural and invisible to end users.
                            </p>
                        </div>
                    </div>
                </section>

                {/* What We Do */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="grid md:grid-cols-2 gap-16 items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">What We Do</p>
                            <h2 className="font-heading text-4xl text-black mb-6">We test tools so you don&apos;t waste time.</h2>
                            <p className="text-gray-500 leading-relaxed mb-6">
                                HyzenPro was created to cut through the noise. With thousands of AI tools launching every year, picking the right one shouldn&apos;t require hours of research. We do the legwork — testing features, comparing pricing, benchmarking performance — so you get honest answers fast.
                            </p>
                            <p className="text-gray-500 leading-relaxed">
                                Every tool on our directory undergoes hands-on evaluation. We don&apos;t republish press releases. If a tool doesn&apos;t work as advertised, we say so.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: Shield, title: 'Honest Reviews', text: 'No sponsored rankings. Every review is based on real testing, not affiliate payments.' },
                                { icon: Target, title: 'Practical Focus', text: 'We evaluate tools through the lens of real use cases — not theoretical benchmarks.' },
                                { icon: Users, title: 'Community-Driven', text: 'User ratings and reviews supplement our editorial evaluations for balanced perspectives.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                                    <item.icon className="w-5 h-5 text-black mt-0.5 shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-sm text-black mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* What We Cover */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Coverage Areas</p>
                    <h2 className="font-heading text-4xl text-black mb-10">From reviews to real-world guides.</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { title: 'AI Tool Reviews', description: 'In-depth, hands-on testing with honest verdicts.' },
                            { title: 'Tool Comparisons', description: 'Side-by-side analysis of direct competitors.' },
                            { title: 'Tutorials', description: 'Step-by-step guides on real workflows.' },
                            { title: 'Use Cases', description: 'Industry-specific AI applications.' },
                        ].map((item, i) => (
                            <div key={i} className="p-5 border border-gray-200 rounded-2xl hover:border-black hover:-translate-y-0.5 transition-all duration-300">
                                <div className="text-2xl font-heading text-gray-200 mb-3">0{i + 1}</div>
                                <h3 className="font-bold text-sm text-black mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* The HyzenPro Platform */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Platform Features</p>
                    <h2 className="font-heading text-4xl text-black mb-6">More than just a directory.</h2>
                    <p className="text-gray-500 leading-relaxed mb-10 max-w-2xl">
                        HyzenPro isn't just a static list of links. We've built an interactive, data-driven platform designed to help you discover, compare, and organize your AI workflow seamlessly. Our custom-built infrastructure ensures you find exactly what you need.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: Layers,
                                title: 'The Complete AI Directory',
                                desc: 'A meticulously categorized and searchable database of thousands of AI tools, complete with pricing details, genuine reviews, and trusted user ratings.'
                            },
                            {
                                icon: Search,
                                title: 'Smart Recommendation Wizard',
                                desc: 'Our unique "Find Tools" engine. Answer three quick questions about your workflow, budget, and goals to get instant, personalized AI tool recommendations.'
                            },
                            {
                                icon: GitMerge,
                                title: 'Side-by-Side Comparison Engine',
                                desc: 'Select multiple tools and generate dynamic comparison matrices. Instantly evaluate features, pros, cons, and pricing to make confident purchasing decisions.'
                            },
                            {
                                icon: Bookmark,
                                title: 'My Tech Stack Builder',
                                desc: 'Create a free account to build, organize, and track your personalized "AI Tech Stack." Save tools you use, want to try, or are evaluating in one unified dashboard.'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Live Trending Tracker',
                                desc: 'Our algorithms track community interest and tool adoption in real-time, showing you exactly which tools are surging in popularity across the AI landscape.'
                            },
                            {
                                icon: Users,
                                title: 'Vendor Portal & Analytics',
                                desc: 'For AI founders, our dedicated vendor portal provides real-time traffic analytics, letting you track views and engagement for your submitted platforms.'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="flex gap-4 p-6 bg-white border border-gray-200 hover:border-black rounded-2xl transition-colors duration-300">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                                    <feature.icon className="w-5 h-5 text-black" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black text-sm mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                    <div className="bg-black rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h2 className="font-heading text-3xl text-white mb-2">Want to work with us?</h2>
                            <p className="text-gray-400 text-sm max-w-md">
                                Whether you&apos;re a tool builder looking to get listed, or a brand seeking an honest review — we&apos;d love to hear from you.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                href="/contact/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Get in Touch <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/submit-ai-tool/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white text-sm font-bold rounded-xl border border-white/10 hover:bg-white/20 transition-colors"
                            >
                                Submit a Tool
                            </Link>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
