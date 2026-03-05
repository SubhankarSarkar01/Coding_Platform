const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function initDB() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
    });

    console.log('Connected to MySQL Workbench...');

    await connection.query('CREATE DATABASE IF NOT EXISTS algomaster_db');
    await connection.query('USE algomaster_db');

    // Users table (already exists, but include for safety)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_admin TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User stats table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        xp INT DEFAULT 0,
        problems_solved INT DEFAULT 0,
        streak_days INT DEFAULT 0,
        last_active_date DATE,
        country VARCHAR(100) DEFAULT 'Unknown',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Questions / Problems table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
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

    // Submissions / activity table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        problem_slug VARCHAR(100) NOT NULL,
        problem_title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        status ENUM('Solved', 'Attempted') DEFAULT 'Attempted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ All tables created successfully in algomaster_db!');
    console.log('   - users');
    console.log('   - user_stats');
    console.log('   - categories');
    console.log('   - questions');
    console.log('   - submissions');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    process.exit(1);
  }
}

initDB();
