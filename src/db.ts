import pg, {QueryConfig, QueryResultRow} from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'ardine',
    password: process.env.POSTGRES_PASSWORD || '',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
<<<<<<< Updated upstream
=======
    ssl: (process.env.POSTGRES_HOST && process.env.POSTGRES_HOST !== 'localhost' && process.env.POSTGRES_HOST !== 'db') 
        ? { rejectUnauthorized: false } 
        : undefined,
>>>>>>> Stashed changes
});

export const query = <T extends QueryResultRow = any>(text: string | QueryConfig<any>, params?: any) => pool.query<T>(text, params);