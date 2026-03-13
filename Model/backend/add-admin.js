const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function addAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Adding admin user...');

  const email = 'subhankar@gmail.com';
  const password = 'Subh@8617';
  const name = 'Subhankar';

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if user already exists
    const [existing] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      // Update existing user to admin
      await connection.query(
        'UPDATE users SET is_admin = 1, password_hash = ? WHERE email = ?',
        [hashedPassword, email]
      );
      console.log('✅ Updated existing user to admin:', email);
    } else {
      // Insert new admin user
      await connection.query(
        'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 1)',
        [name, email, hashedPassword]
      );
      console.log('✅ Created new admin user:', email);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  await connection.end();
  console.log('✅ Admin setup complete!');
  process.exit(0);
}

addAdmin().catch(e => { 
  console.error('❌', e.message); 
  process.exit(1); 
});
