/**
 * Database connection for CredVerse applications
 * Uses Drizzle ORM with PostgreSQL
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

/**
 * Initialize database connection
 * Falls back to in-memory storage if DATABASE_URL is not set
 */
export function initDatabase(): ReturnType<typeof drizzle> | null {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.warn('[Database] DATABASE_URL not set, using in-memory storage');
        return null;
    }

    if (!pool) {
        pool = new Pool({
            connectionString: databaseUrl,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        pool.on('error', (err) => {
            console.error('[Database] Unexpected error on idle client', err);
        });

        db = drizzle(pool);
        console.log('[Database] Connected to PostgreSQL');
    }

    return db;
}

/**
 * Get the database instance
 */
export function getDatabase(): ReturnType<typeof drizzle> | null {
    return db;
}

/**
 * Check if database is available
 */
export function isDatabaseAvailable(): boolean {
    return db !== null;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
        db = null;
        console.log('[Database] Connection closed');
    }
}

export { Pool };
