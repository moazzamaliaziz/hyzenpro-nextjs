import { toolHeadingFont } from '@/lib/tool-page-fonts';
import { getPersonaIcon } from '@/components/tool-page/ToolPageIcons';
import type { UserPersona } from '@/lib/tool-page-types';
import { cn } from '@/lib/utils';

interface ToolPagePersonasProps {
    toolName: string;
    personas: UserPersona[];
    accent: string;
    accentSoft: string;
}

export default function ToolPagePersonas({
    toolName,
    personas,
    accent,
    accentSoft,
}: ToolPagePersonasProps) {
    if (personas.length === 0) {
        return null;
    }

    return (
        <section id="who-its-for" className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16">
            <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                Is {toolName} Right for You?
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
                {personas.map((persona) => {
                    const Icon = getPersonaIcon(persona.icon);
                    const positive = persona.fit === 'good';

                    return (
                        <article
                            key={persona.label}
                            className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
                            style={{
                                borderLeft: `3px solid ${positive ? '#111111' : '#D97706'}`,
                            }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#E5E7EB] bg-[#FAFAFA] text-black">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span
                                    className="rounded-full px-3 py-1 text-[12px] font-medium"
                                    style={{
                                        backgroundColor: positive ? '#ECFDF3' : '#FFF7ED',
                                        color: positive ? '#166534' : '#9A3412',
                                    }}
                                >
                                    {positive ? 'Good fit' : 'Not ideal'}
                                </span>
                            </div>

                            <h3 className="mt-4 text-[18px] font-semibold leading-[1.4] text-[#0F0F0F]">
                                {persona.label}
                            </h3>
                            <p className="mt-3 text-[15px] leading-[1.75] text-[#4B5563]">
                                {persona.description}
                            </p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
