import fs from 'fs';
import readline from 'readline';

const SQL_FILE = 'F:/main theme files/u877492871_IIX2y.20260227173427.sql/u877492871_IIX2y.sql';

async function auditSql() {
    console.log('Auditing SQL file: ' + SQL_FILE);
    const fileStream = fs.createReadStream(SQL_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const tables = {};
    let currentTable = null;

    for await (const line of rl) {
        if (line.startsWith('-- Table structure for table `')) {
            const tableName = line.match(/`([^`]+)`/)[1];
            tables[tableName] = { create: true, inserts: 0 };
            currentTable = tableName;
        } else if (line.startsWith('INSERT INTO `')) {
            const tableName = line.match(/`([^`]+)`/)[1];
            if (!tables[tableName]) tables[tableName] = { create: false, inserts: 0 };
            // Count rows in this INSERT (very rough approximation by counting commas but SQL is complex)
            // Better: just count the number of INSERT statements
            tables[tableName].inserts++;
        }
    }

    console.log('\nTable Audit (Full List):');
    Object.entries(tables).forEach(([name, stats]) => {
        if (name.includes('tool') || name.includes('ai')) {
            console.log(`[MATCH] ${name}: ${stats.inserts} inserts`);
        } else {
            console.log(`${name}: ${stats.inserts} inserts`);
        }
    });

}

auditSql().catch(console.error);
