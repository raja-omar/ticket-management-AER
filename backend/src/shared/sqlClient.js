const sql = require('mssql');

const config = {
    server: process.env.SQL_SERVER || 'localhost',
    database: process.env.SQL_DATABASE || 'AER',
    user: process.env.SQL_USER || 'sa',
    password: process.env.SQL_PASSWORD || '',
    port: parseInt(process.env.SQL_PORT || '1433'),
    options: {
        encrypt: process.env.SQL_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQL_TRUST_CERT !== 'false',
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

async function getPool() {
    if (pool) {
        return pool;
    }

    try {
        pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        return pool;
    } catch (error) {
        console.error('Failed to connect to SQL Server:', error);
        throw error;
    }
}

async function executeQuery(query, params = {}) {
    const pool = await getPool();
    const request = pool.request();

    for (const [name, value] of Object.entries(params)) {
        request.input(name, value);
    }

    return await request.query(query);
}

async function closePool() {
    if (pool) {
        await pool.close();
        pool = null;
        console.log('SQL Server connection pool closed');
    }
}

module.exports = { 
    getPool, 
    executeQuery, 
    closePool,
    sql
};
