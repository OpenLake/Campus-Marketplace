// src/db/initDb.js
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a connection pool for administrative tasks (connecting to default 'postgres' db)
const adminPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: 'postgres', // Connect to default postgres database
});

// Connection pool for your application database
let appPool;

const initDatabase = async () => {
  console.log('🚀 Initializing database...');
  
  try {
    // 1. Check if application database exists, create if not
    const dbName = process.env.PG_DATABASE || 'campus_marketplace';
    
    const checkDb = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    
    if (checkDb.rowCount === 0) {
      console.log(`📦 Creating database: ${dbName}`);
      // Note: CREATE DATABASE cannot be parameterized
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log('✅ Database created successfully');
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }
    
    // Close admin connection
    await adminPool.end();
    
    // 2. Now connect to the application database
    appPool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT || 5432,
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || 'postgres',
      database: dbName,
    });
    
    // 3. Read and execute the schema SQL file
    console.log('📝 Creating/updating tables...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'init.sql'),
      'utf8'
    );
    
    // Split SQL into individual statements and execute
    const statements = schemaSQL
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    for (let statement of statements) {
      if (statement.trim()) {
        await appPool.query(statement);
      }
    }
    
    console.log('✅ Tables created/verified successfully');
    
    // 4. Test the connection
    const testResult = await appPool.query('SELECT NOW()');
    console.log(`🕐 Database time: ${testResult.rows[0].now}`);
    
    return appPool;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1); // Exit if database initialization fails
  }
};

export { initDatabase, appPool };