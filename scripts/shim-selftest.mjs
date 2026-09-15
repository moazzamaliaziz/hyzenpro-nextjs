// Sanity checks for the Prisma->Mongo translation layer. No framework, no Next:
// run with `node --import tsx scripts/shim-selftest.mjs`.
// Exercises only the pure helpers exported from lib/mongo/translate.ts.

import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
// tsx compiles the TS helpers to CJS under this package.json, so we grab the
// default (module.exports) and destructure — named imports would fail interop.
import translateModule from '../lib/mongo/translate.ts';
import clientModule from '../lib/mongo/client.ts';
const {
    translateWhere,
    translateOrderBy,
    translateCreateData,
    translateUpdateData,
    mapDocToPrisma,
    stripUndefined,
    escapeRegex,
} = translateModule;
const { resolveDbName } = clientModule;

const OID = '507f1f77bcf86cd799439011';
const oid = (hex) => new ObjectId(hex);
// mongodb ships separate ESM/CJS builds, so `instanceof` is unreliable across
// the tsx/CJS boundary - use the BSON type marker instead.
const isOid = (v) => v !== null && typeof v === 'object' && v._bsontype === 'ObjectId';

let passed = 0;
function check(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`  ok  ${name}`);
    } catch (err) {
        console.error(`FAIL  ${name}`);
        console.error(err);
        process.exitCode = 1;
    }
}

// ── where ───────────────────────────────────────────────────────────────────

check('id equality becomes _id ObjectId', () => {
    const out = translateWhere('tool', { id: OID });
    assert.deepEqual(Object.keys(out), ['_id']);
    assert.ok(isOid(out._id) && out._id.equals(oid(OID)));
});

check('non-ObjectId id string is matched as-is', () => {
    const out = translateWhere('post', { id: 'dedicated-not-an-objectid' });
    assert.equal(out._id, 'dedicated-not-an-objectid');
});

check('unique field equality stays a string', () => {
    assert.deepEqual(translateWhere('user', { email: 'a@b.c' }), { email: 'a@b.c' });
    assert.deepEqual(translateWhere('tool', { slug: 'midjourney' }), { slug: 'midjourney' });
});

check('OR maps to $or', () => {
    const out = translateWhere('tool', {
        OR: [{ primaryCategory: 'ai-video-tools' }, { categoryIds: { has: OID } }],
    });
    assert.deepEqual(out, {
        $or: [{ primaryCategory: 'ai-video-tools' }, { categoryIds: oid(OID) }],
    });
});

check('NOT maps to $nor', () => {
    assert.deepEqual(translateWhere('post', { NOT: { status: 'trash' } }), { $nor: [{ status: 'trash' }] });
});

check('has on ObjectId[] becomes direct value match', () => {
    const out = translateWhere('tool', { categoryIds: { has: OID } });
    assert.ok(isOid(out.categoryIds) && out.categoryIds.equals(oid(OID)));
});

check('hasSome on String[] becomes $in', () => {
    assert.deepEqual(
        translateWhere('post', { categories: { hasSome: ['Reviews', 'AI'] } }),
        { categories: { $in: ['Reviews', 'AI'] } }
    );
});

check('hasSome on ObjectId[] converts members', () => {
    const out = translateWhere('tool', { personaPageIds: { hasSome: [OID, OID] } });
    assert.ok(Array.isArray(out.personaPageIds.$in) && out.personaPageIds.$in.every(isOid));
});

check('contains + insensitive escapes regex metacharacters', () => {
    const out = translateWhere('tool', { name: { contains: 'a.b*c[d](e)f', mode: 'insensitive' } });
    assert.deepEqual(out, { name: { $regex: 'a\\.b\\*c\\[d\\]\\(e\\)f', $options: 'i' } });
});

check('contains without mode has no $options', () => {
    const out = translateWhere('post', { content: { contains: 'plain' } });
    assert.deepEqual(out, { content: { $regex: 'plain' } });
});

check('startsWith anchors at ^', () => {
    const out = translateWhere('tool', { name: { startsWith: 'Gpt.5' } });
    assert.deepEqual(out, { name: { $regex: '^Gpt\\.5' } });
});

check('lte on Date passes through', () => {
    const now = new Date('2026-09-15T00:00:00Z');
    assert.deepEqual(translateWhere('post', { scheduledAt: { lte: now } }), { scheduledAt: { $lte: now } });
});

check('not becomes $ne with ObjectId conversion', () => {
    const out = translateWhere('tool', { id: { not: OID } });
    assert.ok(isOid(out._id.$ne) && out._id.$ne.equals(oid(OID)));
    assert.deepEqual(translateWhere('post', { slug: { not: 'x' } }), { slug: { $ne: 'x' } });
});

check('in on ObjectId field converts members', () => {
    const out = translateWhere('tool', { id: { in: [OID, 'not-an-oid'] } });
    assert.equal(out._id.$in.length, 2);
    assert.ok(isOid(out._id.$in[0]) && out._id.$in[0].equals(oid(OID)));
    assert.equal(out._id.$in[1], 'not-an-oid');
});

check('in on plain string field stays strings', () => {
    assert.deepEqual(translateWhere('siteContent', { sectionId: { in: ['a', 'b'] } }), { sectionId: { $in: ['a', 'b'] } });
});

check('null equality passes through (matches null/missing)', () => {
    assert.deepEqual(translateWhere('post', { authorId: null }), { authorId: null });
});

check('ObjectId scalar field equality converts', () => {
    const out = translateWhere('post', { authorId: OID });
    assert.ok(isOid(out.authorId) && out.authorId.equals(oid(OID)));
});

check('undefined where values are skipped', () => {
    assert.deepEqual(translateWhere('tool', { slug: undefined, status: 'published' }), { status: 'published' });
});

check('compound unique expands to field equalities', () => {
    const out = translateWhere('toolTranslation', { toolId_locale: { toolId: OID, locale: 'es' } });
    assert.ok(isOid(out.toolId) && out.toolId.equals(oid(OID)));
    assert.equal(out.locale, 'es');
});

// ── orderBy ─────────────────────────────────────────────────────────────────

check('orderBy object maps to sort doc', () => {
    assert.deepEqual(translateOrderBy({ createdAt: 'desc' }), { createdAt: -1 });
    assert.deepEqual(translateOrderBy({ sortOrder: 'asc' }), { sortOrder: 1 });
});

check('orderBy array maps to compound sort doc', () => {
    assert.deepEqual(
        translateOrderBy([{ featured: 'desc' }, { rating: 'desc' }, { name: 'asc' }]),
        { featured: -1, rating: -1, name: 1 }
    );
});

// ── create data ─────────────────────────────────────────────────────────────

check('create applies schema defaults, empty arrays and timestamps', () => {
    const doc = translateCreateData('tool', { name: 'X', slug: 'x', shortDescription: 's', longDescription: 'l', websiteUrl: 'https://x' });
    assert.equal(doc.pricingType, 'freemium');
    assert.equal(doc.status, 'published');
    assert.equal(doc.featured, false);
    assert.equal(doc.views, 0);
    assert.equal(doc.helpfulCount, 0);
    assert.deepEqual(doc.categoryIds, []);
    assert.deepEqual(doc.personaPageIds, []);
    assert.deepEqual(doc.features, []);
    assert.ok(doc.createdAt instanceof Date);
    assert.ok(doc.updatedAt instanceof Date);
    assert.equal('_id' in doc, false);
});

check('create keeps provided values and converts ObjectId arrays', () => {
    const doc = translateCreateData('tool', {
        name: 'X', slug: 'x', status: 'draft',
        categoryIds: [OID], views: 7,
        meta: { a: 1, keep: undefined },
    });
    assert.equal(doc.status, 'draft');
    assert.equal(doc.views, 7);
    assert.ok(isOid(doc.categoryIds[0]));
    assert.deepEqual(doc.meta, { a: 1 }); // undefined dropped, Prisma-style
});

check('create with explicit id maps to _id ObjectId', () => {
    const doc = translateCreateData('siteContent', { id: OID, sectionId: 'hero' });
    assert.ok(isOid(doc._id) && doc._id.equals(oid(OID)));
    assert.equal(doc.enabled, true);
    assert.equal(doc.sortOrder, 0);
});

check('create converts scalar ObjectId fk', () => {
    const doc = translateCreateData('post', { title: 't', slug: 's', content: 'c', authorId: OID });
    assert.ok(isOid(doc.authorId));
});

// ── update data ─────────────────────────────────────────────────────────────

check('increment becomes $inc and stamps updatedAt', () => {
    const out = translateUpdateData('tool', { views: { increment: 1 } });
    assert.deepEqual(out.$inc, { views: 1 });
    assert.ok(out.$set.updatedAt instanceof Date);
    assert.equal(Object.keys(out.$set).length, 1);
});

check('push on ObjectId array converts the value', () => {
    const out = translateUpdateData('user', { savedToolIds: { push: OID } });
    assert.ok(isOid(out.$push.savedToolIds) && out.$push.savedToolIds.equals(oid(OID)));
    assert.ok(out.$set.updatedAt instanceof Date);
});

check('set operator on ObjectId array converts members', () => {
    const out = translateUpdateData('tool', { personaPageIds: { set: [] } });
    assert.deepEqual(out.$set.personaPageIds, []);
});

check('plain array overwrite converts members', () => {
    const out = translateUpdateData('user', { savedToolIds: [OID, 'x'] });
    assert.ok(isOid(out.$set.savedToolIds[0]));
    assert.equal(out.$set.savedToolIds[1], 'x');
});

check('null values are kept in $set', () => {
    const out = translateUpdateData('user', { lockoutUntil: null, failedSignInAttempts: 0 });
    assert.equal(out.$set.lockoutUntil, null);
    assert.equal(out.$set.failedSignInAttempts, 0);
});

check('explicit updatedAt is honored', () => {
    const when = new Date('2026-01-01T00:00:00Z');
    const out = translateUpdateData('post', { updatedAt: when, title: 't' });
    assert.equal(out.$set.updatedAt, when);
});

check('empty update data is a no-op (null)', () => {
    assert.equal(translateUpdateData('siteContent', {}), null);
    assert.equal(translateUpdateData('siteContent', { title: undefined }), null);
});

// ── result mapping ──────────────────────────────────────────────────────────

check('mapDocToPrisma converts _id and ObjectId arrays to strings', () => {
    const doc = {
        _id: oid(OID),
        name: 'X',
        categoryIds: [oid(OID)],
        savedByUserIds: [],
        createdAt: new Date(),
    };
    const out = mapDocToPrisma('tool', doc);
    assert.equal(out.id, OID);
    assert.equal('_id' in out, false);
    assert.deepEqual(out.categoryIds, [OID]);
    assert.ok(out.createdAt instanceof Date);
});

check('mapDocToPrisma converts scalar ObjectId fk to string', () => {
    const out = mapDocToPrisma('post', { _id: oid(OID), authorId: oid(OID) });
    assert.equal(out.authorId, OID);
});

check('mapDocToPrisma leaves embedded objects alone', () => {
    const seo = { metaTitle: 't', noIndex: null };
    const out = mapDocToPrisma('tool', { _id: oid(OID), seo });
    assert.equal(out.seo, seo);
});

// ── misc ────────────────────────────────────────────────────────────────────

check('escapeRegex handles the basics', () => {
    assert.equal(escapeRegex('.*[](){}^$|+?\\'), '\\.\\*\\[\\]\\(\\)\\{\\}\\^\\$\\|\\+\\?\\\\');
});

check('stripUndefined is deep', () => {
    assert.deepEqual(stripUndefined({ a: 1, b: undefined, c: { d: undefined, e: [1, undefined] } }), {
        a: 1,
        c: { e: [1, undefined] },
    });
});

check('resolveDbName parses Atlas URIs', () => {
    assert.equal(resolveDbName('mongodb+srv://u:p@cluster.x.mongodb.net/hyzenpro?retryWrites=true'), 'hyzenpro');
    assert.equal(resolveDbName('mongodb://u:p@localhost:27017/mydb'), 'mydb');
    assert.equal(resolveDbName('mongodb://localhost:27017'), null);
});

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures above)' : ''}.`);
