const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function createTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Creating LeetCode-style tables...');

  try {
    // Problems table (enhanced)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS problems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        input_format TEXT,
        output_format TEXT,
        constraints TEXT,
        difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
        category VARCHAR(100),
        examples JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Test cases table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS test_cases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        problem_id INT NOT NULL,
        input TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        label ENUM('basic', 'edge', 'stress', 'null', 'negative') DEFAULT 'basic',
        is_hidden TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
      )
    `);

    // Submissions table (enhanced)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS code_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        problem_id INT NOT NULL,
        language VARCHAR(50) NOT NULL,
        code TEXT NOT NULL,
        status ENUM('accepted', 'wrong_answer', 'time_limit_exceeded', 'compile_error', 'runtime_error') NOT NULL,
        runtime_ms INT,
        memory_kb INT,
        test_results JSON,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
        INDEX idx_user_problem (user_id, problem_id),
        INDEX idx_status (status)
      )
    `);

    // Test run sessions (for tracking test runs before submission)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS test_run_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        problem_id INT NOT NULL,
        language VARCHAR(50) NOT NULL,
        code TEXT NOT NULL,
        test_results JSON,
        all_passed TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ All tables created successfully!');
    console.log('   - problems (enhanced)');
    console.log('   - test_cases');
    console.log('   - code_submissions');
    console.log('   - test_run_sessions');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  }

  await connection.end();
  process.exit(0);
}

createTables();
