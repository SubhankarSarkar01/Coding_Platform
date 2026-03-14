const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function addCodeColumns() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'algomaster_db',
      port: process.env.DB_PORT || 3306,
    });

    console.log('Connected to MySQL...');
    console.log('Adding code and language columns to submissions table...');

    // Check if columns already exist
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM submissions LIKE 'code'
    `);

    if (columns.length === 0) {
      // Add code column
      await connection.query(`
        ALTER TABLE submissions 
        ADD COLUMN code LONGTEXT NULL AFTER status
      `);
      console.log('✅ Added "code" column');
    } else {
      console.log('ℹ️  "code" column already exists');
    }

    // Check if language column exists
    const [langColumns] = await connection.query(`
      SHOW COLUMNS FROM submissions LIKE 'language'
    `);

    if (langColumns.length === 0) {
      // Add language column
      await connection.query(`
        ALTER TABLE submissions 
        ADD COLUMN language VARCHAR(50) DEFAULT 'javascript' AFTER code
      `);
      console.log('✅ Added "language" column');
    } else {
      console.log('ℹ️  "language" column already exists');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('   Submissions table now stores:');
    console.log('   - User submitted code');
    console.log('   - Programming language used');
    
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

addCodeColumns();
