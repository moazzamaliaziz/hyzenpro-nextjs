interface WorkflowStep {
    step: string;
    title: string;
    description: string;
}

interface WorkflowStepsProps {
    steps: WorkflowStep[];
}

export default function WorkflowSteps({ steps }: WorkflowStepsProps) {
    if (!steps?.length) return null;

    return (
        <section className="mb-16">
            <h2 className="font-serif text-3xl text-foreground mb-2">
                Your new <span className="italic text-muted-foreground">workflow</span>
            </h2>
            <p className="text-muted-foreground mb-8">A streamlined process that replaces hours of manual work with AI-assisted efficiency.</p>
            <div className="space-y-6">
                {steps.map((step, i) => (
                    <div key={i} className="flex gap-6 items-start group">
                        <div className="flex-shrink-0 w-14 h-14 bg-foreground text-background rounded-2xl flex items-center justify-center font-serif text-lg group-hover:opacity-90 transition-opacity">
                            {step.step}
                        </div>
                        <div className="flex-1 pt-2">
                            <h3 className="font-serif text-xl text-foreground mb-2">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
