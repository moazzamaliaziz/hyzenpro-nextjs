import {
    BarChart3,
    BriefcaseBusiness,
    Building2,
    CircleOff,
    Database,
    Github,
    Linkedin,
    Megaphone,
    Plug,
    Rocket,
    Twitter,
    Youtube,
    type LucideIcon,
} from 'lucide-react';

const personaIcons: Record<string, LucideIcon> = {
    megaphone: Megaphone,
    briefcase: BriefcaseBusiness,
    building: Building2,
    'chart-column': BarChart3,
    plug: Plug,
    rocket: Rocket,
    database: Database,
    'database-zap': Database,
    'circle-off': CircleOff,
};

const socialIcons: Record<string, LucideIcon> = {
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    github: Github,
};

export function getPersonaIcon(name: string) {
    return personaIcons[name] || BriefcaseBusiness;
}

export function getSocialIcon(name: string) {
    return socialIcons[name] || Linkedin;
}
