// Schema knowledge extracted from prisma/schema.prisma (MongoDB connector).
// This is the ONLY place the shim hardcodes model facts: collection names,
// ObjectId-typed fields, @default values, timestamps, compound uniques, and
// the relations the app actually hydrates via include/select/_count.
// Field name mapping: the only @map in the schema is id -> _id.

export type RelationKind =
    | 'idList'    // this model holds an ObjectId[] of target ids (Tool.categoryIds -> Category)
    | 'belongsTo' // this model holds a scalar ObjectId fk (Post.authorId -> Author)
    | 'fkList';   // target model holds the fk pointing back at us (Author.posts -> Post.authorId)

export type RelationMeta = {
    kind: RelationKind;
    model: string; // target model key in MODELS
    field: string; // fk/id-list field: on this model for idList/belongsTo, on the TARGET model for fkList
};

export type ModelMeta = {
    collection: string;
    objectIdFields?: string[];       // scalar String @db.ObjectId (besides id)
    objectIdArrayFields?: string[];  // String[] @db.ObjectId
    stringArrayFields?: string[];    // required String[] (implicit [] default)
    defaults?: Record<string, unknown>; // @default(...) values applied on create when absent
    hasCreatedAt?: boolean;
    hasUpdatedAt?: boolean;
    relations?: Record<string, RelationMeta>;
    compoundUnique?: Record<string, string[]>; // e.g. toolId_locale -> ['toolId', 'locale']
}

function meta(m: ModelMeta): ModelMeta {
    return m;
}

// ponytail: exported for selftest
export const MODELS: Record<string, ModelMeta> = {
    tool: meta({
        collection: 'Tool',
        objectIdFields: ['submittedById'],
        objectIdArrayFields: ['categoryIds', 'alternativeIds', 'personaPageIds', 'savedByUserIds'],
        stringArrayFields: ['features', 'pros', 'cons'],
        defaults: { pricingType: 'freemium', status: 'published', featured: false, views: 0, helpfulCount: 0 },
        hasCreatedAt: true,
        hasUpdatedAt: true,
        relations: {
            categories: { kind: 'idList', model: 'category', field: 'categoryIds' },
            personaPages: { kind: 'fkList', model: 'personaPage', field: 'toolIds' },
            savedByUsers: { kind: 'fkList', model: 'user', field: 'savedToolIds' },
        },
    }),
    category: meta({
        collection: 'Category',
        objectIdFields: ['parentId'],
        objectIdArrayFields: ['toolIds'],
        defaults: { toolCount: 0 },
        hasCreatedAt: true,
        hasUpdatedAt: true,
        relations: {
            tools: { kind: 'idList', model: 'tool', field: 'toolIds' },
        },
    }),
    personaPage: meta({
        collection: 'PersonaPage',
        objectIdArrayFields: ['toolIds'],
        defaults: { status: 'draft', sortOrder: 0 },
        hasCreatedAt: true,
        hasUpdatedAt: true,
        relations: {
            tools: { kind: 'idList', model: 'tool', field: 'toolIds' },
        },
    }),
    post: meta({
        collection: 'Post',
        objectIdFields: ['authorId'],
        stringArrayFields: ['categories', 'tags'],
        defaults: { author: 'HyzenPro Team', status: 'draft', postType: 'post', views: 0 },
        hasCreatedAt: true,
        hasUpdatedAt: true,
        relations: {
            authorModel: { kind: 'belongsTo', model: 'author', field: 'authorId' },
            revisions: { kind: 'fkList', model: 'postRevision', field: 'postId' },
        },
    }),
    postRevision: meta({
        collection: 'PostRevision',
        objectIdFields: ['postId'],
        defaults: { author: 'HyzenPro Team' },
        hasCreatedAt: true,
        relations: {
            post: { kind: 'belongsTo', model: 'post', field: 'postId' },
        },
    }),
    review: meta({
        collection: 'Review',
        stringArrayFields: ['pros', 'cons'],
        defaults: { author: 'HyzenPro Team', status: 'draft' },
        hasCreatedAt: true,
        hasUpdatedAt: true,
    }),
    user: meta({
        collection: 'User',
        objectIdArrayFields: ['savedToolIds'],
        defaults: {
            role: 'admin',
            isStackPublic: true,
            isTwoFactorEnabled: false,
            mustChangePassword: false,
            failedSignInAttempts: 0,
        },
        hasCreatedAt: true,
        hasUpdatedAt: true,
        relations: {
            savedTools: { kind: 'idList', model: 'tool', field: 'savedToolIds' },
        },
    }),
    session: meta({
        collection: 'Session',
        objectIdFields: ['userId'],
    }),
    verificationToken: meta({
        collection: 'VerificationToken',
    }),
    author: meta({
        collection: 'Author',
        hasCreatedAt: true,
        hasUpdatedAt: true,
        relations: {
            posts: { kind: 'fkList', model: 'post', field: 'authorId' },
        },
    }),
    mediaAsset: meta({
        collection: 'MediaAsset',
        objectIdFields: ['uploadedById'],
        hasCreatedAt: true,
        hasUpdatedAt: true,
    }),
    cTA: meta({
        collection: 'CTA',
        defaults: { style: 'default', isActive: true, usageCount: 0 },
        hasCreatedAt: true,
        hasUpdatedAt: true,
    }),
    siteContent: meta({
        collection: 'SiteContent',
        defaults: { enabled: true, sortOrder: 0 },
        hasCreatedAt: true,
        hasUpdatedAt: true,
    }),
    matcherLead: meta({
        collection: 'MatcherLead',
        defaults: { source: 'matcher-result' },
        hasCreatedAt: true,
    }),
    toolTranslation: meta({
        collection: 'ToolTranslation',
        objectIdFields: ['toolId'],
        defaults: { status: 'draft' },
        compoundUnique: { toolId_locale: ['toolId', 'locale'] },
        relations: {
            tool: { kind: 'belongsTo', model: 'tool', field: 'toolId' },
        },
    }),
    postTranslation: meta({
        collection: 'PostTranslation',
        objectIdFields: ['postId'],
        defaults: { status: 'draft' },
        compoundUnique: { postId_locale: ['postId', 'locale'] },
        relations: {
            post: { kind: 'belongsTo', model: 'post', field: 'postId' },
        },
    }),
    categoryTranslation: meta({
        collection: 'CategoryTranslation',
        objectIdFields: ['categoryId'],
        defaults: { status: 'draft' },
        compoundUnique: { categoryId_locale: ['categoryId', 'locale'] },
        relations: {
            category: { kind: 'belongsTo', model: 'category', field: 'categoryId' },
        },
    }),
    personaPageTranslation: meta({
        collection: 'PersonaPageTranslation',
        objectIdFields: ['personaPageId'],
        defaults: { status: 'draft' },
        compoundUnique: { personaPageId_locale: ['personaPageId', 'locale'] },
        relations: {
            personaPage: { kind: 'belongsTo', model: 'personaPage', field: 'personaPageId' },
        },
    }),
    activityLog: meta({
        collection: 'ActivityLog',
        objectIdFields: ['userId', 'entityId'],
        hasCreatedAt: true,
    }),
};

export function getModelMeta(model: string): ModelMeta {
    const m = MODELS[model];
    if (!m) {
        throw new Error(`[mongo-shim] Unknown model "${model}". Add it to lib/mongo/meta.ts.`);
    }
    return m;
}
