import pool from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Running links table migration...');
    
    const sql = fs.readFileSync(path.join(__dirname, 'add_links_table.sql'), 'utf8');
    await pool.query(sql);
    
    console.log('✅ Links table migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
