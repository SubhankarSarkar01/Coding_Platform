const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function initLeetCodeSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'algomaster_db',
    });

    console.log('Connected to MySQL...');

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
        test_cases_passed INT DEFAULT 0,
        test_cases_total INT DEFAULT 0,
        error_message TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
        INDEX idx_user_problem (user_id, problem_id),
        INDEX idx_status (status)
      )
    `);

    // Test results table (stores individual test case results)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS test_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL,
        test_case_id INT NOT NULL,
        passed TINYINT(1) NOT NULL,
        actual_output TEXT,
        runtime_ms INT,
        memory_kb INT,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES code_submissions(id) ON DELETE CASCADE,
        FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ LeetCode-style schema created successfully!');
    console.log('   - problems table');
    console.log('   - test_cases table');
    console.log('   - code_submissions table');
    console.log('   - test_results table');

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error initializing schema:', err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initLeetCodeSchema();
