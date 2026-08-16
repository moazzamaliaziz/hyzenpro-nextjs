// Migration script to create translation collections in MongoDB
// Run: node scripts/migrate-translations.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating translation collections...\n');

  // Create indexes for each translation model
  try {
    await prisma.$runCommandRaw({
      createIndexes: 'ToolTranslation',
      indexes: [
        {
          key: { toolId: 1, locale: 1 },
          name: 'toolId_locale_unique',
          unique: true
        }
      ]
    });
    console.log('✅ ToolTranslation indexes created');
  } catch (e) {
    console.log('⚠️ ToolTranslation indexes may already exist:', e.message);
  }

  try {
    await prisma.$runCommandRaw({
      createIndexes: 'PostTranslation',
      indexes: [
        {
          key: { postId: 1, locale: 1 },
          name: 'postId_locale_unique',
          unique: true
        }
      ]
    });
    console.log('✅ PostTranslation indexes created');
  } catch (e) {
    console.log('⚠️ PostTranslation indexes may already exist:', e.message);
  }

  try {
    await prisma.$runCommandRaw({
      createIndexes: 'CategoryTranslation',
      indexes: [
        {
          key: { categoryId: 1, locale: 1 },
          name: 'categoryId_locale_unique',
          unique: true
        }
      ]
    });
    console.log('✅ CategoryTranslation indexes created');
  } catch (e) {
    console.log('⚠️ CategoryTranslation indexes may already exist:', e.message);
  }

  try {
    await prisma.$runCommandRaw({
      createIndexes: 'PersonaPageTranslation',
      indexes: [
        {
          key: { personaPageId: 1, locale: 1 },
          name: 'personaPageId_locale_unique',
          unique: true
        }
      ]
    });
    console.log('✅ PersonaPageTranslation indexes created');
  } catch (e) {
    console.log('⚠️ PersonaPageTranslation indexes may already exist:', e.message);
  }

  console.log('\n✅ Migration complete! Translation models are ready.');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
