// WordPress GraphQL Configuration
import fs from 'fs';
import path from 'path';

const GRAPHQL_URL = process.env.WORDPRESS_GRAPHQL_URL || 'https://hyzenpro.com/graphql';
const REST_URL = process.env.WORDPRESS_REST_URL || 'https://hyzenpro.com/wp-json/wp/v2';

// Types
export interface Tool {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    category: string;
    categorySlug: string;
    rating: number;
    pricing: string;
    website: string;
    pros: string[];
    cons: string[];
    features: string[];
    link: string;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    categories: string[];
    categorySlugs: string[];
    author: string;
    authorSlug: string;
    date: string;
    link: string;
}

export interface Author {
    slug: string;
    name: string;
    role: string;
    avatar: string;
    bio: string;
    social: {
        twitter: string;
        linkedin: string;
    };
    verified: boolean;
    expertise: string[];
}

import { XReview } from '@/components/marketing/XReviews';

export interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    icon: string;
    description: string;
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
    'ai-automation-tools': '⚡',
    'ai-chatbots': '🤖',
    'ai-coding-tools': '💻',
    'ai-design-tools': '🎨',
    'ai-general-tools': '🔧',
    'ai-image-tools': '🖼️',
    'ai-marketing-tools': '📈',
    'ai-productivity-tools': '📊',
    'ai-subtitle-generators': '💬',
    'ai-ui-generators': '🎯',
    'ai-video-tools': '🎬',
    'ai-voice-tools': '🎵',
    'ai-website-builder': '🌐',
    'ai-writing-tools': '✍️',
    'avatar-generators': '👤',
    'copywriting': '📝',
    'seo-tools': '🔍',
    'text-to-speech': '🗣️',
};

// GraphQL Queries
const POSTS_QUERY = `
query GetPosts($first: Int = 100) {
  posts(first: $first, where: { status: PUBLISH }) {
    nodes {
      id
      databaseId
      title
      slug
      excerpt
      content
      date
      link
      featuredImage {
        node {
          sourceUrl
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      author {
        node {
          name
          slug
        }
      }
    }
  }
}
`;

const AI_TOOLS_QUERY = `
query GetAITools {
  aiTools(first: 100) {
    id
    title
    slug
    logo
    pricing
    categoryName
    categorySlug
    content
    excerpt
    databaseId
    views
    website
  }
}
`;

const AI_TOOL_CATEGORIES_QUERY = `
query GetAIToolCategories {
  aiToolCategories {
    name
    slug
    count
    description
    id
  }
}
`;

// Fetch from GraphQL
async function fetchGraphQL<T>(query: string, variables = {}): Promise<T | null> {
    try {
        console.log('Fetching GraphQL:', GRAPHQL_URL);

        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            console.error(`GraphQL error: ${response.status}`);
            return null;
        }

        const json = await response.json();

        if (json.errors) {
            console.error('GraphQL errors:', json.errors);
            return null;
        }

        return json.data as T;
    } catch (error) {
        console.error('GraphQL fetch error:', error);
        return null;
    }
}

// Get all blog posts
export async function getAllPosts(): Promise<Post[]> {
    try {
        const data = await fetchGraphQL<{ posts: { nodes: any[] } }>(POSTS_QUERY);

        if (data?.posts?.nodes && data.posts.nodes.length > 0) {
            console.log(`Fetched ${data.posts.nodes.length} posts from GraphQL`);
            return data.posts.nodes.map((post) => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt?.replace(/<[^>]*>/g, '').trim() || '',
                content: post.content || '',
                featuredImage: post.featuredImage?.node?.sourceUrl || '/images/placeholder.jpg',
                categories: post.categories?.nodes?.map((c: any) => c.name) || [],
                categorySlugs: post.categories?.nodes?.map((c: any) => c.slug) || [],
                author: post.author?.node?.name || 'HyzenPro Team',
                authorSlug: post.author?.node?.slug || 'hyzenpro-team',
                date: post.date,
                link: post.link,
            }));
        }
    } catch (error) {
        console.error('Failed to fetch posts:', error);
    }

    console.log('Using demo posts data');
    return getDemoPosts();
}

// Get post by slug
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const posts = await getAllPosts();
    return posts.find(post => post.slug === slug);
}

// Get all AI Tools
export async function getAllTools(): Promise<Tool[]> {
    try {
        const data = await fetchGraphQL<{ aiTools: any[] }>(AI_TOOLS_QUERY);

        console.log('GraphQL aiTools response:', data?.aiTools ? `${data.aiTools.length} tools` : 'null/empty');

        if (data?.aiTools && data.aiTools.length > 0) {
            console.log(`SUCCESS: Fetched ${data.aiTools.length} AI tools from GraphQL`);
            return data.aiTools.map((tool) => ({
                id: tool.id || tool.databaseId?.toString() || '',
                title: tool.title || 'Untitled Tool',
                slug: tool.slug || '',
                excerpt: tool.excerpt?.replace(/<[^>]*>/g, '').trim() || tool.content?.substring(0, 160)?.replace(/<[^>]*>/g, '').trim() || '',
                content: tool.content || '',
                featuredImage: tool.logo || '/images/tool-placeholder.jpg',
                category: tool.categoryName || 'AI Tools',
                categorySlug: tool.categorySlug || 'ai-general-tools',
                rating: 4.8, // Default rating
                pricing: tool.pricing || 'Freemium',
                website: tool.website || 'https://hyzenpro.com',
                pros: [], // Will be parsed from content if needed or empty
                cons: [],
                features: [],
                link: `/ai-tools-directory/${tool.categorySlug || 'ai-general-tools'}/${tool.slug}`,
            }));
        }
    } catch (error) {
        console.error('Failed to fetch AI tools:', error);
    }

    console.log('Using demo tools data');
    return getDemoTools();
}

// Get tool by slug
export async function getToolBySlug(slug: string): Promise<Tool | undefined> {
    const tools = await getAllTools();
    return tools.find(tool => tool.slug === slug);
}

// Get all AI Tool categories
export async function getCategories(): Promise<Category[]> {
    try {
        const data = await fetchGraphQL<{ aiToolCategories: any[] }>(AI_TOOL_CATEGORIES_QUERY);

        console.log('GraphQL aiToolCategories response:', data?.aiToolCategories ? `${data.aiToolCategories.length} categories` : 'null/empty');

        if (data?.aiToolCategories && data.aiToolCategories.length > 0) {
            console.log(`SUCCESS: Fetched ${data.aiToolCategories.length} categories from GraphQL`);
            return data.aiToolCategories.map((cat) => ({
                id: cat.id || '',
                name: cat.name || 'Unknown Category',
                slug: cat.slug || '',
                count: cat.count || 0,
                icon: CATEGORY_ICONS[cat.slug] || '🤖',
                description: cat.description || '',
            }));
        }
    } catch (error) {
        console.error('Failed to fetch categories:', error);
    }

    console.log('Using demo categories data');
    return getDemoCategories();
}

// Get blog categories
export async function getBlogCategories(): Promise<Category[]> {
    try {
        const data = await fetchGraphQL<{ categories: { nodes: any[] } }>(`
      query GetCategories {
        categories(first: 50) {
          nodes {
            id
            name
            slug
            count
          }
        }
      }
    `);

        if (data?.categories?.nodes) {
            return data.categories.nodes.map((cat) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                count: cat.count || 0,
                icon: '📰',
                description: '',
            }));
        }
    } catch (error) {
        console.error('Failed to fetch blog categories:', error);
    }

    return [];
}

// Get tools by category
export async function getToolsByCategory(categorySlug: string): Promise<Tool[]> {
    const tools = await getAllTools();
    return tools.filter(tool => tool.categorySlug === categorySlug);
}

// Demo data functions
function getDemoTools(): Tool[] {
    return [
        {
            id: '1',
            title: 'ChatGPT',
            slug: 'chatgpt',
            excerpt: 'The most powerful conversational AI by OpenAI. Perfect for writing, coding, and creative tasks.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
            category: 'AI Chatbots',
            categorySlug: 'ai-chatbots',
            rating: 4.9,
            pricing: 'Freemium',
            website: 'https://chat.openai.com',
            pros: ['Excellent conversational abilities', 'Versatile use cases', 'Regular updates'],
            cons: ['Can be inconsistent', 'Premium features require subscription'],
            features: ['Natural language understanding', 'Code generation', 'Creative writing'],
            link: 'https://hyzenpro.com/ai-tools-directory/ai-chatbots/chatgpt/',
        },
        {
            id: '2',
            title: 'GitHub Copilot',
            slug: 'github-copilot',
            excerpt: 'AI pair programmer that helps you write code faster and with less effort.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
            category: 'AI Coding Tools',
            categorySlug: 'ai-coding-tools',
            rating: 4.7,
            pricing: '$19/month',
            website: 'https://github.com/features/copilot',
            pros: ['Excellent code suggestions', 'IDE integration', 'Learns your style'],
            cons: ['Paid only', 'Privacy concerns'],
            features: ['Code completion', 'Function generation', 'Test generation'],
            link: 'https://hyzenpro.com/ai-tools-directory/ai-coding-tools/github-copilot/',
        },
        {
            id: '3',
            title: 'Jasper',
            slug: 'jasper',
            excerpt: 'Enterprise-grade AI writing assistant for marketing teams and content creators.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
            category: 'AI Automation Tools',
            categorySlug: 'ai-automation-tools',
            rating: 4.6,
            pricing: '$49/month',
            website: 'https://jasper.ai',
            pros: ['Marketing-focused templates', 'Brand voice customization', 'Team collaboration'],
            cons: ['Expensive', 'Learning curve'],
            features: ['Blog post generation', 'Ad copy creation', 'Social media posts'],
            link: 'https://hyzenpro.com/ai-tools-directory/ai-automation-tools/jasper/',
        },
        {
            id: '4',
            title: 'VEED.io',
            slug: 'veed-io',
            excerpt: 'Professional AI video editing and generation platform for content creators.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80',
            category: 'AI Video Tools',
            categorySlug: 'ai-video-tools',
            rating: 4.7,
            pricing: '$12/month',
            website: 'https://veed.io',
            pros: ['Easy to use', 'Auto subtitles', 'Great templates'],
            cons: ['Watermark on free', 'Export limits'],
            features: ['Auto subtitles', 'Screen recording', 'Video editing'],
            link: 'https://hyzenpro.com/ai-tools-directory/ai-video-tools/veed-io/',
        },
        {
            id: '5',
            title: 'Canva Magic Studio',
            slug: 'canva-magic-studio',
            excerpt: 'AI-powered design tools integrated into Canva for stunning visuals.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
            category: 'AI Image Tools',
            categorySlug: 'ai-image-tools',
            rating: 4.8,
            pricing: 'Freemium',
            website: 'https://canva.com',
            pros: ['Easy to use', 'Huge template library', 'AI image generation'],
            cons: ['Best features are paid', 'Can be slow'],
            features: ['Magic Resize', 'Background Remover', 'AI Image Generation'],
            link: 'https://hyzenpro.com/ai-tools-directory/ai-image-tools/canva-magic-studio/',
        },
        {
            id: '6',
            title: 'Zapier',
            slug: 'zapier',
            excerpt: 'Automate workflows by connecting your favorite apps with AI-powered suggestions.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
            category: 'AI Automation Tools',
            categorySlug: 'ai-automation-tools',
            rating: 4.5,
            pricing: 'Freemium',
            website: 'https://zapier.com',
            pros: ['5000+ app integrations', 'Easy workflow builder', 'Reliable'],
            cons: ['Gets expensive', 'Limited free tier'],
            features: ['Workflow automation', 'Multi-step Zaps', 'AI suggestions'],
            link: 'https://hyzenpro.com/ai-tools-directory/ai-automation-tools/zapier/',
        },
    ];
}

function getDemoPosts(): Post[] {
    return [
        {
            id: '1',
            title: '10 Best AI Caption Generator Tools',
            slug: '10-best-ai-caption-generator-tools',
            excerpt: 'Discover the top AI caption generators to create engaging social media captions automatically.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
            categories: ['Reviews'],
            categorySlugs: ['reviews'],
            author: 'HyzenPro Team',
            authorSlug: 'hyzenpro-team',
            date: '2024-01-20',
            link: 'https://hyzenpro.com/10-best-ai-caption-generator-tools/',
        },
        {
            id: '2',
            title: '10 Best AI Writing Tools 2026',
            slug: '10-best-ai-writing-tools-2026',
            excerpt: 'An in-depth comparison of the best AI writing tools to boost your content creation.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
            categories: ['Reviews'],
            categorySlugs: ['reviews'],
            author: 'HyzenPro Team',
            authorSlug: 'hyzenpro-team',
            date: '2024-01-18',
            link: 'https://hyzenpro.com/10-best-ai-writing-tools-2026/',
        },
        {
            id: '3',
            title: 'Best AI Coding Assistants in 2025',
            slug: 'best-ai-coding-assistants-in-2025',
            excerpt: 'A comprehensive guide to the best AI coding assistants for developers.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
            categories: ['Reviews'],
            categorySlugs: ['reviews'],
            author: 'HyzenPro Team',
            authorSlug: 'hyzenpro-team',
            date: '2024-01-15',
            link: 'https://hyzenpro.com/best-ai-coding-assistants-in-2025/',
        },
        {
            id: '4',
            title: 'How to Build and Monetize Web Apps with AI',
            slug: 'how-to-build-and-monetize-web-apps-with-ai',
            excerpt: 'Learn how to leverage AI tools to build and monetize web applications.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
            categories: ['Tutorials'],
            categorySlugs: ['tutorials'],
            author: 'HyzenPro Team',
            authorSlug: 'hyzenpro-team',
            date: '2024-01-12',
            link: 'https://hyzenpro.com/how-to-build-and-monetize-web-apps-with-ai/',
        },
        {
            id: '5',
            title: 'AI Agents and Workflow Automation',
            slug: 'ai-agents-and-workflow-automation',
            excerpt: 'Explore how AI agents are transforming workflow automation for businesses.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
            categories: ['AI Use Cases'],
            categorySlugs: ['ai-use-cases'],
            author: 'HyzenPro Team',
            authorSlug: 'hyzenpro-team',
            date: '2024-01-10',
            link: 'https://hyzenpro.com/ai-agents-and-workflow-automation/',
        },
        {
            id: '6',
            title: 'Submagic vs VEED: Which is Better?',
            slug: 'submagic-vs-veed',
            excerpt: 'A detailed comparison of Submagic and VEED.io for video subtitle generation.',
            content: '',
            featuredImage: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80',
            categories: ['Comparisons'],
            categorySlugs: ['comparisons'],
            author: 'HyzenPro Team',
            authorSlug: 'hyzenpro-team',
            date: '2024-01-08',
            link: 'https://hyzenpro.com/submagic-vs-veed/',
        },
    ];
}

function getDemoCategories(): Category[] {
    return [
        { id: '1', name: 'AI Automation Tools', slug: 'ai-automation-tools', count: 6, icon: '⚡', description: '' },
        { id: '2', name: 'AI Chatbots', slug: 'ai-chatbots', count: 5, icon: '🤖', description: '' },
        { id: '3', name: 'AI Coding Tools', slug: 'ai-coding-tools', count: 3, icon: '💻', description: '' },
        { id: '4', name: 'AI Design Tools', slug: 'ai-design-tools', count: 1, icon: '🎨', description: '' },
        { id: '5', name: 'AI Image Tools', slug: 'ai-image-tools', count: 3, icon: '🖼️', description: '' },
        { id: '6', name: 'AI Marketing Tools', slug: 'ai-marketing-tools', count: 2, icon: '📈', description: '' },
        { id: '7', name: 'AI Video Tools', slug: 'ai-video-tools', count: 3, icon: '🎬', description: '' },
        { id: '8', name: 'AI Voice Tools', slug: 'ai-voice-tools', count: 2, icon: '🎵', description: '' },
        { id: '9', name: 'AI Writing Tools', slug: 'ai-writing-tools', count: 2, icon: '✍️', description: '' },
        { id: '10', name: 'SEO Tools', slug: 'seo-tools', count: 1, icon: '🔍', description: '' },
        { id: '11', name: 'AI Website Builder', slug: 'ai-website-builder', count: 2, icon: '🌐', description: '' },
        { id: '12', name: 'AI Productivity Tools', slug: 'ai-productivity-tools', count: 4, icon: '📊', description: '' },
    ];
}
// JSON Data Helpers
export async function getXReviews(): Promise<XReview[]> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'x-reviews.json');
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(fileData).reviews;
        }
    } catch (error) {
        console.error('Error loading X reviews:', error);
    }
    return [];
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'authors.json');
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            const authors: Author[] = JSON.parse(fileData).authors;
            return authors.find(a => a.slug === slug) || null;
        }
    } catch (error) {
        console.error('Error loading author:', error);
    }
    return null;
}

export async function getPostAuthor(post: Post): Promise<Author | null> {
    // Try to match by slug first
    let author = await getAuthorBySlug(post.authorSlug);

    // Fallback: match by name if slug doesn't work (useful for default WordPress names)
    if (!author) {
        const filePath = path.join(process.cwd(), 'data', 'authors.json');
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            const authors: Author[] = JSON.parse(fileData).authors;
            author = authors.find(a => a.name.toLowerCase() === post.author.toLowerCase()) || null;
        }
    }

    return author;
}
