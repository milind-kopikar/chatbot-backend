const { Pool } = require('pg');
require('dotenv').config();

// Create a singleton pool instance
let pool = null;

/**
 * Get or create a database connection pool
 */
function getPool() {
    if (!pool) {
        pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'konkani_dictionary',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });

        pool.on('error', (err) => {
            console.error('Unexpected error on idle database client', err);
        });
    }
    return pool;
}

/**
 * Execute a query with parameters
 */
async function query(text, params) {
    const pool = getPool();
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Close the pool (useful for cleanup)
 */
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}

module.exports = {
    getPool,
    query,
    closePool
};
