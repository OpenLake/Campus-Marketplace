// src/db/pgConnect.js
import pkg from 'pg';
const { Pool } = pkg;
import { initDatabase } from './initDb.js';

let pool;

const connectPostgres = async () => {
  try {
    // Initialize database (MongoDB and categories)
    await initDatabase();
    console.log('✅ Supabase REST API initialized');
    return null;
  } catch (error) {
    console.error('Database initialization error:', error);
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