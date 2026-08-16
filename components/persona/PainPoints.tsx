'use client';

import { AlertTriangle, Zap, DollarSign, Workflow, Search, Shield, BookOpen, Presentation, Layers, Lock, Users, FileText, BarChart3, Scissors, Image, Repeat } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
    AlertTriangle, Zap, DollarSign, Workflow, Search, Shield, BookOpen, Presentation,
    Layers, Lock, Users, FileText, BarChart3, Scissors, Image, Repeat,
};

interface PainPoint {
    title: string;
    description: string;
    icon: string;
}

interface PainPointsProps {
    painPoints: PainPoint[];
}

export default function PainPoints({ painPoints }: PainPointsProps) {
    if (!painPoints?.length) return null;

    return (
        <section className="mb-16">
            <h2 className="font-serif text-3xl text-foreground mb-2">
                The <span className="italic text-muted-foreground">challenges</span> you face
            </h2>
            <p className="text-muted-foreground mb-8">Sound familiar? These are the daily friction points we hear from professionals like you.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {painPoints.map((point, i) => {
                    const IconComponent = ICON_MAP[point.icon] || AlertTriangle;
                    return (
                        <div key={i} className="bg-muted border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
                            <div className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center mb-4">
                                <IconComponent className="w-5 h-5 text-foreground/60" />
                            </div>
                            <h3 className="font-serif text-lg text-foreground mb-2">{point.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
