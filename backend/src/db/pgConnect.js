// src/db/pgConnect.js
import pkg from 'pg';
const { Pool } = pkg;
import { initDatabase } from './initDb.js';

let pool;

const connectPostgres = async () => {
  try {
    // Initialize database and get connection pool
    pool = await initDatabase();
    
    console.log('📊 PostgreSQL connected successfully');
     
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error:', err);
    });
    
    return pool;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectPostgres first.');
  }
  return pool;
};

export { connectPostgres, getPool };