const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function migrate() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Running admin panel migration...');

  // Add is_admin to users (compatible approach)
  const [cols] = await c.query("SHOW COLUMNS FROM users LIKE 'is_admin'");
  if (cols.length === 0) {
    await c.query('ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0');
  }

  // Categories table
  await c.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Questions table (renamed from problems)
  await c.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      difficulty ENUM('Easy','Medium','Hard') DEFAULT 'Medium',
      description TEXT,
      constraints TEXT,
      algorithm_steps TEXT,
      starter_code TEXT,
      solution_code TEXT,
      youtube_link VARCHAR(500),
      is_active TINYINT(1) DEFAULT 1,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      input_json TEXT,
      frames_json LONGTEXT,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Seed default categories
  await c.query(`
    INSERT IGNORE INTO categories (name, slug, description) VALUES
      ('Searching', 'searching', 'Search algorithms like Linear and Binary Search'),
      ('Sorting', 'sorting', 'Sorting algorithms like Bubble, Merge, Quick Sort'),
      ('Trees', 'trees', 'Tree data structures and traversals'),
      ('Graphs', 'graphs', 'Graph algorithms like BFS and DFS')
  `);

  console.log('✅ Admin migration complete!');
  console.log('   + users.is_admin column');
  console.log('   + categories table (seeded)');
  console.log('   + questions table');
  process.exit(0);
}

migrate().catch(e => { console.error('❌', e.message); process.exit(1); });
