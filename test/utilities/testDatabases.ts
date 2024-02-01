export const allDatabases = ['sqlite3', 'mysql', 'maria', 'postgres'];
export const testDatabases = process.env.TEST_DB?.split(',').map((v) => v.trim()) ?? allDatabases;